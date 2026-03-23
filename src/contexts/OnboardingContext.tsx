import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  saveOnboardingData,
  getLatestTourSites,
  getProfileByPhone,
  LandingPageRecord,
  loadLandingRecord,
  parseDescriptionPayload
} from "@/lib/onboardingService";
import { buildTourSiteSlug, slugifyDisplayName } from "@/lib/share";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingContextType {
  profileData: any;
  setProfileData: React.Dispatch<React.SetStateAction<any>>;
  photosData: any;
  setPhotosData: React.Dispatch<React.SetStateAction<any>>;
  tourData: any;
  setTourData: React.Dispatch<React.SetStateAction<any>>;
  landingSlug: string | undefined;
  setLandingSlug: React.Dispatch<React.SetStateAction<string | undefined>>;
  isPublishing: boolean;
  restoringSession: boolean;
  handlePublish: () => Promise<boolean>;
  resetOnboarding: () => void;
  latestTours: LandingPageRecord[];
  aiResult: any;
  setAiResult: React.Dispatch<React.SetStateAction<any>>;
}

const VENDOR_PHONE_KEY = "akwantuo_vendor_phone";

export const saveVendorPhone = (phone: string) => {
  try { localStorage.setItem(VENDOR_PHONE_KEY, phone); } catch { }
};

export const loadVendorPhone = (): string | null => {
  try { return localStorage.getItem(VENDOR_PHONE_KEY); } catch { return null; }
};

export const clearVendorPhone = () => {
  try { localStorage.removeItem(VENDOR_PHONE_KEY); } catch { }
};

const DEFAULT_PROFILE = {
  displayName: "",
  location: "",
  phone: "",
  bio: "",
  languages: ["English", "Twi"],
};

const DEFAULT_PHOTOS = {
  mainPhoto: "",
  gallery: [] as string[],
};

const DEFAULT_TOUR = {
  title: "",
  duration: "1h",
  price: "0.00",
  description: "",
  highlights: ["Knowledgeable Guide", "Hidden Gems", "Authentic Experience"],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE);
  const [photosData, setPhotosData] = useState(DEFAULT_PHOTOS);
  const [tourData, setTourData] = useState(DEFAULT_TOUR);
  const [landingSlug, setLandingSlug] = useState<string>();
  const [isPublishing, setIsPublishing] = useState(false);
  const [restoringSession, setRestoringSession] = useState(false);
  const [latestTours, setLatestTours] = useState<LandingPageRecord[]>([]);
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    getLatestTourSites(6).then(setLatestTours);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const savedPhone = loadVendorPhone();
    if (!savedPhone) return;

    const restoreSession = async () => {
      setRestoringSession(true);
      try {
        const profile = await getProfileByPhone(savedPhone);
        if (!profile) {
          clearVendorPhone();
          setRestoringSession(false);
          return;
        }

        const storefront = await supabase
          .from("storefronts")
          .select("*")
          .eq("user_id", profile.user_id)
          .maybeSingle();

        const description = parseDescriptionPayload(storefront.data?.description || null);

        setProfileData((prev: any) => ({
          ...prev,
          userId: profile.user_id,
          phone: savedPhone,
          displayName: profile.display_name || storefront.data?.business_name || "",
          location: profile.location || storefront.data?.location || "",
          bio: profile.bio || description.bio || "",
          languages: description.languages.length > 0 ? description.languages : ["English", "Twi"],
        }));

        setTourData((prev: any) => ({
          ...prev,
          title: profile.business_category || storefront.data?.category || prev.title,
          description: description.text || prev.description,
          highlights: description.highlights || prev.highlights,
          price: description.price || prev.price,
          duration: description.duration || prev.duration,
        }));

        if (storefront.data) {
          setPhotosData({
            mainPhoto: storefront.data.main_image || description.mainPhoto || "",
            gallery: storefront.data.gallery || description.gallery || [],
          });

          const slug = buildTourSiteSlug(storefront.data.business_name, storefront.data.user_id);
          setLandingSlug(slug);
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
      } finally {
        setRestoringSession(false);
      }
    };

    restoreSession();
  }, []);

  const resetOnboarding = useCallback(() => {
    setProfileData(DEFAULT_PROFILE);
    setPhotosData(DEFAULT_PHOTOS);
    setTourData(DEFAULT_TOUR);
    setLandingSlug(undefined);
  }, []);

  const handlePublish = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = user ?? session?.user;
    const effectiveUser = currentUser || profileData.phone;

    if (!effectiveUser) {
      console.warn("Publishing blocked: No effective user identified.", { currentUser, phone: profileData.phone });
      toast.info("Please verify your phone number to publish your tours page.");
      return false;
    }

    setIsPublishing(true);
    try {
      console.log("Publishing tour site with:", { effectiveUser, profileData, tourData });
      const record = await saveOnboardingData(effectiveUser, profileData, tourData, photosData);
      console.log("Publishing success - record returned:", record);
      setLandingSlug(record.slug);
      setProfileData((prev: any) => ({
        ...prev,
        userId: record.storefront.user_id
      }));
      return true;
    } catch (error: any) {
      console.error("Publishing error:", error);
      toast.error(error?.message || "Could not save your tour site.");
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [user, profileData, tourData, photosData]);

  return (
    <OnboardingContext.Provider value={{
      profileData, setProfileData,
      photosData, setPhotosData,
      tourData, setTourData,
      landingSlug, setLandingSlug,
      isPublishing,
      restoringSession,
      handlePublish,
      resetOnboarding,
      latestTours,
      aiResult,
      setAiResult
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("Use Onboarding Context is required");
  }
  return context;
};

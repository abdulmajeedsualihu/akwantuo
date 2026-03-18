import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import HeroLanding from "@/components/HeroLanding";
import OnboardingPhone from "@/components/OnboardingPhone";
import ProfileDetails from "@/components/ProfileDetails";
import PhotoUpload from "@/components/PhotoUpload";
import FirstTour from "@/components/FirstTour";
import OnboardingPreview from "@/components/OnboardingPreview";
import OnboardingSuccess from "@/components/OnboardingSuccess";
import CustomizationPanel, { StoreData } from "@/components/CustomizationPanel";
import StorePreview from "@/components/StorePreview";
import ViewToggle from "@/components/ViewToggle";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { saveOnboardingData, getLatestTourSites, LandingPageRecord } from "@/lib/onboardingService";
import { supabase } from "@/integrations/supabase/client";

type Step = "landing" | "phone" | "profile" | "photos" | "first-tour" | "preview" | "success" | "dashboard";
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

const Index = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(user ? "profile" : "landing");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [liteMode, setLiteMode] = useState(false);

  const [profileData, setProfileData] = useState(DEFAULT_PROFILE);

  const [photosData, setPhotosData] = useState(DEFAULT_PHOTOS);

  const [tourData, setTourData] = useState(DEFAULT_TOUR);

  const [isPublishing, setIsPublishing] = useState(false);
  const [landingSlug, setLandingSlug] = useState<string>();
  const [latestTours, setLatestTours] = useState<LandingPageRecord[]>([]);

  useEffect(() => {
    if (step === "landing") {
      getLatestTourSites(6).then(setLatestTours);
    }
  }, [step]);
  const persistOnboarding = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = user ?? session?.user;

    // Allow publishing if we have a session OR if we've verified a phone number (demo mode)
    const effectiveUser = currentUser || profileData.phone;

    if (!effectiveUser) {
      toast.info("Please verify your phone number to publish your tours page.");
      setStep("phone");
      return null;
    }

    setIsPublishing(true);
    try {
      const record = await saveOnboardingData(effectiveUser, profileData, tourData, photosData);
      setLandingSlug(record.slug);
      return record;
    } catch (error: any) {
      console.error("Publishing error:", error);
      const errorMessage = error?.message || error?.details || "Could not save your tour site. Please try again.";
      toast.error(errorMessage);
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [user, profileData, tourData, photosData, setStep]);

  const handlePublish = useCallback(async () => {
    const record = await persistOnboarding();
    if (record) {
      setStep("success");
    }
  }, [persistOnboarding]);

  if (step === "landing") {
    return <HeroLanding onGetStarted={() => setStep("phone")} latestTours={latestTours} />;
  }

  if (step === "phone") {
    return (
      <OnboardingPhone
        onComplete={(phone: string, profileData: any) => {
          setProfileData((prev) => ({
            ...prev,
            phone,
            displayName: profileData?.displayName || prev.displayName,
            location: profileData?.location || prev.location,
          }));
          setStep("profile");
        }}
      />
    );
  }

  if (step === "profile") {
    return (
      <ProfileDetails
        initialData={profileData}
        onBack={() => setStep("phone")}
        onContinue={(data) => {
          setProfileData(prev => ({ ...prev, ...data }));
          setStep("photos");
        }}
      />
    );
  }

  if (step === "photos") {
    return (
      <PhotoUpload
        onBack={() => setStep("profile")}
        onContinue={(data) => {
          setPhotosData(data);
          setStep("first-tour");
        }}
        onSkip={() => setStep("first-tour")}
      />
    );
  }

  if (step === "first-tour") {
    return (
      <FirstTour
        initialData={tourData}
        onBack={() => setStep("photos")}
        onContinue={(data) => {
          setTourData(data);
          setStep("preview");
        }}
      />
    );
  }

  if (step === "preview") {
    return (
      <OnboardingPreview
        data={{ ...profileData, ...photosData, tour: tourData }}
        onBack={() => setStep("first-tour")}
        onEdit={() => setStep("profile")}
        onPublish={handlePublish}
        publishing={isPublishing}
      />
    );
  }

  if (step === "success") {
    return (
      <OnboardingSuccess
        displayName={profileData.displayName}
        slug={landingSlug}
        onDone={() => setStep("dashboard")}
        onShare={() => toast.info("Sharing on WhatsApp...")}
      />
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen pb-24 bg-[#f8fafc]">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-navy flex items-center justify-center overflow-hidden">
              {photosData.mainPhoto ? (
                <img src={photosData.mainPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-white uppercase">
                  {profileData.displayName[0] || "A"}
                </span>
              )}
            </div>
            <div>
              <p className="text-[15px] font-bold text-charcoal leading-none">{profileData.displayName || "Akwantuo Guide"}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiteMode(!liteMode)}
              className={cn(
                "text-[10px] font-black px-3 py-1.5 rounded-full border transition-all tracking-widest uppercase",
                liteMode ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-muted-foreground border-slate-200'
              )}
            >
              LITE
            </button>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
        {view === "preview" ? (
          <StorePreview
            businessName={profileData.displayName}
            description={tourData.description}
            price={tourData.price}
            photo={photosData.mainPhoto}
            template="professional"
            slug={landingSlug}
          />
        ) : (
          <>
            <StorePreview
              businessName={profileData.displayName}
              description={tourData.description}
              price={tourData.price}
              photo={photosData.mainPhoto}
              template="professional"
              slug={landingSlug}
            />
            <div className={cn("space-y-4", liteMode && "opacity-60 grayscale")}>
              <h2 className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">Customize Your Tour Site</h2>
              <CustomizationPanel
                data={{
                  businessName: profileData.displayName,
                  description: tourData.description,
                  price: tourData.price,
                  location: profileData.location
                }}
                onChange={(newData: StoreData) => {
                  setProfileData(prev => ({ ...prev, displayName: newData.businessName, location: newData.location }));
                  setTourData(prev => ({ ...prev, description: newData.description, price: newData.price }));
                }}
                liteMode={liteMode}
                onRegenerate={() => {
                  toast.success("AI Content updated!");
                }}
              />
            </div>

            <Button
              onClick={persistOnboarding}
              disabled={isPublishing}
              className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-xl"
            >
              {isPublishing ? "Updating..." : "Update Page"}
            </Button>
          </>
        )}
      </main>

      {/* Success Overlay if needed, or just toast */}

      <WhatsAppBubble
        businessName={profileData.displayName}
        price={tourData.price}
        photo={photosData.mainPhoto}
        visible={step === "dashboard"}
        slug={landingSlug}
      />
    </div>
  );
};

export default Index;

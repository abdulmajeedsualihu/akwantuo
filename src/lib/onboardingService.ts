import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { buildTourSiteSlug, slugifyDisplayName } from "@/lib/share";

export interface OnboardingProfileData {
  displayName: string;
  location: string;
  phone: string;
  bio: string;
  languages: string[];
}

export interface OnboardingTourData {
  title: string;
  duration: string;
  price: string;
  description: string;
  highlights: string[];
}

export interface OnboardingPhotosData {
  mainPhoto: string;
  gallery: string[];
}

export interface DescriptionPayload {
  text?: string;
  highlights: string[];
  languages: string[];
  duration?: string;
  price?: string;
  bio?: string;
  mainPhoto?: string;
  gallery?: string[];
}

export interface LandingPageRecord {
  storefront: Database["public"]["Tables"]["storefronts"]["Row"];
  profile?: Database["public"]["Tables"]["profiles"]["Row"];
  descriptionPayload: DescriptionPayload;
  slug: string;
}

const buildDescriptionPayload = (
  profile: OnboardingProfileData,
  tour: OnboardingTourData,
  photos: OnboardingPhotosData
): DescriptionPayload => ({
  text: tour.description,
  highlights: tour.highlights,
  languages: profile.languages,
  duration: tour.duration,
  price: tour.price,
  bio: profile.bio,
  mainPhoto: photos.mainPhoto,
  gallery: photos.gallery,
});

export const parseDescriptionPayload = (value: string | null): DescriptionPayload => {
  if (!value) {
    return { highlights: [], languages: [] };
  }

  try {
    const parsed: DescriptionPayload = JSON.parse(value);
    return {
      highlights: parsed.highlights ?? [],
      languages: parsed.languages ?? [],
      duration: parsed.duration,
      price: parsed.price,
      text: parsed.text,
      bio: parsed.bio,
      mainPhoto: parsed.mainPhoto,
      gallery: parsed.gallery,
    };
  } catch {
    return {
      text: value,
      highlights: [],
      languages: [],
    };
  }
};

export const checkDisplayNameUnique = async (displayName: string) => {
  if (!displayName || displayName.trim().length < 2) return true;
  
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("display_name", displayName)
    .maybeSingle();

  if (error) {
    console.error("Error checking display name uniqueness:", error);
    return true; // Default to true on error to not block user, or handle as needed
  }
  
  return !data; // Returns true if no matching record found (unique)
};

export const getProfileByPhone = async (phone: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile by phone:", error);
    return null;
  }
  return data;
};

export const getDemoUserId = (phone: string) => {
  // Simple deterministic "UUID" for demo purposes based on phone
  // Format: 00000000-0000-0000-0000-XXXXXXXXXXXX (where X is padded phone)
  const cleanPhone = phone.replace(/\D/g, "");
  const paddedPhone = cleanPhone.padStart(12, "0").slice(-12);
  return `00000000-0000-0000-0000-${paddedPhone}`;
};

export const createInitialProfile = async (phone: string, userId?: string) => {
  const finalUserId = userId || getDemoUserId(phone);
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        phone,
        user_id: finalUserId,
      },
      { onConflict: "phone" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error creating initial profile:", error);
    return null;
  }
  return data;
};

export const saveOnboardingData = async (
  user: any,
  profileData: OnboardingProfileData,
  tourData: OnboardingTourData,
  photosData: OnboardingPhotosData
): Promise<LandingPageRecord> => {
  let userId = user?.id || user;

  // If we have a string that isn't a UUID, treat it as a phone and get demo ID
  if (typeof userId === "string" && !userId.includes("-")) {
    userId = getDemoUserId(userId);
  } else if (!userId) {
    userId = "00000000-0000-0000-0000-000000000000";
  }

  const descriptionPayload = buildDescriptionPayload(profileData, tourData, photosData);
  const descriptionString = JSON.stringify(descriptionPayload);
  const slug = buildTourSiteSlug(profileData.displayName, userId);

  const { data: storefront, error: storefrontError } = await supabase
    .from("storefronts")
    .upsert(
      {
        user_id: userId,
        business_name: profileData.displayName,
        location: profileData.location,
        description: descriptionString,
        template: "professional",
        is_live: true,
        category: tourData.title,
      },
      { onConflict: "user_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (storefrontError) {
    throw storefrontError;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        display_name: profileData.displayName,
        location: profileData.location,
        phone: profileData.phone,
        business_category: tourData.title,
      },
      { onConflict: "user_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (profileError) {
    // If user_id conflict fails (e.g. existing profile with same phone but different user_id or no user_id)
    // We try to update by phone if user_id update fails or just log it
    console.error("Profile upsert error:", profileError);
  }

  if (!storefront) {
    throw new Error("Could not create your tour site");
  }

  return { storefront, profile: undefined, descriptionPayload, slug };
};

export const loadLandingRecord = async (slug: string | undefined): Promise<LandingPageRecord | null> => {
  if (!slug) {
    return null;
  }

  const { data, error } = await supabase.from("storefronts").select("*");
  if (error) {
    throw error;
  }

  const matching = (data ?? []).find((item) => {
    const computedSlug = buildTourSiteSlug(item.business_name, item.user_id);
    return computedSlug === slug || slugifyDisplayName(item.business_name) === slug;
  });
  if (!matching) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", matching.user_id).maybeSingle();
  return {
    storefront: matching,
    profile: profile ?? undefined,
    descriptionPayload: parseDescriptionPayload(matching.description),
    slug: buildTourSiteSlug(matching.business_name, matching.user_id),
  };
};

export const getLatestTourSites = async (limit = 6): Promise<LandingPageRecord[]> => {
  const { data, error } = await supabase
    .from("storefronts")
    .select("*")
    .eq("is_live", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching latest tour sites:", error);
    return [];
  }

  const results = await Promise.all((data ?? []).map(async (item) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", item.user_id)
      .maybeSingle();

    return {
      storefront: item,
      profile: profile ?? undefined,
      descriptionPayload: parseDescriptionPayload(item.description),
      slug: buildTourSiteSlug(item.business_name, item.user_id),
    };
  }));

  return results;
};

/** Fetch the storefront slug for a returning vendor by their phone number. */
export const getStorefrontByPhone = async (phone: string): Promise<string | null> => {
  // 1. Look up the profile to get user_id
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("phone", phone)
    .maybeSingle();

  if (profileError || !profile?.user_id) return null;

  // 2. Look up their storefront
  const { data: storefront, error: sfError } = await supabase
    .from("storefronts")
    .select("business_name, user_id")
    .eq("user_id", profile.user_id)
    .maybeSingle();

  if (sfError || !storefront) return null;

  return buildTourSiteSlug(storefront.business_name, storefront.user_id);
};

export const getBookings = async (guideId: string) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("guide_id", guideId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
  return data;
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
  return data;
};

export const toggleStorefrontLive = async (userId: string, isLive: boolean) => {
  const { data, error } = await supabase
    .from("storefronts")
    .update({ is_live: isLive })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error toggling storefront live status:", error);
    throw error;
  }
  return data;
};

export const getStorefrontLiveStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from("storefronts")
    .select("is_live")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching storefront live status:", error);
    return null;
  }
  return data?.is_live ?? false;
};

export interface WorkingHours {
  enabled: boolean;
  start: string;
  end: string;
}

export interface AvailabilitySettings {
  working_hours: Record<string, WorkingHours>;
}

export const DEFAULT_WORKING_HOURS: Record<string, WorkingHours> = {
  Monday:    { enabled: true,  start: "09:00", end: "17:00" },
  Tuesday:   { enabled: true,  start: "09:00", end: "17:00" },
  Wednesday: { enabled: true,  start: "09:00", end: "17:00" },
  Thursday:  { enabled: true,  start: "09:00", end: "17:00" },
  Friday:    { enabled: true,  start: "09:00", end: "17:00" },
  Saturday:  { enabled: false, start: "09:00", end: "17:00" },
  Sunday:    { enabled: false, start: "09:00", end: "17:00" },
};

export const saveAvailabilitySettings = async (
  userId: string,
  settings: AvailabilitySettings
) => {
  const { data, error } = await supabase
    .from("storefronts")
    .update({ availability_settings: settings as any })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error saving availability settings:", error);
    throw error;
  }
  return data;
};

export const getAvailabilitySettings = async (
  userId: string
): Promise<AvailabilitySettings | null> => {
  const { data, error } = await supabase
    .from("storefronts")
    .select("availability_settings")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching availability settings:", error);
    return null;
  }
  return (data?.availability_settings as unknown as AvailabilitySettings) ?? null;
};
export const updateStorefrontHighlights = async (userId: string, highlights: string[]) => {
  // 1. Get current storefront
  const { data: storefront, error: fetchError } = await supabase
    .from("storefronts")
    .select("description")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  
  const currentPayload = parseDescriptionPayload(storefront?.description || null);
  const updatedPayload = { ...currentPayload, highlights };

  const { data, error } = await supabase
    .from("storefronts")
    .update({ description: JSON.stringify(updatedPayload) })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating highlights:", error);
    throw error;
  }
  return data;
};

export const searchStorefronts = async (query: string): Promise<LandingPageRecord[]> => {
  const { data, error } = await supabase
    .from("storefronts")
    .select("*")
    .or(`business_name.ilike.%${query}%,location.ilike.%${query}%,category.ilike.%${query}%`)
    .eq("is_live", true)
    .limit(20);

  if (error) {
    console.error("Error searching storefronts:", error);
    return [];
  }

  const results = await Promise.all((data ?? []).map(async (item) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", item.user_id)
      .maybeSingle();

    return {
      storefront: item,
      profile: profile ?? undefined,
      descriptionPayload: parseDescriptionPayload(item.description),
      slug: buildTourSiteSlug(item.business_name, item.user_id),
    };
  }));

  return results;
};

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeroLanding from "@/components/HeroLanding";
import OnboardingPhone from "@/components/OnboardingPhone";
import ProfileDetails from "@/components/ProfileDetails";
import PhotoUpload from "@/components/PhotoUpload";
import FirstTour from "@/components/FirstTour";
import OnboardingPreview from "@/components/OnboardingPreview";
import OnboardingSuccess from "@/components/OnboardingSuccess";
import RoleSelector from "@/components/RoleSelector";
import VendorDashboard from "@/components/VendorDashboard";
import { useOnboarding, saveVendorPhone, clearVendorPhone, loadVendorPhone } from "@/contexts/OnboardingContext";
import { toast } from "sonner";
import { slugifyDisplayName } from "@/lib/share";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    profileData, setProfileData,
    photosData, setPhotosData,
    tourData, setTourData,
    landingSlug, setLandingSlug,
    isPublishing,
    restoringSession,
    handlePublish,
    latestTours
  } = useOnboarding();

  const path = location.pathname;

  if (restoringSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-lg font-semibold tracking-widest uppercase text-white/40">Loading your experience...</p>
      </div>
    );
  }

  // Route Handling
  if (path === "/" || path === "/home") {
    return <HeroLanding onGetStarted={() => navigate("/onboarding/role")} latestTours={latestTours} />;
  }

  if (path === "/onboarding/role") {
    return (
      <RoleSelector
        onBack={() => navigate("/")}
        onContinue={(role: "guide" | "tourist" | null) => {
          if (role === "tourist") {
            navigate("/");
            setTimeout(() => {
              toast.error("Explore our tour guides on the home page!", {
                description: "Akwantuo onboarding is for vendors. As a tourist, discover guides below.",
                duration: 5000,
              });
            }, 100);
          } else {
            navigate("/onboarding/phone");
          }
        }}
      />
    );
  }

  if (path === "/onboarding/phone") {
    return (
      <OnboardingPhone
        onComplete={async (phone: string, pData: { displayName: string; location: string } | undefined, isReturning?: boolean) => {
          setProfileData((prev: any) => ({
            ...prev,
            phone,
            displayName: pData?.displayName || prev.displayName,
            location: pData?.location || prev.location,
          }));
          if (isReturning) {
            saveVendorPhone(phone);
            navigate("/dashboard");
          } else {
            navigate("/onboarding/profile");
          }
        }}
      />
    );
  }

  if (path === "/onboarding/profile") {
    return (
      <ProfileDetails
        initialData={profileData}
        onBack={() => navigate("/onboarding/phone")}
        onContinue={(data: any) => {
          setProfileData((prev: any) => ({ ...prev, ...data }));
          navigate("/onboarding/photos");
        }}
      />
    );
  }

  if (path === "/onboarding/photos") {
    return (
      <PhotoUpload
        onBack={() => navigate("/onboarding/profile")}
        onContinue={(data: { mainPhoto: string; gallery: string[] }) => {
          setPhotosData(data);
          navigate("/onboarding/tour");
        }}
        onSkip={() => navigate("/onboarding/tour")}
      />
    );
  }

  if (path === "/onboarding/tour") {
    return (
      <FirstTour
        initialData={tourData}
        onBack={() => navigate("/onboarding/photos")}
        onContinue={(data: any) => {
          setTourData(data);
          navigate("/onboarding/preview");
        }}
      />
    );
  }

  if (path === "/onboarding/preview") {
    return (
      <OnboardingPreview
        data={{ ...profileData, ...photosData, tour: tourData }}
        onBack={() => navigate("/onboarding/tour")}
        onEdit={() => navigate("/onboarding/profile")}
        onPublish={async () => {
          const success = await handlePublish();
          if (success) navigate("/onboarding/success");
        }}
        publishing={isPublishing}
      />
    );
  }

  if (path === "/onboarding/success") {
    return (
      <OnboardingSuccess
        displayName={profileData.displayName}
        slug={landingSlug}
        onDone={() => {
          saveVendorPhone(profileData.phone);
          navigate("/dashboard");
        }}
        onShare={() => toast.info("Sharing on WhatsApp...")}
      />
    );
  }

  if (path === "/dashboard") {
    if (!loadVendorPhone() && !restoringSession) {
      navigate("/", { replace: true });
      return null;
    }

    return (
      <VendorDashboard
        displayName={profileData.displayName}
        photo={photosData.mainPhoto}
        slug={landingSlug}
        onLogout={() => {
          clearVendorPhone();
          navigate("/");
        }}
        onViewPage={() => {
          const displaySlug = slugifyDisplayName(profileData.displayName);
          if (displaySlug) window.open(`/${displaySlug}`, "_blank");
        }}
      />
    );
  }

  return null;
};

export default Index;

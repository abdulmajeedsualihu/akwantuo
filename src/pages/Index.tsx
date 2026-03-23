import { useState, useCallback, useEffect } from "react";
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
import AILoading from "@/components/AILoading";
import { startAIAnalysis } from "@/lib/aiService";
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
    latestTours,
    aiResult,
    setAiResult
  } = useOnboarding();

  const [aiError, setAiError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    if (!photosData?.mainPhoto) {
      console.warn("AI Analysis triggered but mainPhoto is missing. Waiting...");
      return;
    }
    setAiError(null);
    const timeoutId = setTimeout(() => {
      setAiError("Request timed out. The AI is taking longer than usual.");
    }, 45000); // 45 second timeout for heavy vision tasks

    try {
      console.log("Starting real-time AI analysis...");
      const result = await startAIAnalysis(
        profileData.displayName || "New Guide",
        profileData.location || "Ghana",
        photosData.mainPhoto || "",
        photosData.gallery || []
      );
      clearTimeout(timeoutId);

      if (result) {
        setAiResult(result);
        setProfileData((prev: any) => ({
          ...prev,
          bio: result.bio,
          location: result.location_suggestion && result.location_suggestion.trim() !== "" 
            ? result.location_suggestion 
            : prev.location
        }));
        setTourData((prev: any) => ({
          ...prev,
          title: result.tour.title,
          description: result.tour.description,
          highlights: result.tour.highlights,
          price: result.tour.price_suggestion || prev.price
        }));
        toast.success("AI has generated your profile suggestions!");
        navigate("/onboarding/profile");
      } else {
        setAiError("Failed to generate content. Please try again.");
      }
    } catch (error: any) {
      console.error("AI processing failed", error);
      setAiError(error.message || "AI Analysis failed");
    }
  }, [photosData, profileData, setAiResult, setProfileData, setTourData, navigate]);

  const path = location.pathname;

  // Handle Automatic AI Trigger when data is ready
  useEffect(() => {
    if (path === "/onboarding/ai-loading" && photosData?.mainPhoto && !aiResult && !aiError) {
      console.log("Auto-triggering AI analysis: Data is ready.");
      runAnalysis();
    }
  }, [path, photosData?.mainPhoto, aiResult, aiError, runAnalysis]);


  const renderContent = () => {
    if (restoringSession) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <p className="text-lg font-semibold tracking-widest uppercase text-white/40">Loading your experience...</p>
        </div>
      );
    }

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
              navigate("/onboarding/photos");
            }
          }}
        />
      );
    }

    if (path === "/onboarding/profile") {
      return (
        <ProfileDetails
          initialData={{
            ...profileData,
            bio: aiResult?.bio || profileData.bio,
            location: (aiResult?.location_suggestion && aiResult.location_suggestion.trim() !== "") 
              ? aiResult.location_suggestion 
              : profileData.location
          }}
          onBack={() => navigate("/onboarding/photos")}
          onContinue={(data: any) => {
            setProfileData((prev: any) => ({ ...prev, ...data }));
            navigate("/onboarding/tour");
          }}
        />
      );
    }

    if (path === "/onboarding/photos") {
      return (
        <PhotoUpload
          onBack={() => navigate("/onboarding/phone")}
          onContinue={(data: { mainPhoto: string; gallery: string[] }) => {
            setPhotosData(data);
            navigate("/onboarding/ai-loading");
          }}
          onSkip={() => navigate("/onboarding/profile")}
        />
      );
    }

    if (path === "/onboarding/ai-loading") {
      return (
        <AILoading
          error={aiError}
          onRetry={runAnalysis}
          onSkip={() => navigate("/onboarding/profile")}
          onComplete={runAnalysis}
        />
      );
    }

    if (path === "/onboarding/tour") {
      return (
        <FirstTour
          initialData={{
            ...tourData,
            title: tourData.title || aiResult?.tour.title,
            description: tourData.description || aiResult?.tour.description,
            highlights: tourData.highlights.length > 3 ? tourData.highlights : (aiResult?.tour.highlights || tourData.highlights)
          }}
          onBack={() => navigate("/onboarding/profile")}
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

  return renderContent();

  return null;
};

export default Index;

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import HeroLanding from "@/components/HeroLanding";
import OnboardingPhone from "@/components/OnboardingPhone";
import ProfileDetails from "@/components/ProfileDetails";
import PhotoUpload from "@/components/PhotoUpload";
import FirstTour from "@/components/FirstTour";
import OnboardingPreview from "@/components/OnboardingPreview";
import OnboardingSuccess from "@/components/OnboardingSuccess";
import CustomizationPanel from "@/components/CustomizationPanel";
import StorePreview from "@/components/StorePreview";
import ViewToggle from "@/components/ViewToggle";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = "landing" | "phone" | "profile" | "photos" | "first-tour" | "preview" | "success" | "dashboard";

const Index = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(user ? "profile" : "landing");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [liteMode, setLiteMode] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: "",
    location: "",
    phone: "",
    bio: "",
    languages: ["English", "Twi"],
  });

  const [photosData, setPhotosData] = useState({
    mainPhoto: "",
    gallery: [] as string[],
  });

  const [tourData, setTourData] = useState({
    title: "",
    duration: "1h",
    price: "0.00",
    description: "",
    highlights: ["Historical Landmarks", "Local Cuisine"],
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem("akwantuo_onboarding_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profileData) setProfileData(parsed.profileData);
        if (parsed.photosData) setPhotosData(parsed.photosData);
        if (parsed.tourData) setTourData(parsed.tourData);
        if (parsed.step && parsed.step !== "success") setStep(parsed.step);
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
  }, []);

  // Save persistence
  useEffect(() => {
    const state = { profileData, photosData, tourData, step };
    localStorage.setItem("akwantuo_onboarding_state", JSON.stringify(state));
  }, [profileData, photosData, tourData, step]);

  if (step === "landing") {
    return <HeroLanding onGetStarted={() => setStep("phone")} />;
  }

  if (step === "phone") {
    return <OnboardingPhone onComplete={() => setStep("profile")} />;
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
        onPublish={() => setStep("success")}
      />
    );
  }

  if (step === "success") {
    return (
      <OnboardingSuccess 
        url={`akwantuo.com/${profileData.displayName.toLowerCase().replace(/\s+/g, '-')}`}
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
          />
        ) : (
          <>
            <StorePreview
              businessName={profileData.displayName}
              description={tourData.description}
              price={tourData.price}
              photo={photosData.mainPhoto}
              template="professional"
            />
            <div className={cn("space-y-4", liteMode && "opacity-60 grayscale")}>
              <h2 className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">Customize Your Page</h2>
              <CustomizationPanel 
                data={{
                  businessName: profileData.displayName,
                  description: tourData.description,
                  price: tourData.price,
                  location: profileData.location
                }} 
                onChange={(newData: any) => {
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
                onClick={() => {
                    setIsPublishing(true);
                    setTimeout(() => {
                        setIsPublishing(false);
                        setIsPublished(true);
                        toast.success("Page updated successfully! 🎉");
                    }, 1500);
                }}
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
      />
    </div>
  );
};

export default Index;

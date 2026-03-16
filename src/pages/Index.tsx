import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import HeroLanding from "@/components/HeroLanding";
import OnboardingPhone from "@/components/OnboardingPhone";
import CategorySelector from "@/components/CategorySelector";
import PhotoUpload from "@/components/PhotoUpload";
import AILoading from "@/components/AILoading";
import TemplateSelector from "@/components/TemplateSelector";
import CustomizationPanel from "@/components/CustomizationPanel";
import StorePreview from "@/components/StorePreview";
import ViewToggle from "@/components/ViewToggle";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Share2, Copy } from "lucide-react";
import { toast } from "sonner";

type Step = "landing" | "phone" | "category" | "photos" | "loading" | "templates" | "dashboard";

const MOCK_DESCRIPTION = "Beautiful handwoven Bolga basket, crafted by skilled artisans in the Upper East Region. Made from locally sourced elephant grass, each piece is unique and built to last. Perfect for home décor, shopping, or as a thoughtful gift.";

const Index = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(user ? "category" : "landing");
  const [category, setCategory] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [template, setTemplate] = useState("professional");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [liteMode, setLiteMode] = useState(false);
  const [storeData, setStoreData] = useState({
    businessName: "Ama's Baskets",
    description: MOCK_DESCRIPTION,
    price: "45.00",
    negotiable: true,
    location: "Makola Market, Accra",
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem("shopsnap_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStoreData(parsed.storeData);
        setCategory(parsed.category);
        setTemplate(parsed.template);
        if (parsed.photos) setPhotos(parsed.photos);
        if (parsed.step && parsed.step !== "loading") setStep(parsed.step);
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
  }, []);

  // Save persistence
  useEffect(() => {
    const state = { storeData, category, template, photos, step };
    localStorage.setItem("shopsnap_state", JSON.stringify(state));
  }, [storeData, category, template, photos, step]);

  const handleLoadingComplete = useCallback(() => {
    // Simulated AI Content Generation based on category
    const aiContent: Record<string, any> = {
      food: {
        businessName: "Mama's Kitchen",
        description: "Fresh, hot Ghanaian meals prepared daily with love. Specializing in Jollof, Waakye, and Banku. Authenticity in every bite.",
        price: "25.00",
      },
      crafts: {
        businessName: "Aburi Artisans",
        description: "Hand-carved woodwork and hand-woven baskets from the heart of Aburi. Each piece tells a story of our heritage.",
        price: "120.00",
      },
      clothing: {
        businessName: "Kente Kingdom",
        description: "Authentic royal Kente weaves from Bonwire. Premium quality threads and traditional patterns for your special occasions.",
        price: "450.00",
      },
    };

    if (category && aiContent[category]) {
      setStoreData(prev => ({
        ...prev,
        ...aiContent[category]
      }));
    }

    setStep("templates");
  }, [category]);

  if (step === "landing") {
    return <HeroLanding onGetStarted={() => setStep("phone")} />;
  }

  if (step === "phone") {
    return <OnboardingPhone onComplete={() => setStep("category")} />;
  }

  if (step === "category") {
    return (
      <CategorySelector
        onSelect={(cat) => {
          setCategory(cat);
          setStep("photos");
        }}
      />
    );
  }

  if (step === "photos") {
    return (
      <PhotoUpload
        onComplete={(p) => {
          setPhotos(p);
          setStep("loading");
        }}
      />
    );
  }

  if (step === "loading") {
    return <AILoading onComplete={handleLoadingComplete} />;
  }

  if (step === "templates") {
    return (
      <TemplateSelector
        photos={photos}
        category={category}
        onSelect={(t) => {
          setTemplate(t);
          setStep("dashboard");
        }}
      />
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen pb-24">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {storeData.businessName[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-none">{storeData.businessName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs text-primary font-medium">Live</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLiteMode(!liteMode)}
              className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${liteMode ? 'bg-primary text-white border-primary' : 'bg-transparent text-muted-foreground border-border'}`}
            >
              LITE
            </button>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {view === "preview" ? (
          <StorePreview
            {...storeData}
            photo={photos[0]}
            template={template}
          />
        ) : (
          <>
            <StorePreview
              {...storeData}
              photo={photos[0]}
              template={template}
            />
            <div className={`space-y-2 ${liteMode ? 'animate-none' : ''}`}>
              <h2 className="label-caps px-1">Customize Your Store</h2>
              <CustomizationPanel 
                data={storeData} 
                onChange={setStoreData} 
                liteMode={liteMode}
                onRegenerate={() => {
                   // Simple regeneration logic
                   setStoreData(prev => ({
                     ...prev,
                     description: "AI Regenerated: " + prev.description.split('. ')[0] + ". Hand-crafted for quality and durability."
                   }));
                }}
              />
            </div>
            
            <Button 
                onClick={() => {
                    setIsPublishing(true);
                    setTimeout(() => {
                        setIsPublishing(false);
                        setIsPublished(true);
                        toast.success("Store published successfully! 🎉");
                    }, 2000);
                }}
                disabled={isPublishing}
                className="w-full h-14 text-lg font-bold shadow-hard-lg"
            >
                {isPublishing ? "Publishing..." : "Publish Store"}
            </Button>
          </>
        )}
      </main>

      {/* Publish Success Modal */}
      {isPublished && (
          <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-hard-lg max-w-sm w-full text-center space-y-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-bounce">
                      <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                      <h2 className="text-2xl font-bold">You're live! 🎉</h2>
                      <p className="text-muted-foreground">Your professional storefront is now ready to share.</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-2xl flex items-center justify-between gap-4">
                      <span className="text-sm font-medium truncate">shopsnap.link/ama-baskets</span>
                      <button 
                        onClick={() => {
                            navigator.clipboard.writeText("shopsnap.link/ama-baskets");
                            toast.success("Link copied!");
                        }}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                      >
                          <Copy className="w-4 h-4" />
                      </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                      <Button onClick={() => setIsPublished(false)} className="w-full h-12">
                          Done
                      </Button>
                  </div>
              </div>
          </div>
      )}

      <WhatsAppBubble
        businessName={storeData.businessName}
        price={storeData.price}
        photo={photos[0]}
        visible={step === "dashboard"}
      />
    </div>
  );
};

export default Index;

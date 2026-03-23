import { useState } from "react";
import { ChevronLeft, Compass, Palmtree, Utensils, Music, History, Users, Heart, Sparkles, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TouristPreferencesProps {
  onBack: () => void;
  onComplete: (preferences: any) => void;
}

const GHANA_LOCATIONS = [
  { id: "accra", label: "Accra", desc: "Capital & vibrant city life" },
  { id: "kumasi", label: "Kumasi", desc: "Cultural heartland of Ashanti" },
  { id: "cape-coast", label: "Cape Coast", desc: "History, castles & beaches" },
  { id: "volta", label: "Volta Region", desc: "Mountains, lakes & waterfalls" },
  { id: "tamale", label: "Tamale", desc: "Northern culture & festivals" },
  { id: "takoradi", label: "Takoradi", desc: "Western beaches & oil city" },
  { id: "open", label: "I'm open to anywhere", desc: "Surprise me!" },
];

const INTERESTS = [
  { id: "culture", label: "Culture & Heritage", icon: <History className="w-5 h-5" />, color: "bg-amber-100 text-amber-700" },
  { id: "nature", label: "Nature & Wildlife", icon: <Palmtree className="w-5 h-5" />, color: "bg-emerald-100 text-emerald-700" },
  { id: "food", label: "Food & Gastronomy", icon: <Utensils className="w-5 h-5" />, color: "bg-rose-100 text-rose-700" },
  { id: "nightlife", label: "Nightlife & Music", icon: <Music className="w-5 h-5" />, color: "bg-indigo-100 text-indigo-700" },
  { id: "adventure", label: "Adventure & Outdoors", icon: <Compass className="w-5 h-5" />, color: "bg-sky-100 text-sky-700" },
];

const VIBES = [
  { id: "relaxed", label: "Relaxed & Chill", desc: "Take it slow, soak it in." },
  { id: "local", label: "Go Local & Authentic", desc: "Live like a Ghanaian." },
  { id: "luxury", label: "Premium & Comfort", desc: "The finer things in life." },
  { id: "hustle", label: "Fast-Paced & Busy", desc: "See everything in one day." },
];

const TRAVELERS = [
  { id: "solo", label: "Solo Traveler", icon: <Heart className="w-5 h-5" /> },
  { id: "couple", label: "Couple", icon: <Users className="w-5 h-5" /> },
  { id: "family", label: "Family", icon: <Users className="w-5 h-5" /> },
  { id: "friends", label: "Group of Friends", icon: <Users className="w-5 h-5" /> },
];

const PRICE_RANGES = [
  { id: "budget", label: "Budget", desc: "Under $25 / Day", color: "bg-emerald-50 text-emerald-700" },
  { id: "mid", label: "Standard", desc: "$25 - $75 / Day", color: "bg-blue-50 text-blue-700" },
  { id: "premium", label: "Premium", desc: "$75 - $150 / Day", color: "bg-purple-50 text-purple-700" },
  { id: "luxury", label: "Luxury", desc: "$150+ / Day", color: "bg-amber-50 text-amber-700" },
];

const TOTAL_STEPS = 5;

const TouristPreferences = ({ onBack, onComplete }: TouristPreferencesProps) => {
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedTraveler, setSelectedTraveler] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      const locationLabel =
        GHANA_LOCATIONS.find(l => l.id === selectedLocation)?.label ?? "Ghana";
      onComplete({
        location: selectedLocation === "open" ? "Anywhere in Ghana" : locationLabel,
        interests: selectedInterests,
        vibe: selectedVibe,
        traveler: selectedTraveler,
        priceRange: selectedPriceRange,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const isNextDisabled = () => {
    if (step === 1) return !selectedLocation;
    if (step === 2) return selectedInterests.length === 0;
    if (step === 3) return !selectedVibe;
    if (step === 4) return !selectedTraveler;
    if (step === 5) return !selectedPriceRange;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-[440px] flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <header className="flex items-center justify-between py-4 sm:py-6">
          <button
            onClick={step === 1 ? onBack : () => setStep(step - 1)}
            className="p-2 -ml-2 text-charcoal hover:bg-white/50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-charcoal flex-1 text-center mr-8">Your Preferences</h1>
        </header>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8 sm:mb-12">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                step === i + 1 ? "w-10 bg-primary-navy" : "w-1.5 bg-primary-navy/20"
              )}
            />
          ))}
        </div>

        {/* Step 1 — Location */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-3 mb-8 sm:text-center">
              <div className="flex items-center gap-2 sm:justify-center">
                <MapPin className="w-7 h-7 text-primary-navy" />
                <h2 className="text-[28px] sm:text-[32px] font-extrabold text-charcoal tracking-tight leading-tight">
                  Where are you headed?
                </h2>
              </div>
              <p className="text-muted-foreground font-medium text-[15px]">
                We'll find guides in or near your destination.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {GHANA_LOCATIONS.map((loc) => {
                const isActive = selectedLocation === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc.id)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all duration-300 text-left",
                      isActive
                        ? "bg-white border-primary-navy shadow-lg ring-4 ring-primary-navy/5"
                        : "bg-white border-transparent hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all",
                      isActive ? "bg-primary-navy text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">{loc.label}</p>
                      <p className="text-xs text-muted-foreground font-medium">{loc.desc}</p>
                    </div>
                    {isActive && (
                      <div className="ml-auto w-6 h-6 rounded-full bg-primary-navy flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 — Interests */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-3 mb-8 sm:text-center">
              <h2 className="text-[28px] sm:text-[32px] font-extrabold text-charcoal tracking-tight leading-tight">
                What are you curious about?
              </h2>
              <p className="text-muted-foreground font-medium text-[15px]">
                Select everything that interests you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {INTERESTS.map((item) => {
                const isActive = selectedInterests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all duration-300 group",
                      isActive
                        ? "bg-white border-primary-navy shadow-lg ring-4 ring-primary-navy/5"
                        : "bg-white border-transparent hover:border-slate-200"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                      {item.icon}
                    </div>
                    <span className="flex-1 text-left font-bold text-charcoal">{item.label}</span>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-primary-navy flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 — Vibe */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3 mb-8 sm:text-center">
              <h2 className="text-[28px] sm:text-[32px] font-extrabold text-charcoal tracking-tight leading-tight">
                What's your travel vibe?
              </h2>
              <p className="text-muted-foreground font-medium text-[15px]">
                Choose the style that fits you best.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {VIBES.map((vibe) => {
                const isActive = selectedVibe === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    onClick={() => setSelectedVibe(vibe.id)}
                    className={cn(
                      "w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? "bg-primary-navy border-primary-navy shadow-xl scale-[1.02]"
                        : "bg-white border-transparent hover:border-slate-200"
                    )}
                  >
                    <div className="relative z-10">
                      <p className={cn("text-lg font-black mb-1", isActive ? "text-white" : "text-charcoal")}>{vibe.label}</p>
                      <p className={cn("text-sm font-medium", isActive ? "text-white/80" : "text-muted-foreground")}>{vibe.desc}</p>
                    </div>
                    {isActive && (
                      <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 text-white/10" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4 — Traveler type */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-3 mb-8 sm:text-center">
              <h2 className="text-[28px] sm:text-[32px] font-extrabold text-charcoal tracking-tight leading-tight">
                Who's coming along?
              </h2>
              <p className="text-muted-foreground font-medium text-[15px]">
                This helps us find the right size matches.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {TRAVELERS.map((t) => {
                const isActive = selectedTraveler === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTraveler(t.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all duration-300 gap-3",
                      isActive
                        ? "bg-white border-primary-navy shadow-lg ring-4 ring-primary-navy/5"
                        : "bg-white border-transparent hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center mb-1 transition-all",
                      isActive ? "bg-primary-navy text-white scale-110" : "bg-slate-100 text-slate-500"
                    )}>
                      {t.icon}
                    </div>
                    <span className={cn("text-xs font-black uppercase tracking-widest text-center", isActive ? "text-primary-navy" : "text-slate-400")}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5 — Price Range */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-3 mb-8 sm:text-center">
              <h2 className="text-[28px] sm:text-[32px] font-extrabold text-charcoal tracking-tight leading-tight">
                What's your budget?
              </h2>
              <p className="text-muted-foreground font-medium text-[15px]">
                This helps us match you with the right experience.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PRICE_RANGES.map((range) => {
                const isActive = selectedPriceRange === range.id;
                return (
                  <button
                    key={range.id}
                    onClick={() => setSelectedPriceRange(range.id)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all duration-300 text-left",
                      isActive
                        ? "bg-white border-primary-navy shadow-lg ring-4 ring-primary-navy/5"
                        : "bg-white border-transparent hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all font-bold text-lg",
                      range.color
                    )}>
                      {range.id === "budget" && "$"}
                      {range.id === "mid" && "$$"}
                      {range.id === "premium" && "$$$"}
                      {range.id === "luxury" && "$$$$"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-charcoal">{range.label}</p>
                      <p className="text-xs text-muted-foreground font-medium">{range.desc}</p>
                    </div>
                    {isActive && (
                      <div className="ml-auto w-6 h-6 rounded-full bg-primary-navy flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="py-8 mt-auto">
          <Button
            onClick={handleNext}
            disabled={isNextDisabled()}
            className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg disabled:opacity-30 disabled:grayscale transition-all"
          >
            {step === TOTAL_STEPS ? "Find My Perfect Guide" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TouristPreferences;

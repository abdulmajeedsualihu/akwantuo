import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { searchStorefronts } from "@/lib/onboardingService";
import { ChevronLeft, Star, MapPin, CheckCircle2, MessageCircle, Loader2, Sparkles, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ItineraryCard from "@/components/ItineraryCard";

interface GuideMatch {
  id: string;
  name: string;
  slug: string;
  phone: string;
  location: string;
  bio: string;
  matchScore: number;
  matchReason: string;
  image: string;
}

interface TouristMatchResultsProps {
  preferences: any;
  onBack: () => void;
  onSelectGuide: (guideId: string, slug: string) => void;
}

const TouristMatchResults = ({ preferences, onBack, onSelectGuide }: TouristMatchResultsProps) => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<GuideMatch[]>([]);
  const [itinerary, setItinerary] = useState<any>(null);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryGuideId, setItineraryGuideId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchBarQuery = searchParams.get("search");

  const generateItinerary = async (guide: GuideMatch) => {
    // If clicking the one already generated, just scroll to it
    if (itinerary && itineraryGuideId === guide.id) {
      document.getElementById("itinerary-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const cacheKey = `akwantuo_itinerary_${guide.id}_${JSON.stringify(
      Object.fromEntries(Object.entries(preferences || {}).sort())
    )}`;

    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try { 
        const parsed = JSON.parse(cached);
        setItinerary(parsed);
        setItineraryGuideId(guide.id);
        setTimeout(() => document.getElementById("itinerary-section")?.scrollIntoView({ behavior: "smooth" }), 100);
        return; 
      } catch (_) {}
    }

    setItineraryLoading(true);
    setItineraryGuideId(guide.id); // Track which one we are loading
    try {
      const { data, error } = await supabase.functions.invoke("generate-itinerary", {
        body: { preferences: { ...preferences, days: 3 }, guide },
      });
      if (error) throw error;
      const result = data?.itinerary ?? null;
      if (result) {
        setItinerary(result);
        setItineraryGuideId(guide.id);
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
        // Smooth scroll to itinerary
        setTimeout(() => document.getElementById("itinerary-section")?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (err) {
      console.error("Itinerary Error:", err);
      toast.error("Could not generate itinerary. Please try again.");
      setItineraryGuideId(null);
    } finally {
      setItineraryLoading(false);
    }
  };

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      
      // OPTION 1: Search Query from Homepage Search Bar
      if (searchBarQuery) {
        try {
          const results = await searchStorefronts(searchBarQuery);
          const mapped = (results || []).map(r => ({
            id: r.storefront.user_id,
            name: r.storefront.business_name,
            slug: r.slug,
            phone: r.profile?.phone || "",
            location: r.storefront.location,
            bio: r.descriptionPayload?.bio || r.descriptionPayload?.text || "Expert local guide available for custom tours.",
            matchScore: 98,
            matchReason: `Directly matches your search for "${searchBarQuery}"`,
            image: r.descriptionPayload?.mainPhoto || "/platform_hero_guide.png",
          }));
          setMatches(mapped);
          setLoading(false);
        } catch (err) {
          console.error("Search fetch error:", err);
          setLoading(false);
        }
        return;
      }

      // OPTION 2: MatchMaker Flow
      if (!preferences) {
        setLoading(false);
        return;
      }

      // Stable cache key: sort keys so object property order doesn't matter
      const cacheKey = `akwantuo_matches_${JSON.stringify(
        Object.fromEntries(Object.entries(preferences).sort())
      )}`;

      // Check cache first — avoids hitting the AI again for the same preferences
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          setMatches(JSON.parse(cached));
          setLoading(false);
          return;
        } catch (_) {
          sessionStorage.removeItem(cacheKey); // corrupted cache — refetch
        }
      }

      try {
        const { data, error } = await supabase.functions.invoke("match-guide", {
          body: { preferences },
        });

        if (error) throw error;

        const processedMatches = (data?.matches ?? []).map((m: any, idx: number) => ({
          ...m,
          image: m.image || `https://images.unsplash.com/photo-${[
            "1506794778202-cad84cf45f1d",
            "1531123897727-8f129e1688ce",
            "1500648767791-00dcc994a43e",
          ][idx % 3]}?auto=format&fit=crop&q=80&w=200&h=200`,
        }));

        setMatches(processedMatches);
        // Cache for this session so reloads / navigation back are free
        sessionStorage.setItem(cacheKey, JSON.stringify(processedMatches));
      } catch (err) {
        console.error("Matchmaking Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [preferences, searchBarQuery]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-[480px] flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <header className="flex items-center justify-between py-4 sm:py-6 mb-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-charcoal hover:bg-white/50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-charcoal flex-1 text-center mr-8">Your Top Matches</h1>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 pt-20">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-slate-200 border-t-primary-navy animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary-navy animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-charcoal">Finding your tribe...</h2>
              <p className="text-muted-foreground font-medium">Scanning all local guides in Ghana based on your vibes.</p>
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 pt-20 text-center pb-20">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-charcoal">No matches found</h2>
              <p className="text-muted-foreground font-medium max-w-xs">
                We couldn't find a guide that fits your preferences right now. Try adjusting your destination or interests.
              </p>
            </div>
            <Button onClick={onBack} className="h-12 px-8 bg-primary-navy hover:bg-primary-navy/90 rounded-xl font-bold">
              Adjust Preferences
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Results Title Card */}
            <div className="bg-primary-navy rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden mb-8">
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{matches.length} Perfect {matches.length === 1 ? "Match" : "Matches"} Found!</h3>
                  <p className="text-white/70 text-sm">We found guides that match your specific interests.</p>
                </div>
              </div>
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="space-y-4">
              {matches.map((guide, idx) => (
                <div 
                  key={guide.id}
                  className={cn(
                    "bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group animate-in fade-in slide-in-from-bottom-8 fill-mode-both",
                    idx === 0 ? "delay-[100ms] ring-2 ring-primary-navy/10" : idx === 1 ? "delay-[300ms]" : "delay-[500ms]"
                  )}
                >
                  {/* Match Badge */}
                  <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={12} strokeWidth={3} />
                    {guide.matchScore}% Match
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                      <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="pt-1">
                      <h4 className="text-lg font-black text-charcoal leading-tight">{guide.name}</h4>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                        <MapPin size={12} />
                        <span className="font-semibold">{guide.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlight/Bio Section */}
                  <div className="bg-[#f8fafc] rounded-2xl p-4 mb-4 border border-slate-50">
                    <p className="text-xs font-black text-primary-navy uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                       WHY THIS MATCH?
                    </p>
                    <p className="text-sm text-charcoal font-medium leading-relaxed">
                      {guide.matchReason}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      asChild
                      className="flex-1 h-12 bg-primary-navy hover:bg-primary-navy/90 rounded-xl font-bold text-sm shadow-sm"
                    >
                      <a href={`/${guide.slug}`} target="_blank" rel="noopener noreferrer">
                        View Profile
                      </a>
                    </Button>
                    {guide.phone && (
                      <Button 
                        variant="outline"
                        className="w-12 h-12 p-0 rounded-xl border-slate-200 text-[#25D366] hover:bg-[#25D366]/5 hover:border-[#25D366]/20 transition-colors"
                        asChild
                      >
                        <a 
                          href={`https://wa.me/${guide.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MessageCircle size={20} fill="currentColor" strokeWidth={1} />
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Itinerary CTA */}
                  <Button
                    onClick={() => generateItinerary(guide)}
                    disabled={itineraryLoading && itineraryGuideId !== guide.id}
                    className={cn(
                      "w-full mt-3 h-12 rounded-xl font-bold text-sm shadow-sm transition-all",
                      itinerary && itineraryGuideId === guide.id
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-amber-500 hover:bg-amber-600"
                    )}
                  >
                    {itineraryLoading && itineraryGuideId === guide.id ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Building your itinerary...</>
                    ) : itinerary && itineraryGuideId === guide.id ? (
                      <><CalendarDays className="w-4 h-4 mr-2" /> View My Itinerary ↓</>
                    ) : (
                      <><CalendarDays className="w-4 h-4 mr-2" /> ✨ Generate My Itinerary</>
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {/* Itinerary Section */}
            {itinerary && (
              <div id="itinerary-section">
                <ItineraryCard itinerary={itinerary} guideName={matches.find(m => m.id === itineraryGuideId)?.name ?? "Your Guide"} />
              </div>
            )}

            <Button 
              variant="ghost" 
              onClick={onBack}
              className="w-full text-muted-foreground hover:text-charcoal font-bold py-8"
            >
              Adjust your preferences
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TouristMatchResults;

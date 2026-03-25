import { useState } from "react";
import { Share2, Sparkles, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ItineraryDay {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
}

interface Itinerary {
  title: string;
  subtitle: string;
  days: ItineraryDay[];
  tips: string[];
}

interface ItineraryCardProps {
  itinerary: Itinerary;
  guideName: string;
}

const DAY_PALETTES = [
  { bg: "from-rose-500 to-orange-400",   badge: "bg-rose-500",   ring: "ring-rose-200",   pillBg: "bg-rose-50",   pillText: "text-rose-700",   dot: "bg-rose-400"   },
  { bg: "from-violet-500 to-blue-500",   badge: "bg-violet-600", ring: "ring-violet-200", pillBg: "bg-violet-50", pillText: "text-violet-700", dot: "bg-violet-400" },
  { bg: "from-emerald-500 to-teal-400",  badge: "bg-emerald-600",ring: "ring-emerald-200",pillBg: "bg-emerald-50",pillText: "text-emerald-700",dot: "bg-emerald-400"},
  { bg: "from-amber-500 to-yellow-400",  badge: "bg-amber-500",  ring: "ring-amber-200",  pillBg: "bg-amber-50",  pillText: "text-amber-700",  dot: "bg-amber-400"  },
];

const TIME_SLOTS = [
  { key: "morning"   as const, emoji: "☀️", label: "Morning"   },
  { key: "afternoon" as const, emoji: "🌤️", label: "Afternoon" },
  { key: "evening"   as const, emoji: "🌙", label: "Evening"   },
];

const TIP_EMOJIS = ["🗺️", "🤝", "🚌", "💧", "📸", "🎵", "🍽️", "🌿"];

const ItineraryCard = ({ itinerary, guideName }: ItineraryCardProps) => {
  const [openDay, setOpenDay] = useState<number>(1);
  const [showTips, setShowTips] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: itinerary.title, text: `My Ghana trip: ${itinerary.title} — via Akwantuo` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(itinerary.title).then(() => toast.success("Copied!")).catch(() => {});
    }
  };

  return (
    <div className="mt-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl mb-5">
        {/* Ghana-inspired gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#006B3F] via-[#FCD116] to-[#CE1126] opacity-90" />
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30" />
        
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-black/10 blur-xl" />

        <div className="relative z-10 p-7 pb-6">
          {/* Tag */}
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full mb-4 border border-white/30">
            <Sparkles className="w-3 h-3" />
            AI-Crafted Itinerary
          </div>

          <h2 className="text-[1.7rem] font-black text-white leading-tight mb-1 drop-shadow-sm">
            {itinerary.title}
          </h2>
          <p className="text-white/75 text-sm font-medium">
            ✦ Curated with <span className="text-white font-bold">{guideName}</span>
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-5">
            {[
              { val: `${itinerary.days.length}`, label: "Days"      },
              { val: `${itinerary.days.length * 3}`, label: "Activities" },
              { val: `${itinerary.tips.length}`,  label: "Local Tips" },
            ].map((s) => (
              <div key={s.label} className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/20">
                <p className="text-xl font-black text-white leading-none">{s.val}</p>
                <p className="text-[10px] text-white/70 font-semibold mt-0.5 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
            {/* Share */}
            <button
              onClick={handleShare}
              className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/25 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Day Cards ───────────────────────────────────────────── */}
      <div className="space-y-3">
        {itinerary.days.map((day, idx) => {
          const pal = DAY_PALETTES[idx % DAY_PALETTES.length];
          const isOpen = openDay === day.day;

          return (
            <div
              key={day.day}
              className={cn(
                "bg-white rounded-[2rem] overflow-hidden shadow-sm border-2 transition-all duration-300",
                isOpen ? `border-transparent ring-2 ${pal.ring} shadow-lg` : "border-transparent hover:border-slate-100"
              )}
            >
              {/* Day header */}
              <button
                onClick={() => setOpenDay(isOpen ? 0 : day.day)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                {/* Gradient day badge */}
                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex flex-col items-center justify-center text-white shadow-md flex-shrink-0 transition-transform", pal.bg, isOpen && "scale-105")}>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-75 leading-none">Day</span>
                  <span className="text-2xl font-black leading-tight">{day.day}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn("font-black text-[15px] leading-snug", isOpen ? "text-charcoal" : "text-charcoal")}>
                    {day.title}
                  </p>
                  {!isOpen && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {TIME_SLOTS.map(s => (
                        <span key={s.key} className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", pal.pillBg, pal.pillText)}>
                          {s.emoji}
                        </span>
                      ))}
                      <span className="text-[10px] text-muted-foreground font-medium ml-1">Tap to explore</span>
                    </div>
                  )}
                </div>

                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all", isOpen ? `bg-gradient-to-br ${pal.bg}` : "bg-slate-100")}>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-white" />
                    : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Expanded activities */}
              {isOpen && (
                <div className="px-5 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Thin gradient divider */}
                  <div className={cn("h-0.5 rounded-full bg-gradient-to-r mb-5 opacity-30", pal.bg)} />

                  <div className="relative pl-6 space-y-0">
                    {/* Vertical timeline line */}
                    <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-slate-200 to-transparent rounded-full" />

                    {TIME_SLOTS.map((slot, sIdx) => (
                      <div key={slot.key} className={cn("relative flex items-start gap-4", sIdx < TIME_SLOTS.length - 1 && "pb-5")}>
                        {/* Timeline dot */}
                        <div className={cn("absolute -left-6 top-3 w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0", pal.dot)} />

                        <div className={cn("flex-1 rounded-2xl p-4 border", pal.pillBg, `border-${pal.dot.replace('bg-', '')}/20`)}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-base leading-none">{slot.emoji}</span>
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", pal.pillText)}>
                              {slot.label}
                            </span>
                          </div>
                          <p className="text-sm text-charcoal font-semibold leading-snug">
                            {day[slot.key]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Local Tips ──────────────────────────────────────────── */}
      <div className="mt-3">
        <button
          onClick={() => setShowTips(v => !v)}
          className={cn(
            "w-full text-left rounded-[2rem] overflow-hidden transition-all duration-300 shadow-sm",
            showTips
              ? "bg-gradient-to-br from-[#006B3F] to-[#1a7a50] ring-2 ring-emerald-200"
              : "bg-white border-2 border-transparent hover:border-slate-100"
          )}
        >
          <div className="flex items-center gap-4 p-5">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl shadow-sm transition-all", showTips ? "bg-white/20" : "bg-emerald-50")}>
              💡
            </div>
            <div className="flex-1">
              <p className={cn("font-black text-[15px]", showTips ? "text-white" : "text-charcoal")}>
                Local Tips
              </p>
              <p className={cn("text-xs font-medium mt-0.5", showTips ? "text-white/70" : "text-muted-foreground")}>
                {itinerary.tips.length} insider insights from {guideName}
              </p>
            </div>
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all", showTips ? "bg-white/20" : "bg-slate-100")}>
              {showTips
                ? <ChevronUp className="w-4 h-4 text-white" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>

          {showTips && (
            <div className="px-5 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid gap-3">
                {itinerary.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/10 border border-white/20 rounded-2xl p-3.5">
                    <span className="text-xl leading-none flex-shrink-0 mt-0.5">
                      {TIP_EMOJIS[i % TIP_EMOJIS.length]}
                    </span>
                    <p className="text-sm text-white font-medium leading-snug">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </button>
      </div>

      {/* ── Footer note ─────────────────────────────────────────── */}
      <div className="mt-4 flex items-start gap-2.5 px-1">
        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <MapPin className="w-3 h-3 text-slate-400" />
        </div>
        <p className="text-xs text-muted-foreground font-medium leading-snug">
          This itinerary is a starting point — work with{" "}
          <span className="font-bold text-charcoal">{guideName}</span>{" "}
          to personalise every detail to your pace and interests.
        </p>
      </div>
    </div>
  );
};

export default ItineraryCard;

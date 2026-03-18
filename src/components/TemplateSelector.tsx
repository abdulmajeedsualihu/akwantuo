import { useState, useRef } from "react";
import { Check } from "lucide-react";

interface TemplateSelectorProps {
  photos: string[];
  category: string;
  onSelect: (template: string) => void;
}

const templates = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean & modern",
    bg: "bg-card",
    accent: "border-primary",
    textStyle: "font-semibold",
  },
  {
    id: "cultural",
    name: "Cultural",
    description: "Kente-inspired warmth",
    bg: "kente-pattern",
    accent: "border-accent",
    textStyle: "font-bold",
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "Bold market style",
    bg: "bg-primary/5",
    accent: "border-primary",
    textStyle: "font-black",
  },
];

const TemplateSelector = ({ photos, onSelect }: TemplateSelectorProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      <div className="space-y-2 text-center mb-6">
        <h1 className="text-display tracking-tight">Pick your style</h1>
        <p className="text-muted-foreground text-body">Swipe to explore — AI picked these for you</p>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSelected(t.id);
              setTimeout(() => onSelect(t.id), 400);
            }}
            className={`min-w-[280px] flex-shrink-0 rounded-2xl border-2 overflow-hidden snap-center press-feedback transition-all ${
              selected === t.id ? t.accent + " ring-2 ring-primary/20" : "border-border"
            }`}
          >
            {/* Mock tour site preview */}
            <div className={`${t.id === "cultural" ? "kente-pattern" : t.bg} p-4 space-y-3`}>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-foreground/20 rounded-pill" />
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>

              {/* Product image */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-secondary">
                {photos[0] ? (
                  <img src={photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full kente-pattern" />
                )}
              </div>

              {/* Product info skeleton */}
              <div className="space-y-2 text-left">
                <div className="h-4 w-3/4 bg-foreground/15 rounded" />
                <div className="h-3 w-1/2 bg-foreground/10 rounded" />
                <div className="h-5 w-20 bg-primary/20 rounded-pill" />
              </div>
            </div>

            {/* Label */}
            <div className="p-3 bg-card flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              {selected === t.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;

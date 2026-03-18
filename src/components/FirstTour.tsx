import { useState } from "react";
import { ChevronLeft, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FirstTourProps {
  initialData?: any;
  onBack: () => void;
  onContinue: (data: any) => void;
}

const FirstTour = ({ initialData, onBack, onContinue }: FirstTourProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [duration, setDuration] = useState(initialData?.duration || "1h");
  const [price, setPrice] = useState(initialData?.price || "0.00");
  const [description, setDescription] = useState(initialData?.description || "");
  const [highlights, setHighlights] = useState<string[]>(
    initialData?.highlights || ["Historical Landmarks", "Local Cuisine"]
  );
  const [newHighlight, setNewHighlight] = useState("");

  const durations = ["1h", "2h", "3h", "Half", "Full"];

  const addHighlight = () => {
    if (newHighlight && !highlights.includes(newHighlight)) {
      setHighlights([...highlights, newHighlight]);
      setNewHighlight("");
    }
  };

  const removeHighlight = (h: string) => {
    setHighlights(highlights.filter((item) => item !== h));
  };

  return (
    <div className="min-h-screen bg-[#f1f4f8] flex flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-[440px] flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <header className="flex items-center justify-between py-4 sm:py-6">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-charcoal hover:bg-white/50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-charcoal flex-1 text-center mr-8">Onboarding</h1>
        </header>

        {/* Progress Bar */}
        <div className="flex justify-center gap-1.5 mb-8 sm:mb-12">
          <div className="h-1.5 w-10 rounded-full bg-primary-navy/20" />
          <div className="h-1.5 w-10 rounded-full bg-primary-navy/20" />
          <div className="h-1.5 w-16 rounded-full bg-primary-navy" />
        </div>

        {/* Page Titles */}
        <div className="space-y-3 mb-8 sm:mb-10 sm:text-center">
          <h2 className="text-[28px] sm:text-[36px] font-extrabold text-charcoal tracking-tight leading-tight">
            Create your first experience
          </h2>
          <p className="text-muted-foreground font-medium text-[15px] sm:text-[17px]">
            You can add more tours and activities later from your dashboard.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 flex-1 overflow-y-auto pb-10 custom-scrollbar">
          {/* Tour Title */}
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">
              Experience Title
            </label>
            <div className="h-16 bg-white border border-transparent rounded-2xl px-5 flex items-center shadow-sm focus-within:border-primary-navy transition-all">
              <input 
                type="text" 
                placeholder="e.g. Cape Coast Castle History Walk"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent outline-none text-[15px] font-semibold text-charcoal placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">
              Duration
            </label>
            <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-transparent">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "flex-1 h-11 rounded-xl text-[14px] font-bold transition-all",
                    duration === d 
                      ? "bg-primary-navy text-white shadow-md" 
                      : "text-charcoal/60 hover:bg-slate-50"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">
              Price per person
            </label>
            <div className="h-16 bg-white border border-transparent rounded-2xl px-5 flex items-center shadow-sm focus-within:border-primary-navy transition-all">
              <span className="text-[16px] font-bold text-slate-400 mr-3">$</span>
              <input 
                type="text" 
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-transparent outline-none text-[16px] font-bold text-charcoal placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">
              Description
            </label>
            <div className="bg-white border border-transparent rounded-2xl p-5 shadow-sm focus-within:border-primary-navy transition-all">
              <textarea 
                placeholder="Tell travelers what makes this tour special..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-transparent outline-none text-[15px] font-semibold text-charcoal placeholder:text-muted-foreground/40 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-3">
            <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">
              Highlights
            </label>
            <div className="bg-white border border-transparent rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex flex-wrap gap-2">
                {highlights.map((h) => (
                  <div
                    key={h}
                    className="h-10 px-4 rounded-full bg-slate-100 flex items-center gap-2 text-[13px] font-bold text-primary-navy"
                  >
                    {h}
                    <button onClick={() => removeHighlight(h)}>
                      <X size={14} className="opacity-40 hover:opacity-100" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-1">
                <input 
                  type="text"
                  placeholder="Add highlight..."
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addHighlight()}
                  className="flex-1 bg-transparent outline-none text-[14px] font-medium text-charcoal placeholder:text-muted-foreground/60"
                />
                <button 
                  onClick={addHighlight}
                  className="text-primary-navy p-1 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="py-6 mt-auto">
          <Button
            onClick={() => onContinue({ title, duration, price, description, highlights })}
            disabled={!title || !description}
            className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FirstTour;

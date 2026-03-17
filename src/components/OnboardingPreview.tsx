import { ChevronLeft, PartyPopper, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingPreviewProps {
  data: any;
  onBack: () => void;
  onPublish: () => void;
  onEdit: () => void;
}

const OnboardingPreview = ({ data, onBack, onPublish, onEdit }: OnboardingPreviewProps) => {
  return (
    <div className="min-h-screen bg-[#f1f4f8] flex flex-col items-center p-4">
      <div className="w-full max-w-[400px] flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-charcoal hover:bg-white/50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-charcoal flex-1 text-center mr-8">Onboarding</h1>
        </header>

        {/* Progress Bar */}
        <div className="flex justify-center gap-1.5 mb-8">
          <div className="h-1.5 w-1.5 rounded-full bg-primary-navy/20" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary-navy/20" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary-navy/20" />
          <div className="h-1.5 w-10 rounded-full bg-primary-navy" />
        </div>

        {/* Page Titles */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-slate-200/50 flex items-center justify-center text-primary-navy">
            <PartyPopper size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-[32px] font-extrabold text-charcoal tracking-tight leading-tight">
              Your page is ready
            </h2>
            <p className="text-muted-foreground font-medium text-[15px] px-4">
              Take a look at how your profile will appear to the public.
            </p>
          </div>
        </div>

        {/* Mobile Mockup */}
        <div className="flex-1 flex justify-center mb-8">
          <div className="w-[300px] h-[480px] bg-white rounded-[3rem] border-[8px] border-charcoal shadow-2xl overflow-hidden flex flex-col relative transform hover:scale-105 transition-transform duration-500">
            {/* Mockup Notch/Status Bar */}
            <div className="h-6 w-full flex items-center justify-between px-6 pt-4">
              <span className="text-[10px] font-bold">9:41</span>
              <div className="flex gap-1 items-center">
                <div className="w-3 h-2 border border-black/20 rounded-[1px]" />
                <div className="w-3 h-3 rounded-full border border-black/20" />
              </div>
            </div>

            {/* Mockup Profile Content */}
            <div className="flex flex-col items-center">
              <div className="w-full h-24 bg-primary-navy mb-[-48px]" />
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 z-10">
                {data.mainPhoto ? (
                  <img src={data.mainPhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <MapPin size={32} strokeWidth={1} />
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center space-y-1">
                <h3 className="text-lg font-bold text-charcoal">{data.displayName || "Alex Rivers"}</h3>
                <p className="text-[12px] font-bold text-primary-navy uppercase tracking-wide">
                  {data.tour?.title || "Mountain & Trail Guide"}
                </p>
              </div>

              <div className="w-full px-6 mt-6 space-y-3">
                <div className="h-10 bg-[#f8fafc] rounded-xl flex items-center px-4 gap-3 shadow-sm border border-slate-50">
                  <CheckCircle2 size={16} className="text-primary-navy" />
                  <span className="text-[11px] font-bold text-charcoal/70">Certified Professional</span>
                </div>
                <div className="h-10 bg-[#f8fafc] rounded-xl flex items-center px-4 gap-3 shadow-sm border border-slate-50">
                  <MapPin size={16} className="text-primary-navy" />
                  <span className="text-[11px] font-bold text-charcoal/70">{data.location || "Chamonix, France"}</span>
                </div>
              </div>

              {/* Placeholder content */}
              <div className="w-full px-6 mt-6 space-y-2 opacity-30">
                <div className="h-2 w-[80%] bg-slate-200 rounded-full" />
                <div className="h-2 w-full bg-slate-200 rounded-full" />
                <div className="h-2 w-[60%] bg-slate-200 rounded-full" />
              </div>

              <div className="w-full px-6 mt-8 flex gap-3 opacity-30">
                <div className="flex-1 h-10 bg-slate-200 rounded-xl" />
                <div className="flex-1 h-10 bg-primary-navy rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 py-6 mt-auto">
          <Button
            onClick={onPublish}
            className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg"
          >
            Publish my page
          </Button>
          <Button
            variant="outline"
            onClick={onEdit}
            className="w-full h-[4.5rem] border-transparent bg-white hover:bg-white/90 rounded-2xl text-charcoal text-lg font-bold shadow-sm"
          >
            Edit details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPreview;

import { X, Check, Link2, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingSuccessProps {
  onDone: () => void;
  onShare: () => void;
  url: string;
}

const OnboardingSuccess = ({ onDone, onShare, url = "akwantuo.com/kwesi-tours" }: OnboardingSuccessProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      <div className="w-full max-w-[400px] flex flex-col h-full animate-in zoom-in-95 duration-700">
        {/* Header */}
        <header className="flex items-center justify-between py-6 border-b border-slate-100">
          <button 
            onClick={onDone}
            className="p-2 -ml-2 text-charcoal hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <h1 className="text-lg font-bold text-charcoal flex-1 text-center mr-8">Success</h1>
        </header>

        {/* Success Icon */}
        <div className="flex flex-col items-center mt-12 mb-10 relative">
          <div className="w-32 h-32 rounded-full bg-[#f1f4f8] flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-full bg-primary-navy flex items-center justify-center text-white shadow-xl">
              <Check size={40} strokeWidth={3} />
            </div>
            
            {/* Decorative Dots */}
            <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-amber-400" />
            <div className="absolute top-4 left-[-8px] w-4 h-4 rounded-full bg-rose-400" />
            <div className="absolute bottom-4 right-[-12px] w-4 h-4 rounded-full bg-emerald-400" />
            <div className="absolute bottom-0 left-4 w-4 h-4 rounded-full bg-sky-400" />
          </div>

          <div className="mt-8 text-center space-y-3">
            <h2 className="text-[36px] font-extrabold text-charcoal tracking-tight leading-tight">
              You're live!
            </h2>
            <p className="text-muted-foreground font-medium text-[15px] px-8 leaded-relaxed">
              Your page is live at the link below. Share it with tourists to start getting bookings.
            </p>
          </div>
        </div>

        {/* Link Share Box */}
        <div className="bg-[#f8fafc] rounded-2xl p-5 border border-slate-100 mb-8 space-y-4">
          <div className="flex items-center bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
            <Link2 size={20} className="text-primary-navy mr-3 ml-1" />
            <span className="flex-1 text-[14px] font-bold text-charcoal truncate">
              {url}
            </span>
            <button className="h-10 px-6 bg-white border border-slate-100 rounded-lg text-primary-navy font-bold text-[14px] hover:bg-slate-50 transition-all ml-2 shadow-sm">
              Copy
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center space-y-6 mb-10">
          <div className="w-48 h-48 p-4 bg-orange-50 rounded-3xl border border-orange-100 shadow-lg flex items-center justify-center relative">
             <div className="w-full h-full bg-white rounded-2xl shadow-sm p-4 relative overflow-hidden flex items-center justify-center">
                {/* Mock QR Code Pattern */}
                <div className="w-full h-full bg-slate-900/5 grid grid-cols-6 grid-rows-6 gap-1 p-1">
                  {[...Array(36)].map((_, i) => (
                    <div key={i} className={i % 3 === 0 ? "bg-slate-800" : "bg-transparent"} />
                  ))}
                </div>
                {/* QR Finder patterns */}
                <div className="absolute top-3 left-3 w-8 h-8 border-4 border-slate-800" />
                <div className="absolute top-3 right-3 w-8 h-8 border-4 border-slate-800" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-4 border-slate-800" />
             </div>
          </div>
          <button className="flex items-center gap-2 text-[14px] font-black tracking-widest text-primary-navy uppercase hover:underline">
            <Download size={18} />
            Download QR code
          </button>
        </div>

        {/* Final CTAs */}
        <div className="space-y-3 py-6 mt-auto">
          <Button
            onClick={onDone}
            className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg"
          >
            Go to my dashboard
          </Button>
          <Button
            onClick={onShare}
            className="w-full h-[4.5rem] bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white text-lg font-bold shadow-lg flex items-center justify-center gap-3"
          >
            <MessageCircle size={24} />
            Share on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSuccess;

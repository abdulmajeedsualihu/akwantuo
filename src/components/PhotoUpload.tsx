import { useState, useRef } from "react";
import { Camera, Plus, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  onBack: () => void;
  onContinue: (data: { mainPhoto: string; gallery: string[] }) => void;
  onSkip: () => void;
}

const PhotoUpload = ({ onBack, onContinue, onSkip }: PhotoUploadProps) => {
  const [mainPhoto, setMainPhoto] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  
  const mainFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const handleMainPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setMainPhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (gallery.length < 6) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            setGallery((prev) => [...prev, ev.target?.result as string].slice(0, 6));
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeGalleryPhoto = (idx: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== idx));
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
        </header>

        {/* Progress Bar */}
        <div className="flex justify-center gap-1.5 mb-8 sm:mb-12">
          <div className="h-1.5 w-12 rounded-full bg-primary-navy" />
          <div className="h-1.5 w-6 rounded-full bg-primary-navy/20" />
          <div className="h-1.5 w-6 rounded-full bg-primary-navy/20" />
          <div className="h-1.5 w-6 rounded-full bg-primary-navy/20" />
        </div>

        {/* Page Titles */}
        <div className="space-y-3 mb-8 sm:mb-10 sm:text-center">
          <h2 className="text-[28px] sm:text-[36px] font-extrabold text-charcoal tracking-tight leading-tight">
            Add your photos
          </h2>
          <p className="text-muted-foreground font-medium text-[15px] sm:text-[17px]">
            A great photo is your first impression.
          </p>
        </div>

        {/* Main Photo Upload */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative">
            <button
              onClick={() => mainFileRef.current?.click()}
              className={cn(
                "w-44 h-44 rounded-full border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all overflow-hidden",
                mainPhoto ? "border-primary-navy bg-white" : "border-slate-300 bg-slate-100/50 hover:bg-slate-100"
              )}
            >
              {mainPhoto ? (
                <img src={mainPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={32} className="text-primary-navy" />
                  <span className="text-[11px] font-black tracking-widest text-primary-navy uppercase">Add Photo</span>
                </>
              )}
            </button>
            <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary-navy rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
              <Plus size={20} strokeWidth={3} />
            </div>
          </div>
          <p className="text-[14px] font-bold text-charcoal mt-4">Main guide photo</p>
        </div>

        {/* Gallery Grid */}
        <div className="space-y-4 mb-10">
          <h3 className="text-[18px] font-extrabold text-charcoal px-1">Experience Gallery</h3>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square relative">
                {gallery[i] ? (
                  <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-white shadow-sm relative group">
                    <img src={gallery[i]} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeGalleryPhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-charcoal/80 text-white rounded-full flex items-center justify-center hover:bg-charcoal transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => galleryFileRef.current?.click()}
                    className="w-full h-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/30 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-slate-400 transition-all"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Inputs */}
        <input type="file" ref={mainFileRef} className="hidden" accept="image/*" onChange={handleMainPhoto} />
        <input type="file" ref={galleryFileRef} className="hidden" accept="image/*" multiple onChange={handleGalleryPhotos} />

        {/* Actions */}
        <div className="space-y-4 py-8 mt-auto">
          <Button
            onClick={() => mainPhoto && onContinue({ mainPhoto, gallery })}
            disabled={!mainPhoto}
            className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            Continue
          </Button>
          <button 
            onClick={onSkip}
            className="w-full text-center text-[15px] font-bold text-primary-navy hover:underline transition-all"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;

import { useState, useRef } from "react";
import { Camera, X, Plus, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadProps {
  onComplete: (photos: string[]) => void;
}

const PhotoUpload = ({ onComplete }: PhotoUploadProps) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 3 - photos.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => [...prev, ev.target?.result as string].slice(0, 3));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-display tracking-tight">Add your products</h1>
          <p className="text-muted-foreground text-body">Take up to 3 photos — AI does the rest</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border">
              <img src={photo} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1.5 right-1.5 w-7 h-7 bg-foreground/70 rounded-full flex items-center justify-center press-feedback"
              >
                <X className="w-4 h-4 text-background" />
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 press-feedback hover:border-primary hover:bg-primary/5 transition-colors"
            >
              {photos.length === 0 ? (
                <Camera className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Plus className="w-6 h-6 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground font-medium">
                {photos.length === 0 ? "Take Photo" : "Add More"}
              </span>
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFile}
          className="hidden"
        />

        <Button
          onClick={() => onComplete(photos)}
          disabled={photos.length === 0}
          className="w-full"
          size="lg"
        >
          <Sparkles className="w-5 h-5" />
          Generate My Store
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default PhotoUpload;

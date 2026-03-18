import { useState, useEffect } from "react";
import { ChevronLeft, MapPin, CheckCircle2, Plus, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { checkDisplayNameUnique } from "@/lib/onboardingService";

interface ProfileDetailsProps {
  initialData?: {
    displayName: string;
    location: string;
    phone: string;
    bio: string;
    languages: string[];
  };
  onBack: () => void;
  onContinue: (data: any) => void;
}

const ProfileDetails = ({ initialData, onBack, onContinue }: ProfileDetailsProps) => {
  const [displayName, setDisplayName] = useState(initialData?.displayName || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    initialData?.languages || ["English", "Twi"]
  );
  const [isNameUnique, setIsNameUnique] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const availableLanguages = ["English", "French", "Twi", "Ga", "Hausa"];

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (displayName.trim().length >= 3) {
        setIsChecking(true);
        const unique = await checkDisplayNameUnique(displayName);
        setIsNameUnique(unique);
        setIsChecking(false);
      } else {
        setIsNameUnique(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [displayName]);

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
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
          <h1 className="text-lg font-bold text-charcoal flex-1 text-center mr-8">Guide Profile</h1>
        </header>

        {/* Progress Bar */}
        <div className="flex justify-center gap-1.5 mb-8 sm:mb-12">
          <div className="h-1.5 w-6 rounded-full bg-primary-navy/20" />
          <div className="h-1.5 w-12 rounded-full bg-primary-navy" />
          <div className="h-1.5 w-6 rounded-full bg-primary-navy/20" />
          <div className="h-1.5 w-6 rounded-full bg-primary-navy/20" />
        </div>

        {/* Page Titles */}
        <div className="space-y-3 mb-8 sm:mb-10 sm:text-center">
          <h2 className="text-[28px] sm:text-[36px] font-extrabold text-charcoal tracking-tight leading-tight">
            Create your guide profile
          </h2>
          <p className="text-muted-foreground font-medium text-[15px] sm:text-[17px]">
            Help travelers get to know your passion for hosting and local culture.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 flex-1 overflow-y-auto pb-10 custom-scrollbar">
          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">
              Public Name (Unique)
            </label>
            <div className={cn(
              "h-16 bg-white border border-transparent rounded-2xl px-5 flex items-center shadow-sm transition-all focus-within:border-primary-navy",
              isNameUnique === false && "border-red-500 focus-within:border-red-500"
            )}>
              <input 
                type="text" 
                placeholder="e.g. Kwesi the Guide"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-transparent outline-none text-[15px] font-semibold text-charcoal placeholder:text-muted-foreground/40"
              />
              {isChecking && <Loader2 size={20} className="text-primary-navy animate-spin ml-2" />}
              {isNameUnique === true && <CheckCircle2 size={20} className="text-green-500 ml-2" />}
              {isNameUnique === false && <AlertCircle size={20} className="text-red-500 ml-2" />}
            </div>
            {isNameUnique === false && (
              <p className="text-[11px] text-red-500 font-bold px-1">This name is already taken by another guide.</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">
              Primary Location
            </label>
            <div className="h-16 bg-white border border-transparent rounded-2xl px-5 flex items-center shadow-sm focus-within:border-primary-navy transition-all">
              <input 
                type="text" 
                placeholder="e.g. Cape Coast, Ghana"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent outline-none text-[15px] font-semibold text-charcoal placeholder:text-muted-foreground/40"
              />
              <MapPin size={20} className="text-slate-400 ml-2" />
            </div>
          </div>

          {/* WhatsApp Number (Read Only/Verified) */}
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">
              WhatsApp for Bookings
            </label>
            <div className="h-16 bg-[#f8fafc] border border-transparent rounded-2xl px-5 flex items-center shadow-sm">
              <span className="text-[15px] font-semibold text-charcoal/50">
                {initialData?.phone || "+233 24 123 4567"}
              </span>
              <CheckCircle2 size={20} className="text-green-500 fill-green-500/10 ml-auto" />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium px-1">Verified for your security</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase">
                Guide Bio
              </label>
              <span className="text-[11px] font-bold text-muted-foreground/60">{bio.length}/400</span>
            </div>
            <div className="bg-white border border-transparent rounded-2xl p-5 shadow-sm focus-within:border-primary-navy transition-all">
              <textarea 
                placeholder="Share your experience, your favorite hidden gems, and why travelers should book with you..."
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 400))}
                rows={4}
                className="w-full bg-transparent outline-none text-[15px] font-semibold text-charcoal placeholder:text-muted-foreground/40 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-3">
            <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">
              Tour Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={cn(
                      "h-11 px-6 rounded-pill flex items-center gap-2 text-[14px] font-bold transition-all border",
                      isSelected 
                        ? "bg-primary-navy text-white border-primary-navy" 
                        : "bg-white text-charcoal border-transparent shadow-sm hover:border-slate-200"
                    )}
                  >
                    {lang}
                    {isSelected && <X size={14} strokeWidth={3} className="ml-1 opacity-60" />}
                  </button>
                );
              })}
              <button className="w-11 h-11 rounded-full bg-slate-200/50 flex items-center justify-center text-charcoal hover:bg-slate-200 transition-colors">
                <Plus size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="py-6 mt-auto">
          <Button
            onClick={() => onContinue({ displayName, location, bio, languages: selectedLanguages })}
            disabled={!displayName || !location || isChecking || isNameUnique === false}
            className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg disabled:opacity-50"
          >
            {isChecking ? "Checking name..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;

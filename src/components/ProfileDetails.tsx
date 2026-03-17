import { useState } from "react";
import { ChevronLeft, MapPin, CheckCircle2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const availableLanguages = ["English", "French", "Twi", "Ga", "Hausa"];

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

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
          <h1 className="text-lg font-bold text-charcoal flex-1 text-center mr-8">Profile Details</h1>
        </header>

        {/* Progress Bar */}
        <div className="flex justify-center gap-1.5 mb-10">
          <div className="h-1.5 w-6 rounded-full bg-primary-navy/20" />
          <div className="h-1.5 w-12 rounded-full bg-primary-navy" />
          <div className="h-1.5 w-6 rounded-full bg-primary-navy/20" />
          <div className="h-1.5 w-6 rounded-full bg-primary-navy/20" />
        </div>

        {/* Page Titles */}
        <div className="space-y-3 mb-8">
          <h2 className="text-[32px] font-extrabold text-charcoal tracking-tight leading-tight">
            Tell us about yourself
          </h2>
          <p className="text-muted-foreground font-medium text-[16px]">
            Help others get to know you better by completing your profile.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 flex-1 overflow-y-auto pb-10 custom-scrollbar">
          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">
              Display Name
            </label>
            <div className="h-16 bg-white border border-transparent rounded-2xl px-5 flex items-center shadow-sm focus-within:border-primary-navy transition-all">
              <input 
                type="text" 
                placeholder="e.g. Kwesi Mensah"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-transparent outline-none text-[15px] font-semibold text-charcoal placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase px-1">
              Location
            </label>
            <div className="h-16 bg-white border border-transparent rounded-2xl px-5 flex items-center shadow-sm focus-within:border-primary-navy transition-all">
              <input 
                type="text" 
                placeholder="Accra, Ghana"
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
              WhatsApp Number
            </label>
            <div className="h-16 bg-[#f8fafc] border border-transparent rounded-2xl px-5 flex items-center shadow-sm">
              <span className="text-[15px] font-semibold text-charcoal/50">
                {initialData?.phone || "+233 24 123 4567"}
              </span>
              <CheckCircle2 size={20} className="text-green-500 fill-green-500/10 ml-auto" />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium px-1">Verified from previous step</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black tracking-widest text-charcoal/60 uppercase">
                Bio
              </label>
              <span className="text-[11px] font-bold text-muted-foreground/60">{bio.length}/400</span>
            </div>
            <div className="bg-white border border-transparent rounded-2xl p-5 shadow-sm focus-within:border-primary-navy transition-all">
              <textarea 
                placeholder="Share a bit about your interests, hobbies, or what you're looking for..."
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
              Languages
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
            disabled={!displayName || !location}
            className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;

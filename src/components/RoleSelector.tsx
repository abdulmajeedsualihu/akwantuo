import { useState } from "react";
import { MapPin, Luggage, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AkwantuoLogo from "./AkwantuoLogo";
import { cn } from "@/lib/utils";

type Role = "guide" | "tourist" | null;

interface RoleSelectorProps {
  onBack: () => void;
  onContinue: (role: Role) => void;
}

const ROLES = [
  {
    id: "guide" as Role,
    icon: <MapPin className="w-6 h-6 text-primary-navy" />,
    title: "I'm a Tour Guide",
    desc: "Create your page and receive bookings from tourists",
    image: "/role_guide.png",
    bgIcon: "bg-blue-50",
    borderSelected: "border-primary-navy ring-2 ring-primary-navy/30",
  },
  {
    id: "tourist" as Role,
    icon: <Luggage className="w-6 h-6 text-amber-600" />,
    title: "I'm a Tourist",
    desc: "Find and book trusted local guides in Ghana",
    image: "/role_tourist.png",
    bgIcon: "bg-amber-50",
    borderSelected: "border-amber-500 ring-2 ring-amber-400/30",
  },
];

const RoleSelector = ({ onBack, onContinue }: RoleSelectorProps) => {
  const [selected, setSelected] = useState<Role>(null);

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f4fa]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </button>
        <div className="flex items-center gap-2">
          <AkwantuoLogo variant="boxed" size="sm" />
          <span className="font-bold text-charcoal text-lg">Akwantuo</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col px-6 pt-4 pb-6 max-w-4xl mx-auto w-full">
        {/* Title */}
        <div className="mb-4 space-y-1 text-center">
          <h1 className="text-3xl font-black text-charcoal tracking-tight">Akwaaba, Charle</h1>
          <p className="text-sm text-muted-foreground font-medium">Tell us how you'll be using Akwantuo</p>
        </div>

        {/* Tap hint */}
        <p className="text-center text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">👆 Tap a card to select your role</p>
        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={cn(
                  "w-full text-left bg-white rounded-[2rem] border-2 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]",
                  isSelected ? role.borderSelected : "border-transparent"
                )}
              >
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", role.bgIcon)}>
                        {role.icon}
                      </div>
                      <div>
                        <p className="text-lg font-black text-charcoal">{role.title}</p>
                        <p className="text-sm text-muted-foreground font-medium leading-snug max-w-[220px]">{role.desc}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-7 h-7 text-primary-navy flex-shrink-0" />
                    )}
                  </div>
                </div>
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={role.image}
                    alt={role.title}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-700",
                      isSelected && "scale-105"
                    )}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <Button
            onClick={() => selected && onContinue(selected)}
            disabled={!selected}
            className={cn(
              "w-full h-16 rounded-2xl text-base font-black shadow-xl transition-all duration-300",
              selected
                ? "bg-primary-navy hover:bg-primary-navy/90 text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            Continue
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RoleSelector;

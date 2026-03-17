import { MapPin, ShieldCheck, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface AkwantuoLogoProps {
  variant?: "boxed" | "circle" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AkwantuoLogo = ({ variant = "boxed", size = "md", className }: AkwantuoLogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: 16,
    md: 32,
    lg: 40,
  };

  if (variant === "text") {
    return (
      <h1 className={cn("text-2xl font-bold text-primary-navy tracking-tight", className)}>
        Akwantuo
      </h1>
    );
  }

  if (variant === "circle") {
    return (
      <div className={cn(
        "bg-secondary rounded-full flex items-center justify-center",
        sizeClasses[size],
        className
      )}>
        <ShieldCheck 
          className="text-primary-navy" 
          size={iconSizes[size]} 
          strokeWidth={2.5}
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-primary-navy rounded-[1.25rem] shadow-lg flex items-center justify-center relative overflow-hidden",
      sizeClasses[size],
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="relative z-10">
        <MapPin 
          className="text-white fill-white/20" 
          size={iconSizes[size]} 
          strokeWidth={2}
        />
        <Heart 
          className="text-white fill-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-2px]" 
          size={iconSizes[size] / 3} 
        />
      </div>
    </div>
  );
};

export default AkwantuoLogo;

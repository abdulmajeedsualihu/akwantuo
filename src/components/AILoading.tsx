import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface AILoadingProps {
  onComplete: () => void;
}

const steps = [
  "Analyzing your photos...",
  "Detecting products and prices...",
  "Crafting your descriptions...",
  "Building your storefront...",
  "AI is polishing your shop...",
];

const AILoading = ({ onComplete }: AILoadingProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onComplete]);

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 animate-pulse">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-display tracking-tight">Creating magic</h2>
          <p className="text-muted-foreground text-body animate-fade-in" key={step}>
            {steps[step]}
          </p>
        </div>

        <div className="w-full bg-secondary rounded-pill h-2 overflow-hidden">
          <div
            className="h-full bg-primary rounded-pill transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AILoading;

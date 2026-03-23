import { useState, useEffect } from "react";
import { Sparkles, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface AILoadingProps {
  onComplete: () => void;
  error?: string | null;
  onRetry?: () => void;
  onSkip?: () => void;
}

const steps = [
  "Analyzing your photos...",
  "Detecting products and prices...",
  "Crafting your descriptions...",
  "Building your storefront...",
  "AI is polishing your shop...",
];

const AILoading = ({ onComplete, error, onRetry, onSkip }: AILoadingProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (error) return; // Stop cycling if there's an error

    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [error]);

  const progress = ((step + 1) / steps.length) * 100;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 animate-in fade-in duration-500">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>

          <div className="space-y-2">
            <h2 className="text-display tracking-tight">AI is a bit busy</h2>
            <p className="text-muted-foreground text-body">
              {error.includes("503") 
                ? "The AI service is temporarily overloaded. This usually resolves in a few seconds." 
                : "We hit a small snag while generating your profile magic."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={onRetry} 
              className="w-full gap-2 py-6 rounded-pill text-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </Button>
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="w-full gap-2 text-muted-foreground"
            >
              Continue Manually
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="pt-4 flex flex-col items-center">
            <button 
              onClick={onSkip}
              className="text-xs font-bold text-muted-foreground/60 hover:text-primary-navy transition-colors py-2"
            >
              Wait, that's fine. I'll finish manually
            </button>
        </div>
      </div>
    </div>
  );
};

export default AILoading;

import { ArrowRight, Sparkles, Zap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import AkwantuoLogo from "./AkwantuoLogo";

interface HeroLandingProps {
  onGetStarted: () => void;
}

const HeroLanding = ({ onGetStarted }: HeroLandingProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <AkwantuoLogo variant="boxed" size="sm" />
          <span className="font-bold text-charcoal tracking-tight text-lg">Akwantuo</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center px-6 pb-12">
        <div className="max-w-md mx-auto w-full space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-primary-navy/10 border border-primary-navy/20 rounded-pill px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-navy" />
            <span className="text-xs font-semibold text-primary-navy">AI-Powered</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight leading-[1.08] text-charcoal">
              Turn your photos into a shop in{" "}
              <span className="text-primary-navy">30 seconds</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              Snap your products, let AI build your storefront, share on WhatsApp. No tech skills needed.
            </p>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="w-full text-base"
            >
              Get Started — It's Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Join 2,000+ vendors already selling smarter
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3 pt-4">
            {[
              {
                icon: "📸",
                title: "Snap & Upload",
                desc: "Take photos of your products with your phone",
              },
              {
                icon: "✨",
                title: "AI Does the Work",
                desc: "Descriptions, pricing, and layout — automatic",
              },
              {
                icon: "💬",
                title: "Share on WhatsApp",
                desc: "One tap to send your store to customers",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 p-3.5 bg-card border-2 border-border rounded-xl shadow-hard"
              >
                <span className="text-xl mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          Built for vendors in Ghana 🇬🇭 · Works on 2G
        </p>
      </footer>
    </div>
  );
};

export default HeroLanding;

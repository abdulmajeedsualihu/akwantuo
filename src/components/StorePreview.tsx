import { MessageSquare, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

import { buildLandingUrl } from "@/lib/share";

interface StorePreviewProps {
  businessName: string;
  description: string;
  price: string;
  negotiable: boolean;
  location: string;
  photo?: string;
  template: string;
  slug?: string;
}

const StorePreview = ({
  businessName,
  description,
  price,
  negotiable,
  location,
  photo,
  template,
  slug,
}: StorePreviewProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(
    () => buildLandingUrl({ slug, displayName: businessName }),
    [businessName, slug]
  );

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const templateStyles = {
    professional: "bg-card",
    cultural: "kente-pattern",
    vibrant: "bg-primary/5",
  };

  return (
    <div className="space-y-4">
      {/* Phone frame preview */}
      <div className="border-2 border-border rounded-2xl overflow-hidden shadow-hard bg-card">
        {/* Status bar mock */}
        <div className="flex items-center justify-between px-4 py-2 bg-foreground/5">
          <span className="text-xs font-medium text-muted-foreground">9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-muted-foreground/40 rounded-sm" />
            <div className="w-2 h-2 bg-muted-foreground/40 rounded-full" />
          </div>
        </div>

        {/* Store content */}
        <div className={templateStyles[template as keyof typeof templateStyles] || "bg-card"}>
          {/* Header */}
          <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {businessName ? businessName[0] : "S"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{businessName || "Your Tour Site"}</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs text-primary font-medium">Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product */}
          <div className="p-4 space-y-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-secondary">
              {photo ? (
                <img src={photo} alt={businessName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full kente-pattern flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Your experience photo</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-foreground">{businessName || "Experience Name"}</h3>
                <div className="flex items-baseline gap-1 shrink-0">
                  <span className="text-xl font-bold text-primary price">
                    GH₵{price || "0"}
                  </span>
                  {negotiable && (
                    <span className="text-xs text-accent font-semibold">· Negotiable</span>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {description || "AI-generated description will appear here..."}
              </p>

              {location && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>📍</span>
                  <span>{location}</span>
                </div>
              )}
            </div>

            {/* CTA in preview */}
            <div className="bg-primary/10 rounded-xl p-3 text-center">
              <p className="text-sm font-semibold text-primary">💬 Message to Book</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <Button variant="whatsapp" size="lg" className="w-full">
          <MessageSquare className="w-5 h-5" />
          Share to WhatsApp
        </Button>

        <Button variant="outline" size="default" className="w-full" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Link Copied!" : "Copy Site Link"}
        </Button>
      </div>
    </div>
  );
};

export default StorePreview;

import { MessageSquare, ExternalLink, ChevronRight } from "lucide-react";

import { buildVendorUrl } from "@/lib/share";

interface WhatsAppBubbleProps {
  businessName: string;
  price: string;
  photo?: string;
  visible: boolean;
}

const WhatsAppBubble = ({ businessName, price, photo, visible }: WhatsAppBubbleProps) => {
  if (!visible) return null;

  const shareUrl = buildVendorUrl(businessName);
  const whatsappMessage = encodeURIComponent(
    [
      `Hi! Check out my shop ${businessName || "my storefront"}: ${shareUrl}`,
      price ? `Price: GH₵${price}` : null,
    ]
      .filter(Boolean)
      .join("\n\n")
  );

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-card border-2 border-border rounded-2xl p-3 shadow-hard-lg max-w-sm mx-auto">
        <div className="flex items-center gap-1.5 mb-2">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
          <span className="text-label text-muted-foreground">WhatsApp Preview</span>
        </div>

        <div className="flex gap-3 items-start">
          {photo ? (
            <img
              src={photo}
              alt=""
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg kente-pattern flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{businessName || "Your Shop"}</p>
            <p className="text-xs text-muted-foreground">
              {price ? `GH₵${price}` : "Set your price"}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ExternalLink className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary font-medium break-all">{shareUrl}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (typeof window === "undefined") return;
            window.open(`https://wa.me/?text=${whatsappMessage}`, "_blank");
          }}
          className="w-full flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground rounded-xl mt-3 font-semibold press-feedback"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>Share to WhatsApp</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>
      </div>
    </div>
  );
};

export default WhatsAppBubble;

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Check, Link2, Download, MessageCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { buildLandingUrl, getSystemBaseUrl, slugifyDisplayName } from "@/lib/share";

interface OnboardingSuccessProps {
  onDone: () => void;
  onShare: () => void;
  displayName?: string;
  slug?: string;
}

const OnboardingSuccess = ({ onDone, onShare, displayName = "", slug }: OnboardingSuccessProps) => {
  const computedSlug = useMemo(
    () => slug?.toString().trim() || slugifyDisplayName(displayName),
    [slug, displayName]
  );
  const shareUrl = useMemo(
    () => buildLandingUrl({ slug: computedSlug || undefined, displayName }),
    [computedSlug, displayName]
  );
  const fallbackSlug = computedSlug || "tour";
  const baseDomain = useMemo(() => getSystemBaseUrl(), []);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [downloading, setDownloading] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const qrImageUrl = useMemo(() => {
    if (!shareUrl) {
      return "";
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&format=png&margin=1&data=${encodeURIComponent(
      shareUrl
    )}`;
  }, [shareUrl]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setCopyState("idle");
  }, [shareUrl]);

  const scheduleCopyReset = () => {
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => {
      setCopyState("idle");
    }, 2000);
  };

  const fallbackCopyText = (text: string) => {
    if (typeof document === "undefined") {
      return false;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  };

  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      let copied = false;
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
      } else {
        copied = fallbackCopyText(shareUrl);
      }

      if (!copied) {
        throw new Error("Native clipboard unavailable");
      }

      setCopyState("copied");
      toast.success("Link copied to clipboard");
    } catch {
      setCopyState("failed");
      toast.error("Could not copy the link");
    } finally {
      scheduleCopyReset();
    }
  };

  const handleDownload = async () => {
    if (!qrImageUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(qrImageUrl);
      if (!response.ok) {
        throw new Error("Failed to download QR code");
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${fallbackSlug}-qr.png`;
      link.click();
      URL.revokeObjectURL(objectUrl);
      toast.success("QR code downloaded");
    } catch {
      toast.error("Could not download the QR code");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (!shareLinkHref || typeof window === "undefined") return;
    const encoded = encodeURIComponent(`Hi! Check out my page: ${shareLinkHref}`);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    onShare();
  };

  const shareLinkHref = shareUrl || `${baseDomain}/${fallbackSlug}`;
  const copyDisabled = !shareUrl;
  const copyLabel =
    copyState === "copied" ? "Link copied!" : copyState === "failed" ? "Try again" : "Copy link";
  const downloadDisabled = !qrImageUrl || downloading;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-[440px] flex flex-col h-full animate-in zoom-in-95 duration-700">
        {/* Header */}
        <header className="flex items-center justify-between py-4 sm:py-6 border-b border-slate-100 mb-8">
          <button
            onClick={onDone}
            className="p-2 -ml-2 text-charcoal hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <h1 className="text-lg font-black tracking-widest uppercase text-primary-navy flex-1 text-center mr-8">Celebration</h1>
        </header>

        {/* Success Icon */}
        <div className="flex flex-col items-center mt-12 mb-10 relative">
          <div className="w-32 h-32 rounded-full bg-[#f1f4f8] flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-full bg-primary-navy flex items-center justify-center text-white shadow-xl">
              <Check size={40} strokeWidth={3} />
            </div>

            {/* Decorative Dots */}
            <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-amber-400" />
            <div className="absolute top-4 left-[-8px] w-4 h-4 rounded-full bg-rose-400" />
            <div className="absolute bottom-4 right-[-12px] w-4 h-4 rounded-full bg-emerald-400" />
            <div className="absolute bottom-0 left-4 w-4 h-4 rounded-full bg-sky-400" />
          </div>

          <div className="mt-8 text-center space-y-3">
            <h2 className="text-[36px] font-extrabold text-charcoal tracking-tight leading-tight">
              You're live!
            </h2>
            <p className="text-muted-foreground font-medium text-[15px] px-8 leaded-relaxed">
              Your tour site is live! Share it with travelers to start getting bookings.
            </p>
          </div>
        </div>

        {/* Link Share Box */}
        <div className="bg-[#f8fafc] rounded-2xl p-5 border border-slate-100 mb-8">
          <div className="flex items-start gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-primary-navy">
              <Link2 size={20} />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/80">
                Your experience site
              </p>
              <a
                href={shareLinkHref}
                target="_blank"
                rel="noreferrer"
                className="text-[14px] font-bold text-charcoal break-words hover:text-primary-navy transition-colors"
              >
                {shareLinkHref}
              </a>
              <p className="text-[11px] text-muted-foreground">
                Hosted on <span className="font-semibold text-charcoal">{baseDomain}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={copyDisabled}
              className={`h-10 px-5 bg-white border border-slate-100 rounded-lg font-black text-[14px] ${
                copyDisabled
                  ? "text-muted-foreground/70 cursor-not-allowed opacity-60"
                  : "text-primary-navy hover:bg-slate-50 transition-all shadow-sm"
              }`}
            >
              {copyLabel}
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center space-y-6 mb-10">
          <div className="w-48 h-48 p-4 bg-orange-50 rounded-3xl border border-orange-100 shadow-lg flex items-center justify-center relative">
            <div className="w-full h-full bg-white rounded-2xl shadow-sm p-4 relative overflow-hidden flex items-center justify-center">
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="Experience QR code"
                  className="w-full h-full object-cover rounded-2xl"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-slate-200 animate-pulse" />
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloadDisabled}
            className={`flex items-center gap-2 text-[14px] font-black tracking-widest text-primary-navy uppercase ${
              downloadDisabled ? "opacity-50 cursor-not-allowed" : "hover:underline"
            }`}
          >
            <Download size={18} />
            {downloading ? "Downloading..." : "Download QR code"}
          </button>
        </div>

        {/* Final CTAs */}
        <div className="space-y-3 py-6 mt-auto">
          <Button
            onClick={onDone}
            className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg"
          >
            Go to my experience desk
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (shareUrl) {
                window.open(shareUrl, "_blank");
              }
            }}
            className="w-full h-[4.5rem] rounded-2xl text-lg font-bold shadow-lg border-white/30 text-white/90 flex items-center justify-center gap-2"
          >
            <ArrowUpRight size={20} />
            View live page
          </Button>
          <Button
            onClick={handleShare}
            className="w-full h-[4.5rem] bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white text-lg font-bold shadow-lg flex items-center justify-center gap-3"
          >
            <MessageCircle size={24} />
            Share on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSuccess;

import { ChevronLeft, CheckCircle2, MapPin, Signal, Battery, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingPageTemplate from "./LandingPageTemplate";
import type { LandingPageRecord } from "@/lib/onboardingService";
import type { Database } from "@/integrations/supabase/types";

interface OnboardingPreviewProps {
  data: any;
  onBack: () => void;
  onPublish: () => void;
  onEdit: () => void;
  publishing?: boolean;
}

const OnboardingPreview = ({ data, onBack, onPublish, onEdit, publishing }: OnboardingPreviewProps) => {
  const mockRecord: LandingPageRecord = {
    slug: data.slug || "preview",
    storefront: {
      id: "preview-id",
      user_id: "preview-user",
      business_name: data.displayName || "Alex the Guide",
      location: data.location || "Accra, Ghana",
      description: JSON.stringify({
        text: data.tour?.description || "An authentic experience.",
        highlights: data.tour?.highlights || [],
        languages: data.languages || ["English"],
        duration: data.tour?.duration || "1h",
        price: data.tour?.price || "0.00",
        bio: data.bio || "",
        mainPhoto: data.mainPhoto || "",
        gallery: data.gallery || [],
      }),
      category: data.tour?.title || "Tour Guide",
      template: "professional",
      is_live: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Database["public"]["Tables"]["storefronts"]["Row"],
    profile: {
      display_name: data.displayName || "Alex the Guide",
      location: data.location || "Accra, Ghana",
      phone: data.phone || "",
    } as Database["public"]["Tables"]["profiles"]["Row"],
    descriptionPayload: {
      text: data.tour?.description || "An authentic experience.",
      highlights: data.tour?.highlights || [],
      languages: data.languages || ["English"],
      duration: data.tour?.duration || "1h",
      price: data.tour?.price || "0.00",
      bio: data.bio || "",
      mainPhoto: data.mainPhoto || "",
      gallery: data.gallery || [],
    },
  };

  const tourTitle = data.tour?.title || "Mountain & Trail Guide";
  const duration = data.tour?.duration || "1h";
  const priceTag = data.tour?.price ? `GH₵${data.tour.price}` : "Price pending";
  const highlights =
    Array.isArray(data.tour?.highlights) && data.tour.highlights.length
      ? data.tour.highlights.slice(0, 2).join(" · ")
      : "Add highlights";

  const languages =
    Array.isArray(data.languages) && data.languages.length
      ? data.languages.join(", ")
      : "English, Twi";

  const summaryStats = [
    { label: "Duration", value: duration },
    { label: "Starting price", value: priceTag },
    { label: "Languages", value: languages },
    { label: "Highlights", value: highlights },
  ];

  const previewHighlights = [
    { label: "Certified Professional", icon: <CheckCircle2 size={16} className="text-primary-navy" /> },
    {
      label: data.location || "Location pending",
      icon: <MapPin size={16} className="text-primary-navy" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f4f8] flex justify-center px-4 py-8 sm:px-8 md:py-16">
      <div className="w-full max-w-6xl flex flex-col gap-8 md:gap-12">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 text-center sm:text-left">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white shadow-sm border border-slate-200 text-charcoal hover:bg-slate-50 transition self-start sm:self-auto"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Onboarding</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">Your page is ready</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Take a look at how your profile will appear to the public.</p>
          </div>
          <div className="hidden sm:flex flex-col gap-1 items-end">
            <div className="h-1.5 rounded-full bg-primary-navy/20 w-16" />
            <div className="h-1.5 rounded-full bg-primary-navy/20 w-12" />
            <div className="h-1.5 rounded-full bg-primary-navy/20 w-8" />
            <div className="h-1.5 rounded-full bg-primary-navy w-20" />
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-center">
          <div className="flex flex-col gap-6 items-center w-full">
            {/* Realistic iOS Device Frame - Responsive scaling */}
            <div className="relative w-full max-w-[300px] sm:max-w-[360px] aspect-[9/19.6] max-h-[72vh] sm:max-h-[78vh] rounded-[3rem] sm:rounded-[3.5rem] border-[8px] sm:border-[12px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden ring-4 ring-slate-800/10">
              {/* Speaker / Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-3xl z-50 flex items-center justify-center gap-1.5">
                <div className="w-10 h-1 bg-white/10 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>

              {/* Status Bar */}
              <div className="absolute top-0 left-0 w-full h-11 flex items-center justify-between px-8 z-40 bg-white/80 backdrop-blur-md">
                <span className="text-[13px] font-black text-slate-900">9:41</span>
                <div className="flex items-center gap-1.5">
                  <Signal size={14} className="text-slate-900" />
                  <Wifi size={14} className="text-slate-900" />
                  <Battery size={14} className="text-slate-900" />
                </div>
              </div>

              {/* Scrollable Content (LandingPageTemplate) */}
              <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-white custom-scrollbar-hide pt-11">
                <div className="origin-top scale-[1.0] w-full min-h-full">
                  <LandingPageTemplate record={mockRecord} />
                </div>
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-900/20 rounded-full z-40" />
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl shadow-lg p-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                Preview summary
              </p>
              <p className="text-base font-semibold text-charcoal">
                {data.displayName || "Alex"} is ready to share {data.tour?.title || "an authentic experience"}.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The live preview reflects your selections and makes it easy for travelers to understand what you
                deliver and how to book their next adventure.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-primary-navy font-semibold">Experience details</p>
              <h2 className="text-2xl font-extrabold text-charcoal mt-4">{data.displayName || "Alex"}</h2>
              <p className="text-sm text-muted-foreground">{tourTitle}</p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{data.tour?.description}</p>

              <div className="grid gap-3 mt-6 sm:grid-cols-2">
                {summaryStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-100 bg-[#f8fafc] px-4 py-3 flex flex-col gap-1"
                  >
                    <span className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
                      {stat.label}
                    </span>
                    <p className="text-sm font-semibold text-charcoal">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-100 p-6 shadow-lg">
              <p className="text-sm font-semibold text-charcoal">Why travelers will book you</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-4">
                <li>Lightweight page that loads fast even on 2G.</li>
                <li>Clear price and language expectations up front.</li>
                <li>Captures your location and certifications at a glance.</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            onClick={onPublish}
            disabled={publishing}
            className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg"
          >
            {publishing ? "Publishing..." : "Publish my page"}
          </Button>
          <Button
            variant="outline"
            onClick={onEdit}
            className="w-full h-[4.5rem] border border-slate-200 bg-white text-charcoal text-lg font-bold rounded-2xl shadow-sm"
          >
            Edit details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPreview;

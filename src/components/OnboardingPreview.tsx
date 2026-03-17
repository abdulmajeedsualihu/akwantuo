import { ChevronLeft, PartyPopper, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingPreviewProps {
  data: any;
  onBack: () => void;
  onPublish: () => void;
  onEdit: () => void;
}

const OnboardingPreview = ({ data, onBack, onPublish, onEdit }: OnboardingPreviewProps) => {
  const languages =
    Array.isArray(data.languages) && data.languages.length
      ? data.languages.join(", ")
      : "English, Twi";
  const tourTitle = data.tour?.title || "Mountain & Trail Guide";
  const description =
    data.tour?.description ||
    "Share what makes your experience unique. Add local stories, group size, and what guests can expect.";
  const duration = data.tour?.duration || "1h";
  const priceTag = data.tour?.price ? `GH₵${data.tour.price}` : "Price pending";
  const highlights =
    Array.isArray(data.tour?.highlights) && data.tour.highlights.length
      ? data.tour.highlights.slice(0, 2).join(" · ")
      : "Add highlights";

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
    <div className="min-h-screen bg-[#f1f4f8] flex justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-6xl flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white shadow-sm border border-slate-200 text-charcoal hover:bg-slate-50 transition"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-center flex-1">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Onboarding</p>
            <h1 className="text-xl font-bold text-charcoal">Your page is ready</h1>
            <p className="text-sm text-muted-foreground">Take a look at how your profile will appear to the public.</p>
          </div>
          <div className="space-y-1 text-right">
            <div className="h-2 rounded-full bg-primary-navy/20" />
            <div className="h-2 rounded-full bg-primary-navy/20" />
            <div className="h-2 rounded-full bg-primary-navy/20" />
            <div className="h-2 rounded-full bg-primary-navy w-12" />
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-4">
            <div className="relative mx-auto lg:mx-0">
              <div className="w-full max-w-[360px] rounded-[3rem] border-[8px] border-slate-900/90 bg-white shadow-2xl overflow-hidden">
                <div className="h-6 w-full flex items-center justify-between px-6 pt-4">
                  <span className="text-[10px] font-bold">9:41</span>
                  <div className="flex gap-1 items-center">
                    <div className="w-3 h-2 border border-black/20 rounded-[1px]" />
                    <div className="w-3 h-3 rounded-full border border-black/20" />
                  </div>
                </div>

                <div className="flex flex-col items-center p-6 pb-9">
                  <div className="w-full h-24 bg-primary-navy mb-[-48px]" />
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 z-10">
                    {data.mainPhoto ? (
                      <img
                        src={data.mainPhoto}
                        alt={data.displayName || "Vendor avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <MapPin size={32} strokeWidth={1} />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 text-center space-y-1">
                    <h3 className="text-lg font-bold text-charcoal">{data.displayName || "Alex Rivers"}</h3>
                    <p className="text-[12px] font-bold text-primary-navy uppercase tracking-wide">{tourTitle}</p>
                  </div>

                  <div className="w-full px-6 mt-6 space-y-3">
                    {previewHighlights.map((item) => (
                      <div
                        key={item.label}
                        className="h-10 bg-[#f8fafc] rounded-xl flex items-center px-4 gap-3 shadow-sm border border-slate-50"
                      >
                        {item.icon}
                        <span className="text-[11px] font-bold text-charcoal/70">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl shadow-lg p-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                Preview summary
              </p>
              <p className="text-base font-semibold text-charcoal">
                {data.displayName || "Alex Rivers"} is ready to share {data.tour?.title || "an authentic tour"}.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The live preview reflects your selections and makes it easy for tourists to understand what you
                deliver and how to book.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-primary-navy font-semibold">Experience details</p>
              <h2 className="text-2xl font-extrabold text-charcoal mt-4">{data.displayName || "Alex Rivers"}</h2>
              <p className="text-sm text-muted-foreground">{tourTitle}</p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{description}</p>

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
            className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg"
          >
            Publish my page
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

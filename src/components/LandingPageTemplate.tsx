import { useState } from "react";
import { 
  ArrowRight, 
  Check, 
  MapPin, 
  Share2, 
  MessageSquare, 
  Calendar, 
  Users, 
  ChevronRight,
  Globe,
  BadgeCheck,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLandingUrl } from "@/lib/share";
import type { LandingPageRecord } from "@/lib/onboardingService";
import { cn } from "@/lib/utils";

interface LandingPageTemplateProps {
  record: LandingPageRecord;
}

const LandingPageTemplate = ({ record }: LandingPageTemplateProps) => {
  const { storefront, profile, descriptionPayload } = record;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const heroImage = descriptionPayload.mainPhoto || "/placeholder.svg";
  const gallery = descriptionPayload.gallery ?? [];
  const shareUrl = buildLandingUrl({
    slug: record.slug,
    displayName: storefront.business_name,
  });
  
  const location = storefront.location || profile?.location || "Accra, Ghana";
  const bio = descriptionPayload.bio || "Passionate local guide ready to share unforgettable local stories.";
  const languages = descriptionPayload.languages?.length ? descriptionPayload.languages : ["English", "Twi"];
  
  const mainTour = {
    title: storefront.category || "Authentic Experience",
    price: descriptionPayload.price || "Contact",
    duration: descriptionPayload.duration || "2-4 hours",
    description: descriptionPayload.text || "A deep dive into local culture and hidden gems.",
    image: heroImage,
    maxPeople: 8
  };

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
    `Hi! I'm interested in booking ${storefront.business_name}'s experience: ${mainTour.title}. ${shareUrl}`
  )}`;

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans selection:bg-primary-navy/10 selection:text-primary-navy transition-all duration-300">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-navy rounded-lg flex items-center justify-center transform rotate-12">
              <Compass className="text-white w-5 h-5 -rotate-12" />
            </div>
            <span className="text-xl font-black text-primary-navy tracking-tight">Akwantuo</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button className="text-sm font-bold text-slate-600 hover:text-primary-navy transition-colors">Find a Guide</button>
            <button className="text-sm font-bold text-slate-600 hover:text-primary-navy transition-colors">How it works</button>
            <Button variant="outline" className="rounded-full border-slate-200 font-bold flex items-center gap-2 hover:bg-slate-50">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <Users size={14} className="text-slate-500" />
              </div>
              Sign In
            </Button>
          </div>
          
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          
          {/* Left Column: Profile & Booking */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            
            {/* Profile Card */}
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 text-center lg:text-left">
              <div className="relative inline-block mb-6">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden mx-auto lg:mx-0">
                  <img src={heroImage} alt={storefront.business_name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md">
                  <BadgeCheck size={24} className="text-blue-500 fill-blue-500/10" />
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{storefront.business_name}</h1>
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-slate-500 font-bold text-sm">
                  <MapPin size={16} className="text-slate-400" />
                  {location}
                </div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                {languages.map((lang: string) => (
                  <span key={lang} className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-600">
                    {lang}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">About {storefront.business_name.split(' ')[0]}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {bio}
                </p>
              </div>
            </section>

            {/* Booking Card */}
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Calendar size={20} className="text-primary-navy" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Book a Tour</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Preferred Date</label>
                  <div className="h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 flex items-center gap-3 focus-within:border-primary-navy transition-all">
                    <input type="date" className="bg-transparent outline-none w-full text-sm font-bold text-slate-700" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Number of People</label>
                  <div className="h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 flex items-center gap-3 focus-within:border-primary-navy transition-all">
                    <select className="bg-transparent outline-none w-full text-sm font-bold text-slate-700 appearance-none">
                      <option>1-2 Person</option>
                      <option>3-5 People</option>
                      <option>6+ People</option>
                    </select>
                    <ChevronRight size={16} className="text-slate-400 transform rotate-90" />
                  </div>
                </div>

                <Button className="w-full h-14 bg-primary-navy hover:bg-primary-navy/90 text-white rounded-2xl font-bold shadow-lg shadow-primary-navy/20 transition-all active:scale-95">
                  Check Availability
                </Button>

                <div className="relative py-2 flex items-center justify-center uppercase overflow-hidden">
                  <div className="absolute w-full h-[1px] bg-slate-100"></div>
                  <span className="relative z-10 px-4 bg-white text-[10px] font-black text-slate-300 tracking-widest">OR CHAT DIRECTLY</span>
                </div>

                <Button 
                  onClick={() => window.open(whatsappLink, "_blank")}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                >
                  <MessageSquare size={20} />
                  Book via WhatsApp
                </Button>
              </div>
            </section>
          </div>

          {/* Right Column: Gallery & Tours */}
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            {/* Gallery Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gallery</h2>
                <button className="text-primary-navy font-bold text-sm hover:underline">View All</button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.length > 0 ? (
                  gallery.slice(0, 5).map((img: string, i: number) => (
                    <div key={i} className={cn(
                      "rounded-3xl overflow-hidden bg-slate-200 aspect-[4/3] relative group cursor-pointer",
                      i === 0 && "md:col-span-1 md:row-span-1"
                    )}>
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                  ))
                ) : (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-3xl bg-slate-200 aspect-[4/3] animate-pulse" />
                  ))
                )}
                {gallery.length > 5 && (
                  <div className="rounded-3xl bg-slate-900 aspect-[4/3] flex items-center justify-center relative overflow-hidden group border border-white">
                    <img src={gallery[5]} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" />
                    <span className="relative z-10 text-white font-bold text-lg">+{gallery.length - 5} more</span>
                  </div>
                )}
              </div>
            </section>

            {/* Tours Offered */}
            <section className="space-y-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tours Offered</h2>
              
              <div className="space-y-4">
                {/* Real Tour Card */}
                <article className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm flex flex-col md:flex-row group hover:shadow-xl hover:border-blue-100/50 transition-all duration-500">
                  <div className="md:w-56 h-48 md:h-auto overflow-hidden">
                    <img src={heroImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-extrabold text-slate-900 group-hover:text-primary-navy transition-colors">{mainTour.title}</h4>
                        <span className="text-xl font-black text-primary-navy">
                          {mainTour.price !== "Contact" ? `GH₵${mainTour.price}` : "Free"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 border-r border-slate-100 pr-4">
                          <Compass size={14} />
                          {mainTour.duration}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users size={14} />
                          Max {mainTour.maxPeople}
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 pt-2">
                        {mainTour.description}
                      </p>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button variant="outline" className="rounded-full border-slate-200 px-6 font-bold hover:bg-slate-50">Details</Button>
                    </div>
                  </div>
                </article>

                {/* Placeholder/Extra Tour if helpful for layout */}
                <article className="bg-white/50 rounded-[2rem] overflow-hidden border border-dashed border-slate-200 p-8 flex items-center justify-center">
                   <p className="text-slate-400 font-bold text-sm tracking-wide">More experiences coming soon...</p>
                </article>
              </div>
            </section>

          </div>
        </div>
      </main>

      <footer className="bg-white py-12 border-t border-slate-100 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 grayscale opacity-50">
             <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <Compass className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight italic">Akwantuo</span>
          </div>
          <p className="text-sm font-bold text-slate-400">© 2024 Akwantuo – Explore like a local. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-slate-400">
             <Share2 size={20} className="hover:text-primary-navy cursor-pointer transition-colors" />
             <div className="w-5 h-5 bg-slate-400 rounded-sm"></div>
             <div className="w-5 h-5 bg-slate-400 rounded-full"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Compass = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);

export default LandingPageTemplate;

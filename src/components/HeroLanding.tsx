import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Zap, Globe, Camera, Share2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AkwantuoLogo from "./AkwantuoLogo";
import { LandingPageRecord } from "@/lib/onboardingService";
import { Link } from "react-router-dom";

interface HeroLandingProps {
  onGetStarted: () => void;
  latestTours?: LandingPageRecord[];
}

const HERO_IMAGES = [
  {
    url: "/platform_hero_guide.png",
    caption: "Waterfall Adventures",
    location: "Boti Falls, Eastern Region",
    tag: "Nature & Hiking"
  },
  {
    url: "/hero_mole.png",
    caption: "Mole Safari Tours",
    location: "Mole National Park, Savannah Region",
    tag: "Wildlife Safari"
  },
  {
    url: "/hero_elmina.png",
    caption: "Historic Elmina Castle",
    location: "Elmina, Central Region",
    tag: "History & Culture"
  }
];

const HeroLanding = ({ onGetStarted, latestTours }: HeroLandingProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Dynamic Header with Glassmorphism */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/70 backdrop-blur-xl px-5 py-4 sm:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="transition-transform duration-300 group-hover:scale-110">
              <AkwantuoLogo variant="boxed" size="sm" />
            </div>
            <span className="font-bold text-charcoal tracking-tight text-xl">Akwantuo</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onGetStarted}
              className="hidden sm:flex font-bold text-charcoal hover:bg-slate-50 rounded-xl"
            >
              Sign In
            </Button>
            <Button
              onClick={onGetStarted}
              className="bg-primary-navy hover:bg-primary-navy/90 text-white font-bold rounded-xl px-6 shadow-md"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Premium Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-navy/5 blur-[120px] rounded-full -z-10 animate-pulse" />

          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              {/* Text Content */}
              <div className="flex-1 space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 transform hover:scale-105 transition-transform cursor-default mx-auto lg:mx-0">
                  <Globe className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-widest text-[10px]">Built for African Guides</span>
                </div>

                <div className="space-y-6">
                  <h1 className="text-5xl sm:text-7xl xl:text-8xl font-black tracking-tight leading-[0.95] text-charcoal">
                    Turn your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-navy to-blue-600">passion</span> into a business
                  </h1>
                  <p className="text-xl sm:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    The simplest way for local guides to launch a professional tour site, manage bookings, and grow their audience. All in 60 seconds.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                  <Button
                    onClick={onGetStarted}
                    size="lg"
                    className="h-20 px-10 text-xl font-black bg-primary-navy hover:bg-primary-navy/90 text-white rounded-[2rem] shadow-2xl shadow-primary-navy/20 group transform transition-all hover:-translate-y-1 active:scale-95"
                  >
                    Start Hosting Free
                    <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                  </Button>
                  <div className="flex items-center gap-4 px-6 py-3 border-2 border-slate-100 rounded-[2rem] bg-white/50 backdrop-blur-sm self-center">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 shadow-sm overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="Guide" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-black text-charcoal leading-tight">2,400+ Guides</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Across Ghana</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Component - Carousel */}
              <div className="flex-1 relative w-full max-w-2xl animate-in zoom-in-95 duration-1000 delay-200">
                <div className="relative z-10 aspect-square sm:aspect-auto sm:h-[640px] rounded-[3rem] overflow-hidden shadow-edge border-[12px] border-white group">
                  {HERO_IMAGES.map((img, idx) => (
                    <div 
                      key={img.url}
                      className={cn(
                        "absolute inset-0 transition-all duration-1000 ease-in-out",
                        idx === currentImageIndex ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-105 translate-x-full"
                      )}
                    >
                      <img 
                        src={img.url} 
                        alt={img.caption} 
                        className="w-full h-full object-cover"
                      />
                      {/* Caption Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-10 left-10 text-white space-y-2">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                          <MapPin size={12} className="text-white/80" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{img.location}</span>
                        </div>
                        <h4 className="text-2xl font-black tracking-tight">{img.caption}</h4>
                      </div>
                    </div>
                  ))}
                  
                  {/* Glass Card Overlay (Generic Platform Info) */}
                  <div className="absolute top-8 left-8 bg-white/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/40 shadow-xl z-20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-navy flex items-center justify-center text-white">
                        <Sparkles size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-charcoal uppercase tracking-[0.2em]">Live Site Preview</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={prevImage} className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-colors">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextImage} className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-colors">
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  {/* Progress Dots */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {HERO_IMAGES.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          idx === currentImageIndex ? "w-8 bg-white" : "w-2 bg-white/40"
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Floating Micro-UI */}
                <div className="absolute -top-12 -right-8 w-44 h-44 bg-white rounded-[3rem] shadow-2xl p-6 flex flex-col items-center justify-center animate-bounce duration-1000 z-30 hidden md:flex border border-slate-50">
                  <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="text-amber-600 w-8 h-8" />
                  </div>
                  <span className="text-[12px] font-black text-center uppercase tracking-widest text-charcoal leading-tight">Instant<br/>AI Sites</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Experiences Section */}
        {latestTours && latestTours.length > 0 && (
          <section className="py-24 bg-white border-t border-slate-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div className="max-w-2xl space-y-4 text-center md:text-left">
                  <h2 className="text-4xl sm:text-5xl font-black text-charcoal tracking-tight">Latest Experiences</h2>
                  <p className="text-lg text-muted-foreground font-medium italic">Discover unique adventures hosted by our top local guides.</p>
                </div>
                <Button variant="outline" className="hidden md:flex rounded-xl font-bold border-slate-200 h-12 px-6" onClick={onGetStarted}>
                  Host Your Own
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {latestTours.map((tour) => (
                  <Link
                    key={tour.storefront.id}
                    to={`/${tour.slug}`}
                    className="group flex flex-col bg-slate-50 rounded-[2.5rem] overflow-hidden border-2 border-transparent hover:border-primary-navy/10 transition-all duration-500 hover:-translate-y-3 shadow-sm hover:shadow-2xl"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={tour.descriptionPayload.mainPhoto || "/hero_vendor.png"}
                        alt={tour.storefront.business_name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                        <p className="text-xs font-black text-primary-navy tracking-widest uppercase">GHS {tour.descriptionPayload.price || "0.00"}</p>
                      </div>
                    </div>
                    <div className="p-10 space-y-5">
                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full">
                        <MapPin size={12} />
                        {tour.storefront.location || "Ghana"}
                      </div>
                      <h3 className="text-2xl font-black text-charcoal group-hover:text-primary-navy transition-colors line-clamp-1 tracking-tight">
                        {tour.storefront.business_name}
                      </h3>
                      <p className="text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed italic opacity-80">
                        "{tour.descriptionPayload.text || "Experience the best of Ghana with our local expertise."}"
                      </p>
                      <div className="pt-6 flex items-center justify-between border-t border-slate-200/60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-md">
                            <img src={`https://i.pravatar.cc/100?u=${tour.storefront.user_id}`} alt="Guide" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">Host</p>
                            <p className="text-xs font-bold text-charcoal">Certified Guide</p>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-navy/5 flex items-center justify-center text-primary-navy group-hover:bg-primary-navy group-hover:text-white transition-all">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-16 text-center md:hidden">
                <Button className="w-full h-16 rounded-2xl font-black bg-primary-navy text-white shadow-xl" onClick={onGetStarted}>
                  Host Your Own Experience
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* How it Works - Value Strip */}
        <section className="bg-slate-50 py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-charcoal tracking-tight">Three steps to global visibility</h2>
              <p className="text-lg text-muted-foreground font-medium italic">We handled the tech, you handle the adventure.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-12 -z-0" />

              {[
                {
                  icon: <Camera className="w-8 h-8 text-primary-navy" />,
                  title: "1. Capture Magic",
                  desc: "Snap photos of your tour spots. Our AI identifies locations and highlights automatically.",
                  color: "bg-white"
                },
                {
                  icon: <Sparkles className="w-8 h-8 text-blue-600" />,
                  title: "2. AI Generation",
                  desc: "We build a beautiful, high-converting tour site with itineraries from your data instantly.",
                  color: "bg-white"
                },
                {
                  icon: <Share2 className="w-8 h-8 text-emerald-600" />,
                  title: "3. Share & Book",
                  desc: "Share your professional link on WhatsApp or Instagram. Get bookings straight to your phone.",
                  color: "bg-white"
                }
              ].map((step, i) => (
                <div key={i} className="relative z-10 group">
                  <div className={`${step.color} p-10 rounded-[2.5rem] shadow-hard border-2 border-transparent hover:border-primary-navy/20 transition-all duration-500 hover:-translate-y-3`}>
                    <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 flex items-center justify-center mb-8 shadow-inner group-hover:rotate-6 transition-transform">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-black text-charcoal mb-4 tracking-tight">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
                  </div>
                  {/* Circle counter */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary-navy text-white flex items-center justify-center font-black text-sm shadow-xl">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-24 sm:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-primary-navy rounded-[3rem] p-12 sm:p-24 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full" />
              <div className="relative z-10 space-y-10">
                <h2 className="text-4xl sm:text-6xl font-black text-white leading-[1.1] tracking-tight">
                  Ready to show the world your Ghana?
                </h2>
                <p className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto font-medium opacity-90">
                  Join 2,000+ local guides already using Akwantuo to professionalize their tourism business. No credit card required.
                </p>
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="h-16 px-8 text-lg sm:h-20 sm:px-12 sm:text-xl font-black bg-white text-primary-navy hover:bg-white/90 rounded-[2rem] shadow-2xl transform transition-all hover:scale-105 active:scale-95 mx-auto"
                >
                  Create Your Free Tour Site
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="bg-slate-50 py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-6 max-w-xs">
            <div className="flex items-center gap-3">
              <AkwantuoLogo variant="boxed" size="sm" />
              <span className="font-black text-charcoal text-2xl tracking-tighter">Akwantuo</span>
            </div>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">
              Empowering local storytellers and adventure seekers to build their digital presence across Ghana.
            </p>
            <div className="flex gap-4">
              {['WhatsApp', 'Instagram', 'Twitter'].map(social => (
                <a key={social} href="#" className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xs font-bold text-charcoal hover:bg-primary-navy hover:text-white transition-all shadow-sm">
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-20">
            <div className="space-y-5">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-charcoal/40">Product</h4>
              <ul className="space-y-3 text-sm font-bold text-charcoal/70">
                <li><a href="#" className="hover:text-primary-navy transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary-navy transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-primary-navy transition-colors">AI Magic</a></li>
              </ul>
            </div>
            <div className="space-y-5">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-charcoal/40">Company</h4>
              <ul className="space-y-3 text-sm font-bold text-charcoal/70">
                <li><a href="#" className="hover:text-primary-navy transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary-navy transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary-navy transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div className="space-y-5 col-span-2 sm:col-span-1">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-charcoal/40">Newsletter</h4>
              <div className="flex gap-2">
                <input type="text" placeholder="Your email" className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-sm font-medium w-full outline-none focus:border-primary-navy transition-colors" />
                <button className="bg-primary-navy text-white p-2 rounded-xl"><ArrowRight size={18} /></button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-black text-charcoal/30 uppercase tracking-[0.2em]">© 2026 Akwantuo. Built with ❤️ in Ghana.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeroLanding;

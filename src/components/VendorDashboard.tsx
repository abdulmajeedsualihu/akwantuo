import { useState, useEffect } from "react";
import {
  LayoutDashboard, User, CalendarCheck, Settings, LogOut,
  Eye, Ticket, Clock, ExternalLink,
  Menu, Bell, Share2, Calendar, CheckCircle2, Copy, Home,
  XCircle, Check, MapPin
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AkwantuoLogo from "./AkwantuoLogo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { slugifyDisplayName, buildLandingUrl } from "@/lib/share";
import { getBookings, updateBookingStatus, toggleStorefrontLive, getStorefrontLiveStatus, saveAvailabilitySettings, getAvailabilitySettings, DEFAULT_WORKING_HOURS, WorkingHours } from "@/lib/onboardingService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface VendorDashboardProps {
  displayName: string;
  photo?: string;
  slug?: string;
  userId?: string;
  category?: string;
  location?: string;
  onLogout?: () => void;
  onViewPage?: () => void;
}

const MOCK_STATS = [
  {
    label: "Total views",
    value: "1,284",
    change: "+12%",
    positive: true,
    icon: <Eye className="w-5 h-5 text-blue-600" />,
    bg: "bg-blue-50",
  },
  {
    label: "Bookings",
    value: "42",
    change: "+5%",
    positive: true,
    icon: <Ticket className="w-5 h-5 text-violet-600" />,
    bg: "bg-violet-50",
  },
  {
    label: "Pending",
    value: "7",
    change: "Active",
    positive: true,
    icon: <Clock className="w-5 h-5 text-orange-500" />,
    bg: "bg-orange-50",
  },
];

const MOCK_BOOKINGS = [
  {
    avatar: "https://i.pravatar.cc/100?u=elena",
    initials: "ER",
    name: "Elena Rodriguez",
    tour: "Hidden Gems of Tuscany",
    date: "Oct 24, 2023",
    status: "Pending",
    time: "2 hours ago",
  },
  {
    avatar: "https://i.pravatar.cc/100?u=james",
    initials: "JW",
    name: "James Wilson",
    tour: "Historic Center Walk",
    date: "Oct 28, 2023",
    status: "Pending",
    time: "5 hours ago",
  },
  {
    avatar: "https://i.pravatar.cc/100?u=sarah",
    initials: "SJ",
    name: "Sarah Jenkins",
    tour: "Art Gallery Crawl",
    date: "Oct 21, 2023",
    status: "Expired",
    time: "1 day ago",
  },
  {
    avatar: "https://i.pravatar.cc/100?u=alex",
    initials: "AJ",
    name: "Alex Johnson",
    tour: "Street Food Tour",
    date: "Oct 19, 2023",
    status: "Confirmed",
    time: "2 days ago",
  },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
  expired: "bg-slate-200 text-slate-500",
};

const BOTTOM_NAV: { id: NavItem; label: string; icon: React.ReactNode; href?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "bookings", label: "My Bookings", icon: <CalendarCheck className="w-5 h-5" /> },
  { id: "availability", label: "Availability", icon: <Clock className="w-5 h-5" /> },
  { id: "mypage", label: "Public Page", icon: <User className="w-5 h-5" /> },
  { id: "settings", label: "Account", icon: <Settings className="w-5 h-5" /> },
  { id: "home", label: "Home", icon: <Home className="w-5 h-5" />, href: "/" },
];

type NavItem = "dashboard" | "bookings" | "availability" | "mypage" | "settings" | "home";

const VendorDashboard = ({ displayName, photo, slug, userId, category, location, onLogout, onViewPage }: VendorDashboardProps) => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<NavItem>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [isTogglingLive, setIsTogglingLive] = useState(false);
  const [workingHours, setWorkingHours] = useState<Record<string, WorkingHours>>(DEFAULT_WORKING_HOURS);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  console.log("VendorDashboard props:", { displayName, slug, userId });
  const publicUrl = buildLandingUrl({ slug, displayName });

  useEffect(() => {
    if (userId) {
      loadBookings();
      loadLiveStatus();
      loadAvailabilitySettings();
    }
  }, [userId]);

  const loadAvailabilitySettings = async () => {
    if (!userId) return;
    try {
      const settings = await getAvailabilitySettings(userId);
      if (settings?.working_hours) {
        setWorkingHours(settings.working_hours);
      }
    } catch (err) {
      console.error("Failed to load availability settings:", err);
    }
  };

  const handleSaveAvailability = async () => {
    if (!userId) return;
    setIsSavingAvailability(true);
    try {
      await saveAvailabilitySettings(userId, { working_hours: workingHours });
      toast.success("Availability settings saved!");
    } catch (err) {
      toast.error("Failed to save availability settings.");
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const updateDayHours = (day: string, field: keyof WorkingHours, value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const loadLiveStatus = async () => {
    if (!userId) return;
    try {
      const status = await getStorefrontLiveStatus(userId);
      setIsLive(status);
    } catch (err) {
      console.error("Failed to load live status:", err);
    }
  };

  const loadBookings = async () => {
    if (!userId) return;
    setIsLoadingBookings(true);
    try {
      console.log("Fetching bookings for guideId:", userId);
      const data = await getBookings(userId);
      console.log("Bookings fetched:", data);
      setBookings(data || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking ${newStatus} successfully!`);
      // Update local state instead of re-fetching everything
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
    }
  };

  const handleToggleLive = async () => {
    if (!userId || isTogglingLive) return;
    setIsTogglingLive(true);
    const newStatus = !isLive;
    try {
      await toggleStorefrontLive(userId, newStatus);
      setIsLive(newStatus);
      toast.success(newStatus ? "Your page is now LIVE and accepting bookings!" : "Your page is now HIDDEN and NOT accepting bookings.");
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setIsTogglingLive(false);
    }
  };

  const handleCopyLink = () => {
    if (!publicUrl || publicUrl.endsWith("/tour")) {
      toast.error("Profile URL not ready. Please try refreshing or re-saving your profile.");
      return;
    }
    // const copyText = publicUrl;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link & message copied!");
  };

  const handleShare = () => {
    const text = encodeURIComponent(`Check out my tour page: ${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-8 flex flex-col items-center gap-6 border-b border-slate-100 bg-slate-50/40">
        <Link to="/" className="flex items-center gap-2 group transition-all hover:scale-105 active:scale-95">
          <AkwantuoLogo variant="circle" size="sm" />
          <span className="font-bold text-charcoal tracking-tight text-lg group-hover:text-primary-navy transition-colors">Akwantuo</span>
        </Link>

        <div className="flex flex-col items-center gap-3 w-full">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary-navy/10 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
            {photo ? (
              <img src={photo} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-primary-navy">{(displayName || "A")[0].toUpperCase()}</span>
            )}
          </div>
          <div className="text-center">
            <p className="font-black text-charcoal text-sm leading-none">{displayName || "Akwantuo Guide"}</p>
            {location && (
              <p className="text-[10px] font-bold text-primary-navy/70 mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                {location}
              </p>
            )}
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2.5 flex items-center justify-center gap-1.5">
              Guide Dashboard
              <span className="inline-block w-1 h-1 rounded-full bg-emerald-500" />
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {BOTTOM_NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.href) {
                navigate(item.href);
              } else {
                setActiveNav(item.id);
                setSidebarOpen(false);
              }
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200",
              activeNav === item.id
                ? "bg-primary-navy text-white shadow-md"
                : "text-muted-foreground hover:bg-slate-100 hover:text-charcoal"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-4 pb-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f0f4fa]">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-56 flex-col bg-white border-r border-slate-100 shadow-sm fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-64 bg-white h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100"
          >
            <Menu className="w-5 h-5 text-charcoal" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-navy/10 overflow-hidden flex items-center justify-center">
              {photo ? (
                <img src={photo} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-black text-primary-navy">{(displayName || "A")[0]}</span>
              )}
            </div>
            <span className="font-black text-charcoal text-sm">{displayName || "Dashboard"}</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 relative">
            <Bell className="w-5 h-5 text-charcoal" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        {/* Desktop Title */}
        <div className="hidden lg:flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
          <h1 className="text-xl font-black text-charcoal">Dashboard</h1>
          <div className="flex items-center gap-3">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-xl font-bold border-slate-200">
                <ExternalLink className="w-4 h-4" /> View Public Profile
              </Button>
            </a>
          </div>
        </div>
        {/* Page Content */}
        <main className="flex-1 px-4 lg:px-8 py-6 max-w-5xl w-full mx-auto space-y-5 pb-28 lg:pb-8 animate-in fade-in duration-500">

          {activeNav === "dashboard" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* ── Greeting ── */}
              <div className="hidden lg:block">
                <h2 className="text-2xl font-black text-charcoal">
                  Hey, {displayName.toLocaleUpperCase() || "Guide"} 👋
                </h2>
                <p className="text-sm text-muted-foreground font-medium mt-0.5">
                  Manage your <span className="text-primary-navy font-bold">{category || "Tour"}</span> experience in <span className="text-primary-navy font-bold">{location || "Ghana"}</span>.
                </p>
              </div>

              {/* ── Live Banner ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-700">Your page is live!</p>
                    <p className="text-xs text-muted-foreground font-medium truncate max-w-[180px] sm:max-w-xs">{publicUrl}</p>
                  </div>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 bg-primary-navy text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-primary-navy/90 transition-colors flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>

              {/* ── Stats ── */}
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-5 space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground truncate uppercase tracking-wider">Profile Impressions</p>
                  <div className="flex items-end justify-between gap-1">
                    <p className="text-2xl lg:text-3xl font-black text-charcoal">1,284</p>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 text-emerald-700 bg-emerald-50">+12%</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-5 space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground truncate uppercase tracking-wider">{category || "Tour"} Bookings</p>
                  <div className="flex items-end justify-between gap-1">
                    <p className="text-2xl lg:text-3xl font-black text-charcoal">{bookings.length}</p>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 text-emerald-700 bg-emerald-50">Total</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-5 space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground truncate uppercase tracking-wider">Active Requests</p>
                  <div className="flex items-end justify-between gap-1">
                    <p className="text-2xl lg:text-3xl font-black text-charcoal">
                      {bookings.filter(b => b.status === "pending").length}
                    </p>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 text-orange-700 bg-orange-50">Active</span>
                  </div>
                </div>
              </div>

              {/* ── Business Overview ── */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-lg font-black text-charcoal">{category || "Experience Guide"}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary-navy" />
                    {location || "Ghana"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-5 py-3 bg-slate-50/50 rounded-2xl border border-slate-100 text-center min-w-[100px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Status</p>
                    <p className={cn("text-xs font-black uppercase", isLive ? "text-emerald-600" : "text-amber-600")}>
                      {isLive ? "Page Live" : "Page Hidden"}
                    </p>
                  </div>
                  <div className="px-5 py-3 bg-slate-50/50 rounded-2xl border border-slate-100 text-center min-w-[100px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Profile</p>
                    <p className="text-xs font-black text-primary-navy uppercase">100% Complete</p>
                  </div>
                </div>
              </div>

              {/* ── Recent Booking Requests ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-black text-charcoal">Recent booking requests</h2>
                  <button onClick={() => setActiveNav("bookings")} className="text-xs font-black text-primary-navy hover:underline">View all</button>
                </div>

                {/* Mobile Cards (Condensed) */}
                <div className="lg:hidden space-y-3">
                  {isLoadingBookings ? (
                    <div className="p-8 text-center text-muted-foreground font-bold">Loading bookings...</div>
                  ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">No requests yet.</p>
                    </div>
                  ) : (
                    bookings.slice(0, 3).map((b, i) => (
                      <div key={b.id || i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 border-2 border-white shadow-sm">
                              {b.tourist_name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-black text-charcoal leading-none mb-1">{b.tourist_name}</p>
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{b.status}</p>
                            </div>
                          </div>
                          <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest", STATUS_STYLES[b.status] || "bg-slate-100")}>
                            {new Date(b.booking_date).toLocaleDateString()}
                          </span>
                        </div>
                        {b.status === "pending" && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(b.id, "cancelled")}
                              className="rounded-xl font-bold h-8 text-[11px] border-red-100 text-red-500"
                            >
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(b.id, "confirmed")}
                              className="rounded-xl font-bold h-8 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              Confirm
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table (Condensed) */}
                <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {isLoadingBookings ? (
                    <div className="p-8 text-center text-muted-foreground font-bold">Loading bookings...</div>
                  ) : bookings.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground font-bold italic">No bookings found.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50">
                        <tr className="border-b border-slate-100">
                          <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tourist</th>
                          <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
                          <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-charcoal">{b.tourist_name}</p>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-600">
                              {new Date(b.booking_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn("text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider", STATUS_STYLES[b.status] || "bg-slate-100")}>
                                {b.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {b.status === "pending" ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleUpdateStatus(b.id, "confirmed")} className="text-emerald-500 hover:text-emerald-700 transition-colors"><Check size={16} /></button>
                                  <button onClick={() => handleUpdateStatus(b.id, "cancelled")} className="text-red-500 hover:text-red-700 transition-colors"><XCircle size={16} /></button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Handled</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeNav === "bookings" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-charcoal">All Bookings</h2>
                  <p className="text-sm text-muted-foreground font-medium">Manage all your tour requests from tourists.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl font-bold bg-white text-[11px] h-9">
                    Filter by Status
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {isLoadingBookings ? (
                  <div className="p-12 text-center text-muted-foreground font-bold">Loading your schedule...</div>
                ) : bookings.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                    <CalendarCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No bookings found.</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">When tourists book through your page, they'll appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    {bookings.map((b) => (
                      <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:border-primary-navy/20 transition-all">
                        <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 border-2 border-white shadow-sm text-xl flex-shrink-0">
                              {b.tourist_name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-base font-black text-charcoal">{b.tourist_name}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Booking: {new Date(b.booking_date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                                  <Clock className="w-3.5 h-3.5" />
                                  Requested: {formatDistanceToNow(new Date(b.created_at))} ago
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                                  <Ticket className="w-3.5 h-3.5" />
                                  Phone: {b.tourist_phone}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-50">
                            <span className={cn("text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider", STATUS_STYLES[b.status] || "bg-slate-100")}>
                              {b.status}
                            </span>

                            {b.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(b.id, "cancelled")}
                                  className="rounded-xl font-black h-10 px-4 text-red-500 hover:bg-red-50 border-red-50"
                                >
                                  Decline
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateStatus(b.id, "confirmed")}
                                  className="rounded-xl font-black h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                                >
                                  Confirm
                                </Button>
                              </div>
                            )}

                            {b.status === "confirmed" && (
                              <button className="flex items-center gap-2 text-primary-navy font-black text-xs hover:underline">
                                <ExternalLink size={14} /> Contact Tourist
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeNav === "availability" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-black text-charcoal">Booking Availability</h2>
                <p className="text-sm text-muted-foreground font-medium">Control when you are available for tours.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-2xl">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-charcoal">Accepting New Bookings</h3>
                      <p className="text-xs text-muted-foreground font-medium">Turn off to temporarily hide the booking form on your tour page.</p>
                    </div>
                    <button
                      onClick={handleToggleLive}
                      disabled={isTogglingLive}
                      className={cn(
                        "w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-200",
                        isLive ? "bg-emerald-500" : "bg-slate-300",
                        isTogglingLive && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-200",
                        isLive ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  </div>

                  <hr className="border-slate-50" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-charcoal uppercase tracking-widest text-slate-400">Standard Working Hours</h3>
                    <div className="space-y-3">
                      {Object.entries(workingHours).map(([day, hours]) => (
                        <div key={day} className={cn("flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3", hours.enabled ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50 border-transparent opacity-60")}>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={hours.enabled}
                              onChange={(e) => updateDayHours(day, "enabled", e.target.checked)}
                              className="w-5 h-5 accent-primary-navy rounded-lg cursor-pointer"
                            />
                            <span className="text-sm font-black text-charcoal w-24">{day}</span>
                          </div>
                          {hours.enabled && (
                            <div className="flex items-center gap-2 ml-8 sm:ml-0">
                              <input
                                type="time"
                                value={hours.start}
                                onChange={(e) => updateDayHours(day, "start", e.target.value)}
                                className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 outline-none focus:border-primary-navy transition-colors"
                              />
                              <span className="text-slate-300 text-sm">—</span>
                              <input
                                type="time"
                                value={hours.end}
                                onChange={(e) => updateDayHours(day, "end", e.target.value)}
                                className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 outline-none focus:border-primary-navy transition-colors"
                              />
                            </div>
                          )}
                          {!hours.enabled && (
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-8 sm:ml-0">Unavailable</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleSaveAvailability}
                      disabled={isSavingAvailability}
                      className="w-full bg-primary-navy text-white h-14 rounded-2xl font-black shadow-xl shadow-primary-navy/10 hover:shadow-2xl transition-all disabled:opacity-60"
                    >
                      {isSavingAvailability ? "Saving..." : "Save Availability Settings"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeNav === "settings" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-black text-charcoal">Account Settings</h2>
                <p className="text-sm text-muted-foreground font-medium">Manage your profile and account preferences.</p>
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
                <Settings className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-black text-charcoal">Settings coming soon</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 font-medium">We're building more tools to help you manage your tour business effectively.</p>
              </div>
            </div>
          )}
        </main>

        {/* ── Mobile FAB: Share my page ── */}
        <div className="lg:hidden fixed bottom-20 right-4 z-30">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-primary-navy text-white font-black text-sm px-6 py-4 rounded-full shadow-2xl hover:bg-primary-navy/90 transition-all active:scale-95"
          >
            <Share2 className="w-5 h-5" />
            Share my page
          </button>
        </div>

        {/* ── Mobile Bottom Tab Bar ── */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-100 flex items-center justify-around px-2 py-2 safe-area-bottom">
          {BOTTOM_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[64px]",
                activeNav === item.id ? "text-primary-navy" : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span className={cn("text-[10px] font-black", activeNav === item.id ? "text-primary-navy" : "text-muted-foreground")}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default VendorDashboard;

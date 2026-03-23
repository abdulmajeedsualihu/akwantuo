import { useState, useEffect } from "react";
import {
  LayoutDashboard, User, CalendarCheck, Settings, LogOut,
  Eye, Ticket, Clock, ExternalLink,
  Menu, Bell, Share2, Calendar, CheckCircle2, Copy, Home,
  XCircle, Check
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AkwantuoLogo from "./AkwantuoLogo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { slugifyDisplayName, buildLandingUrl } from "@/lib/share";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface VendorDashboardProps {
  displayName: string;
  photo?: string;
  slug?: string;
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
  { id: "bookings", label: "Bookings", icon: <CalendarCheck className="w-5 h-5" /> },
  { id: "mypage", label: "My Page", icon: <User className="w-5 h-5" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  { id: "home", label: "Home", icon: <Home className="w-5 h-5" />, href: "/" },
];

type NavItem = "dashboard" | "bookings" | "mypage" | "settings" | "home";

const VendorDashboard = ({ displayName, photo, slug, onLogout, onViewPage }: VendorDashboardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState<NavItem>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const publicUrl = buildLandingUrl({ slug, displayName });

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("guide_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      toast.success(`Booking ${newStatus}`);
    } catch (error: any) {
      toast.error("Failed to update booking");
    }
  };

  const handleCopyLink = () => {
    const copyText = `Check out my tour page: ${publicUrl}`;
    navigator.clipboard.writeText(copyText);
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
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1.5">
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

          {/* ── Greeting ── */}
          <div className="hidden lg:block">
            <h2 className="text-2xl font-black text-charcoal">
              Hey, {displayName.toLocaleUpperCase() || "Guide"} 👋
            </h2>
            <p className="text-sm text-muted-foreground font-medium mt-0.5">Here's what's happening with your tour page today.</p>
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
              <p className="text-[11px] font-bold text-muted-foreground truncate">Total views</p>
              <div className="flex items-end justify-between gap-1">
                <p className="text-2xl lg:text-3xl font-black text-charcoal">1,284</p>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 text-emerald-700 bg-emerald-50">+12%</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-5 space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground truncate">Bookings</p>
              <div className="flex items-end justify-between gap-1">
                <p className="text-2xl lg:text-3xl font-black text-charcoal">{bookings.length}</p>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 text-emerald-700 bg-emerald-50">Total</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-5 space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground truncate">Pending</p>
              <div className="flex items-end justify-between gap-1">
                <p className="text-2xl lg:text-3xl font-black text-charcoal">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 text-orange-700 bg-orange-50">Active</span>
              </div>
            </div>
          </div>

          {/* ── Recent Booking Requests ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-charcoal">Recent booking requests</h2>
              <button className="text-xs font-black text-primary-navy hover:underline">View all</button>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {loadingBookings ? (
                <div className="p-8 text-center text-muted-foreground font-bold">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-bold bg-white rounded-2xl border border-dashed border-slate-200">No bookings yet</div>
              ) : (
                bookings.map((b, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-primary-navy font-black border-2 border-white shadow-sm">
                          {b.tourist_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-charcoal">{b.tourist_name}</p>
                          <p className="text-xs text-muted-foreground font-medium">{b.tourist_phone}</p>
                        </div>
                      </div>
                      <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0", STATUS_STYLES[b.status])}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium border-t border-slate-50 pt-3 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(b.booking_date).toLocaleDateString()}
                      </div>
                      <span>{formatDistanceToNow(new Date(b.created_at))} ago</span>
                    </div>
                    {b.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => updateBookingStatus(b.id, 'confirmed')}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-10 rounded-xl font-bold"
                        >
                          Confirm
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateBookingStatus(b.id, 'cancelled')}
                          className="flex-1 border-slate-200 h-10 rounded-xl font-bold text-red-500 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {loadingBookings ? (
                <div className="p-12 text-center text-muted-foreground font-bold">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-bold italic">No bookings found in your records.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tourist Info</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tour Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-primary-navy font-black border-2 border-white shadow-sm">
                              {b.tourist_name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-charcoal">{b.tourist_name}</p>
                              <p className="text-xs text-muted-foreground font-medium">{b.tourist_phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-charcoal font-bold">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(b.booking_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn("text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider", STATUS_STYLES[b.status])}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {b.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => updateBookingStatus(b.id, 'confirmed')}
                                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                title="Confirm Booking"
                              >
                                <Check size={16} strokeWidth={3} />
                              </button>
                              <button 
                                onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Cancel Booking"
                              >
                                <XCircle size={16} strokeWidth={3} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-medium italic">Handled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
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

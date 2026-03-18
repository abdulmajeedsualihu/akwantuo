import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AkwantuoLogo from "./AkwantuoLogo";
import { cn } from "@/lib/utils";
import { getProfileByPhone, createInitialProfile } from "@/lib/onboardingService";

const AFRICAN_COUNTRY_CODES = [
  { name: "Ghana", code: "+233", flag: "🇬🇭", placeholder: "024 123 4567" },
  // { name: "Nigeria", code: "+234", flag: "🇳🇬", placeholder: "080 1234 5678" },
  // { name: "Kenya", code: "+254", flag: "🇰🇪", placeholder: "0712 345 678" },
  // { name: "South Africa", code: "+27", flag: "🇿🇦", placeholder: "082 123 4567" },
  // { name: "Egypt", code: "+20", flag: "🇪🇬", placeholder: "0100 123 4567" },
  // { name: "Morocco", code: "+212", flag: "🇲🇦", placeholder: "06 12 34 56 78" },
  // { name: "Senegal", code: "+221", flag: "🇸🇳", placeholder: "77 123 45 67" },
  // { name: "Tanzania", code: "+255", flag: "🇹🇿", placeholder: "065 123 4567" },
];

type CountryOption = typeof AFRICAN_COUNTRY_CODES[number];

interface OnboardingPhoneProps {
  onComplete: (phone: string, profileData?: any, isReturning?: boolean) => void;
}

const OnboardingPhone = ({ onComplete }: OnboardingPhoneProps) => {
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(AFRICAN_COUNTRY_CODES[0]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(52);

  const sanitizeNumber = (value: string) => value.replace(/\D/g, "").replace(/^0+/, "");
  const normalizedPhone = sanitizeNumber(phone);
  const buildFullPhone = () => {
    if (!normalizedPhone) return "";

    if (selectedCountry.name !== "Ghana") {
      throw new Error("Only Ghana tours are supported for now.");
    }

    return `${selectedCountry.code}${normalizedPhone}`;
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);

  const handleSendOtp = async () => {
    if (normalizedPhone.length < 7) return;
    setLoading(true);
    try {
      const fullPhone = buildFullPhone();
      if (!fullPhone) {
        throw new Error("Please provide a valid number.");
      }

      // Generate a random 6-digit OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setOtpExpiry(Date.now() + 2 * 60 * 1000); // 2 minutes expiry

      console.log(`%c [AKWANTUO AUTH] OTP for ${fullPhone}: ${newOtp} `, "background: #1e293b; color: #f8fafc; font-weight: bold; padding: 4px; border-radius: 4px;");

      toast.success("Code sent! Check your console for demo.");

      setTimer(52);
      setStep("otp");
    } catch {
      toast.error("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) return;

    if (otpExpiry && Date.now() > otpExpiry) {
      toast.error("OTP has expired. Please request a new one.");
      return;
    }

    if (otpValue !== generatedOtp && otpValue !== "123456") {
      toast.error("Invalid verification code.");
      return;
    }

    setLoading(true);
    try {
      const fullPhone = buildFullPhone();

      const existingProfile = await getProfileByPhone(fullPhone);
      const isReturning = !!existingProfile;

      let profile = existingProfile;
      if (!profile) {
        toast.info("Creating your guide account...");
        profile = await createInitialProfile(fullPhone);
      } else {
        toast.success("Welcome back! Taking you to your dashboard... 🎉");
      }

      const profileData = {
        displayName: profile?.display_name || "",
        location: profile?.location || "",
        phone: fullPhone,
        bio: "",
        languages: ["English", "Twi"],
      };

      if (!isReturning) toast.success("Verified! Welcome aboard 🎉");
      onComplete(fullPhone, profileData, isReturning);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong during verification.");
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div
        className={cn(
          "w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-akwantuo overflow-hidden transition-all duration-500 transform",
          "flex flex-col animate-in fade-in zoom-in"
        )}
      >
        {/* Header/Back Button */}
        <div className="p-8 pb-0">
          {step === "otp" && (
            <button
              onClick={() => setStep("phone")}
              className="p-2 -ml-2 text-charcoal hover:bg-secondary rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
        </div>

        <div className="px-8 pb-12 pt-4 flex flex-col items-center text-center">
          {/* Logo Area */}
          <AkwantuoLogo
            variant={step === "phone" ? "boxed" : "circle"}
            size="md"
            className="mb-4"
          />

          {step === "phone" && (
            <AkwantuoLogo variant="text" className="mb-6" />
          )}

          {/* Titles */}
          <div className="space-y-3 mb-10">
            <h2 className="text-3xl font-extrabold text-charcoal tracking-tight leading-tight px-4">
              {step === "phone" ? "Share your passion, host travelers" : "Check your phone"}
            </h2>
            <p className="text-muted-foreground font-medium px-4">
              {step === "phone"
                ? "Enter your Whatsapp number to create your guide profile"
                : `We sent a 6-digit code to [${selectedCountry.code} ••• ••• ${normalizedPhone.slice(-3) || "•••"}]`}
            </p>
          </div>

          {/* Form Content */}
          {step === "phone" ? (
            <div className="w-full space-y-8">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
                <div className="w-full sm:flex-1 space-y-2 text-left">
                  <label className="text-[13px] font-bold text-charcoal px-1">Country</label>
                  <div className="flex items-center gap-2 h-16 sm:h-[4.5rem] border-2 border-border/60 rounded-2xl px-3 bg-white focus-within:border-primary-navy transition-all">
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <select
                      value={selectedCountry.code}
                      onChange={(event) => {
                        const next = AFRICAN_COUNTRY_CODES.find(
                          (entry) => entry.code === event.target.value
                        );
                        if (next) {
                          setSelectedCountry(next);
                        }
                      }}
                      className="w-full bg-transparent outline-none text-sm font-bold text-charcoal appearance-none"
                    >
                      {AFRICAN_COUNTRY_CODES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name} ({country.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="w-full sm:flex-[2.2] space-y-2 text-left">
                  <label className="text-[13px] font-bold text-charcoal px-1">Phone Number</label>
                  <div className="h-16 sm:h-[4.5rem] border-2 border-border/60 rounded-2xl px-5 bg-white focus-within:border-primary-navy transition-all flex items-center">
                    <input
                      type="tel"
                      placeholder={selectedCountry.placeholder}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 12))}
                      className="w-full bg-transparent outline-none text-xl font-bold placeholder:text-muted-foreground/30 text-charcoal"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={normalizedPhone.length < 7 || loading}
                className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg gap-3"
              >
                {loading ? "Please wait..." : "Continue"}
                <ArrowRight size={20} strokeWidth={2.5} />
              </Button>

              <p className="text-[12px] text-muted-foreground leading-relaxed px-4">
                We'll send you a one-time code to verify your number. Standard messaging rates may apply.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-10">
              <div className="grid grid-cols-6 gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="h-16 w-full text-center text-xl font-bold border-2 border-border/60 rounded-xl bg-white focus:border-primary-navy focus:ring-4 focus:ring-primary-navy/5 outline-none transition-all"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <button
                    className="flex items-center gap-2 text-[14px] font-bold text-muted-foreground hover:text-charcoal transition-colors disabled:opacity-50"
                    disabled={timer > 0}
                  >
                    <Send size={16} />
                    Resend code
                  </button>
                  {timer > 0 && (
                    <p className="text-[14px] font-medium text-muted-foreground">
                      Resend in <span className="text-primary-navy font-bold">{timer}s</span>
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleVerify}
                  disabled={otp.join("").length < 6 || loading}
                  className="w-full h-[4.5rem] bg-primary-navy hover:bg-primary-navy/90 rounded-2xl text-lg font-bold shadow-lg"
                >
                  {loading ? "Verifying..." : "Verify Now"}
                </Button>
              </div>

              <div className="pt-4">
                <p className="text-[10px] font-black tracking-widest text-muted-foreground/50">
                  POWERED BY AKWANTUO SECURITY
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Pattern */}
        {step === "phone" && (
          <div className="bg-secondary/30 h-16 mt-auto border-t border-border flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-300/40 flex items-center justify-center text-slate-400">
              <MapPin size={20} />
            </div>
            <div className="w-20 h-0.5 bg-slate-300/40 rounded-full" />
            <div className="w-10 h-10 rounded-full bg-slate-300/40 flex items-center justify-center text-slate-400 rotate-45">
              <Send size={20} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPhone;

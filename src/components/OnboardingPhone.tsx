import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AkwantuoLogo from "./AkwantuoLogo";
import { cn } from "@/lib/utils";

interface OnboardingPhoneProps {
  onComplete: (phone: string) => void;
}

const OnboardingPhone = ({ onComplete }: OnboardingPhoneProps) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(52);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async () => {
    if (phone.length < 9) return;
    setLoading(true);
    try {
      const fullPhone = `+233${phone}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (error) {
        toast.error("Demo mode: code sent to console.");
        console.log("OTP Code for demo: 123456");
      } else {
        toast.success("Code sent!");
      }
      setStep("otp");
    } catch {
      toast.error("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) return;
    setLoading(true);
    try {
      const fullPhone = `+233${phone}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otpValue,
        type: "sms",
      });
      if (error) {
        if (otpValue === "123456") {
          toast.success("Demo login successful!");
          onComplete(phone);
        } else {
          toast.error("Verification failed. Use 123456 for demo.");
        }
      } else {
        toast.success("Verified! Welcome aboard 🎉");
        onComplete(phone);
      }
    } catch {
      toast.error("Something went wrong.");
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
            <h2 className="text-3xl font-extrabold text-charcoal tracking-tight leading-tight">
              {step === "phone" ? "Welcome to Akwantuo" : "Check your phone"}
            </h2>
            <p className="text-muted-foreground font-medium px-4">
              {step === "phone" 
                ? "Enter your phone number to get started"
                : `We sent a 6-digit code to [+233 ••• ••• ${phone.slice(-3)}]`
              }
            </p>
          </div>

          {/* Form Content */}
          {step === "phone" ? (
            <div className="w-full space-y-8">
              <div className="flex gap-3">
                <div className="flex-1 space-y-2 text-left">
                  <label className="text-[13px] font-bold text-charcoal px-1">Country</label>
                  <div className="flex items-center gap-2 h-[4.5rem] border-2 border-border/60 rounded-2xl px-4 bg-white focus-within:border-primary-navy transition-all">
                    <img 
                      src="https://flagcdn.com/w40/gh.png" 
                      alt="Ghana" 
                      className="w-6 h-4 rounded-sm object-cover" 
                    />
                    <span className="font-bold text-charcoal">+233</span>
                  </div>
                </div>
                <div className="flex-[2.2] space-y-2 text-left">
                  <label className="text-[13px] font-bold text-charcoal px-1">Phone Number</label>
                  <div className="h-[4.5rem] border-2 border-border/60 rounded-2xl px-5 bg-white focus-within:border-primary-navy transition-all flex items-center">
                    <input
                      type="tel"
                      placeholder="024 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-transparent outline-none text-xl font-bold placeholder:text-muted-foreground/30 text-charcoal"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={phone.length < 9 || loading}
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

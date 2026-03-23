import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  guideId: string;
  bookingDate: string;
  numPeople: string;
  guideName: string;
}

const BookingModal = ({
  isOpen,
  onClose,
  guideId,
  bookingDate,
  numPeople,
  guideName
}: BookingModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    if (bookingDate < today) {
      toast.error("You cannot book for a past date. Please select a future date.");
      return;
    }

    if (!name || !phone) {
      toast.error("Please provide your name and phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .insert({
          guide_id: guideId,
          tourist_name: name,
          tourist_phone: phone,
          booking_date: bookingDate,
          status: "pending"
        });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Booking request sent successfully!");
    } catch (error: any) {
      console.error("Booking failed:", error);
      toast.error(error.message || "Failed to send booking request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 size={40} className="text-emerald-600" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black text-slate-900">Request Sent!</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium text-base">
                {guideName} has received your request for <strong>{bookingDate}</strong>. 
                They will contact you shortly on <strong>{phone}</strong>.
              </DialogDescription>
            </div>
            <Button 
              onClick={onClose}
              className="w-full h-14 bg-primary-navy hover:bg-primary-navy/90 text-white rounded-2xl font-bold"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[2rem] p-8">
        <DialogHeader className="space-y-3 mb-6">
          <DialogTitle className="text-2xl font-black text-slate-900 leading-tight">Final Step!</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Just a few details so <strong>{guideName}</strong> can confirm your trip on {bookingDate}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Your Name</Label>
            <Input
              id="name"
              placeholder="e.g. Ama Serwaa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-4 font-bold text-slate-700"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">WhatsApp Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. +233 24 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-4 font-bold text-slate-700"
              required
            />
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Booking Summary</p>
            <p className="text-sm font-bold text-slate-700">Date: {bookingDate}</p>
            <p className="text-sm font-bold text-slate-700">Guests: {numPeople}</p>
          </div>

          <DialogFooter className="sm:justify-start pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-primary-navy hover:bg-primary-navy/90 text-white rounded-2xl font-bold shadow-lg shadow-primary-navy/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending Request...
                </>
              ) : (
                "Confirm Booking Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;

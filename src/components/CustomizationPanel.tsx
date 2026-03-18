import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Pencil,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface StoreData {
  businessName: string;
  description: string;
  price: string;
  negotiable: boolean;
  location: string;
}

interface CustomizationPanelProps {
  data: StoreData;
  onChange: (data: StoreData) => void;
  liteMode?: boolean;
  onRegenerate?: () => void;
}

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionSection = ({ title, children, defaultOpen = false }: AccordionSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-2 border-border rounded-2xl overflow-hidden bg-card shadow-hard">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 press-feedback"
      >
        <span className="label-caps">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-4 pb-4 space-y-3 animate-fade-in">{children}</div>}
    </div>
  );
};

const CustomizationPanel = ({ data, onChange, liteMode, onRegenerate }: CustomizationPanelProps) => {
  const update = (key: keyof StoreData, value: string | boolean) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3">
      <AccordionSection title="Experience Info" defaultOpen>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Tour/Guide Name</label>
            <div className="flex items-center gap-2 border-2 border-border rounded-xl px-3 h-12 focus-within:border-primary transition-colors bg-background">
              <input
                type="text"
                value={data.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm font-medium"
              />
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground font-medium">Description</label>
              <button 
                onClick={onRegenerate}
                className="flex items-center gap-1 text-xs text-primary font-medium press-feedback"
              >
                <RefreshCw className={`w-3 h-3 ${!liteMode ? 'animate-spin-slow' : ''}`} />
                Regenerate
              </button>
            </div>
            <textarea
              value={data.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="w-full border-2 border-border rounded-xl px-3 py-2.5 bg-background outline-none text-sm focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="Pricing">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Price (GHS)</label>
            <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
              <span className="text-lg text-muted-foreground font-medium">GH₵</span>
              <input
                type="text"
                inputMode="decimal"
                value={data.price}
                onChange={(e) => update("price", e.target.value)}
                className="flex-1 bg-transparent outline-none text-3xl font-bold price"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium">Price is flexible</span>
            <button
              onClick={() => update("negotiable", !data.negotiable)}
              className={`w-12 h-7 rounded-pill transition-colors press-feedback ${
                data.negotiable ? "bg-primary" : "bg-border"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform mx-1 ${
                  data.negotiable ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="Location">
        <div className="flex items-center gap-2 border-2 border-border rounded-xl px-3 h-12 focus-within:border-primary transition-colors bg-background">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={data.location}
            onChange={(e) => update("location", e.target.value)}
            className={`flex-1 bg-transparent outline-none text-sm font-medium ${liteMode ? 'transition-none' : ''}`}
            placeholder="e.g. Cape Coast Castle, Ghana"
          />
        </div>
      </AccordionSection>
    </div>
  );
};

export default CustomizationPanel;

import { UtensilsCrossed, Palette, Shirt, Wrench, Smartphone } from "lucide-react";

interface CategorySelectorProps {
  onSelect: (category: string) => void;
}

const categories = [
  { id: "food", label: "Food & Drinks", icon: UtensilsCrossed },
  { id: "crafts", label: "Crafts & Art", icon: Palette },
  { id: "clothing", label: "Clothing", icon: Shirt },
  { id: "services", label: "Services", icon: Wrench },
  { id: "electronics", label: "Electronics", icon: Smartphone },
];

const CategorySelector = ({ onSelect }: CategorySelectorProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-display tracking-tight">What do you sell?</h1>
          <p className="text-muted-foreground text-body">Pick your business type</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className="flex flex-col items-center gap-3 p-5 bg-card border-2 border-border rounded-2xl shadow-hard press-feedback hover:border-primary transition-colors min-h-touch"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;

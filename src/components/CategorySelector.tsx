import { Mountain, Map, UtensilsCrossed, Palette, Leaf, Camera } from "lucide-react";

interface CategorySelectorProps {
  onSelect: (category: string) => void;
}

const categories = [
  { id: "adventure", label: "Adventure", icon: Mountain },
  { id: "culture", label: "Culture & History", icon: Map },
  { id: "food", label: "Food & Drinks", icon: UtensilsCrossed },
  { id: "arts", label: "Arts & Crafts", icon: Palette },
  { id: "nature", label: "Nature & Wildlife", icon: Leaf },
  { id: "photography", label: "Photography", icon: Camera },
];

const CategorySelector = ({ onSelect }: CategorySelectorProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-display tracking-tight text-3xl font-extrabold">What's your experience?</h1>
          <p className="text-muted-foreground text-body font-medium">Pick your niche to help travelers find you</p>
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

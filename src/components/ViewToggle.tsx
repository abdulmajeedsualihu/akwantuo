import { Eye, Pencil } from "lucide-react";

interface ViewToggleProps {
  view: "edit" | "preview";
  onChange: (view: "edit" | "preview") => void;
}

const ViewToggle = ({ view, onChange }: ViewToggleProps) => {
  return (
    <div className="flex bg-secondary rounded-pill p-1 shadow-hard">
      <button
        onClick={() => onChange("edit")}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-semibold transition-all duration-150 press-feedback ${
          view === "edit"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground"
        }`}
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      <button
        onClick={() => onChange("preview")}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-semibold transition-all duration-150 press-feedback ${
          view === "preview"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground"
        }`}
      >
        <Eye className="w-3.5 h-3.5" />
        Preview
      </button>
    </div>
  );
};

export default ViewToggle;

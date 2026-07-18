import { Edit2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface EditButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export default function EditButton({ onClick, label = "Edit", className = "" }: EditButtonProps) {
  const { role } = useAuth();

  // If not admin, render absolutely nothing
  if (role !== "admin") return null;

  return (
    <button
      onClick={onClick}
      className={`absolute right-4 top-4 z-20 flex items-center gap-2 rounded-md border border-amber-500/30 bg-red-950/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 shadow-lg backdrop-blur-sm transition-all hover:bg-red-900 hover:text-white ${className}`}
    >
      <Edit2 size={14} />
      {label}
    </button>
  );
}
// app/components/DeleteButton.tsx
"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useColorTheme } from "@/app/context/ColorThemeContext";

interface DeleteButtonProps {
  onDelete: () => void;
  isDeleting: boolean;
  label: string; // e.g. "Delete lesson" -- used as aria-label/title
}

/** Small icon-only delete button for list rows, dark-HUD styled. */
export function DeleteButton({
  onDelete,
  isDeleting,
  label,
}: DeleteButtonProps) {
  const { theme } = useColorTheme();
  const { shades } = theme;

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={isDeleting}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Delete this? This can't be undone.")) {
          onDelete();
        }
      }}
      className="shrink-0 rounded-md border border-transparent p-1.5 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
      style={{ color: `${shades[300]}66` }}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}

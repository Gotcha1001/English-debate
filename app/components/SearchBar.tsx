"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { useColorTheme } from "@/app/context/ColorThemeContext";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Reusable search input, styled to match HudPanel's dark theme --
 * accent color follows the active color theme. */
export function SearchBar({
  value,
  onChange,
  placeholder = "Search by topic...",
}: SearchBarProps) {
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const [focused, setFocused] = useState(false);
  const [clearHovered, setClearHovered] = useState(false);

  return (
    <div className="relative mb-4">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
        style={{ color: `${hex400}80` }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-[#0a1219] py-2.5 pl-9 pr-9 text-sm text-stone-50 outline-none placeholder:text-stone-500"
        style={{
          border: `1px solid ${focused ? hex400 : `${hex400}33`}`,
          boxShadow: focused ? `0 0 0 2px ${hex400}33` : "none",
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          onMouseEnter={() => setClearHovered(true)}
          onMouseLeave={() => setClearHovered(false)}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: clearHovered ? shades[300] : `${shades[300]}66` }}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

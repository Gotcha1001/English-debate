// app/components/HudPanel.tsx  (or wherever it lives)
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { buildHudGridBackground } from "@/lib/colorThemes";

const CORNERS = [
  "-left-px -top-px border-l-2 border-t-2",
  "-right-px -top-px border-r-2 border-t-2",
  "-left-px -bottom-px border-l-2 border-b-2",
  "-right-px -bottom-px border-r-2 border-b-2",
];

interface HudPanelProps {
  children: ReactNode;
  className?: string;
  /** Show the animated accent-colored scanline sweep down the panel. */
  scanline?: boolean;
}

/** Shared dark/accent "HUD" card used across every page. */
export function HudPanel({
  children,
  className = "",
  scanline = false,
}: HudPanelProps) {
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const gridBg = useMemo(() => buildHudGridBackground(theme), [theme]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-[#04070a] ${className}`}
      style={{
        borderColor: `${hex400}40`,
        boxShadow: `0 0 60px -18px ${hex400}59`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("${gridBg}")`,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a1219_0%,_#04070a_75%)]" />
      {CORNERS.map((cls) => (
        <div
          key={cls}
          className={`pointer-events-none absolute ${cls} h-5 w-5`}
          style={{ borderColor: `${hex400}99` }}
        />
      ))}
      {scanline && (
        <motion.div
          className="pointer-events-none absolute left-0 right-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${shades[300]}80, transparent)`,
          }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

/** Small accent section-label pill. */
export function HudLabel({ children }: { children: ReactNode }) {
  const { theme } = useColorTheme();
  const { shades } = theme;

  return (
    <p
      className="mb-3 font-[family-name:var(--font-hud)] text-xs uppercase tracking-[0.2em]"
      style={{ color: `${shades[300]}b3` }}
    >
      {children}
    </p>
  );
}

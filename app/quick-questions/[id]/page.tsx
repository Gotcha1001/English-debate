"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import type { ColorTheme } from "@/lib/colorThemes";

/** Append an alpha channel (0–1) to a #rrggbb hex color, e.g. alpha("#22d3ee", 0.4) -> "#22d3ee66" */
function alpha(hex: string, a: number) {
  const v = Math.round(a * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${v}`;
}

/* ---------- denser matrix rain + orbitals ---------- */
const READOUTS = [
  ["01", "noun", "verb", "0xA2"],
  ["adj.", ">>", "clause", "B2"],
  ["prep.", "00", "tense", "C1"],
  ["subj.", "//", "adv.", "A1"],
  ["conj.", "FF", "pronoun", "B1"],
  ["art.", "::", "interj.", "0x3F"],
  ["noun", ">>", "verb", "scan"],
  ["adj.", "01", "prep.", "link"],
];

const RAIN_COLUMNS = Array.from({ length: 14 }).map((_, i) => ({
  left: `${(i / 13) * 100}%`,
  tokens: READOUTS[i % READOUTS.length],
  duration: 8 + (i % 6) * 1.8,
  delay: (i % 7) * 0.45,
  fontSize: i % 3 === 0 ? 11 : 9,
}));

const ORBITALS = [
  { top: "8%", left: "5%", size: 12, delay: 0 },
  { top: "15%", left: "92%", size: 9, delay: 0.7 },
  { top: "38%", left: "3%", size: 14, delay: 1.4 },
  { top: "52%", left: "95%", size: 10, delay: 0.3 },
  { top: "68%", left: "10%", size: 11, delay: 1.9 },
  { top: "28%", left: "97%", size: 8, delay: 1.1 },
  { top: "45%", left: "50%", size: 13, delay: 0.5 },
  { top: "78%", left: "80%", size: 9, delay: 1.6 },
  { top: "22%", left: "30%", size: 7, delay: 2.2 },
  { top: "85%", left: "42%", size: 10, delay: 0.9 },
  { top: "60%", left: "22%", size: 8, delay: 2.5 },
  { top: "12%", left: "65%", size: 6, delay: 1.3 },
];

function MatrixBackground({ theme }: { theme: ColorTheme }) {
  const reduceMotion = useReducedMotion();
  const { hex400, shades } = theme;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* denser falling columns */}
      <div className="absolute inset-0 opacity-50 dark:opacity-60">
        {RAIN_COLUMNS.map((col, i) => (
          <motion.div
            key={i}
            className="absolute top-0 flex flex-col gap-5 font-[family-name:var(--font-hud)] uppercase tracking-[0.2em]"
            style={{
              left: col.left,
              fontSize: col.fontSize,
              color:
                i % 3 === 0
                  ? alpha(hex400, 0.55)
                  : i % 3 === 1
                    ? alpha(hex400, 0.3)
                    : alpha(shades[300], 0.2),
              maskImage:
                "linear-gradient(to bottom, transparent, black 8%, black 82%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 8%, black 82%, transparent)",
              textShadow:
                i % 3 === 0 ? `0 0 8px ${alpha(hex400, 0.6)}` : undefined,
            }}
            animate={reduceMotion ? undefined : { y: ["-50%", "150%"] }}
            transition={{
              duration: col.duration,
              repeat: Infinity,
              delay: col.delay,
              ease: "linear",
            }}
          >
            {[
              ...col.tokens,
              ...col.tokens,
              ...col.tokens,
              ...col.tokens,
              ...col.tokens,
            ].map((t, j) => (
              <span key={j}>{t}</span>
            ))}
          </motion.div>
        ))}
      </div>

      {/* scanline sweep */}
      {!reduceMotion && (
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${alpha(
              shades[300],
              0.4,
            )}, transparent)`,
          }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* glowing orbitals */}
      {ORBITALS.map((o, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            top: o.top,
            left: o.left,
            width: o.size,
            height: o.size,
            backgroundColor: shades[300],
            boxShadow: `0 0 18px 5px ${alpha(hex400, 0.6)}, 0 0 40px 12px ${alpha(
              hex400,
              0.25,
            )}`,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.15, 0.9, 0.15],
                  scale: [0.6, 1.6, 0.6],
                }
          }
          transition={{
            duration: 3.2 + (i % 3) * 0.4,
            repeat: Infinity,
            delay: o.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function QuickQuestionsSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.quickQuestionsData.getQuickQuestionSet, {
    id: params.id as Id<"quickQuestionSets">,
  });
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Loading questions…
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Question set not found.
      </p>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground theme={theme} />

      <div className="relative z-10 mx-auto max-w-3xl pb-16">
        <header className="mb-8">
          <p
            className="font-[family-name:var(--font-hud)] text-xs uppercase tracking-[0.25em]"
            style={{ color: hex400 }}
          >
            40 Questions
          </p>
          <h1
            className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-stone-50"
            style={{ filter: `drop-shadow(0 0 20px ${alpha(hex400, 0.35)})` }}
          >
            {set.topic}
          </h1>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-stone-500">
            {String(set.questions.length).padStart(2, "0")} units · free-talk
            protocol
          </p>
        </header>

        <ol className="space-y-2">
          {set.questions.map((question, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <li
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="
                  flex gap-3 rounded-lg border border-slate-200 bg-white/80 p-3
                  backdrop-blur-sm transition-all duration-200
                  dark:bg-[#0a1219]/75
                "
                style={{
                  borderColor: alpha(hex400, isHovered ? 0.4 : 0.1),
                  backgroundColor: isHovered ? alpha(hex400, 0.06) : undefined,
                  boxShadow: isHovered
                    ? `0 0 28px -6px ${alpha(hex400, 0.5)}`
                    : undefined,
                }}
              >
                <span
                  className="shrink-0 font-mono text-xs tabular-nums transition-colors"
                  style={{
                    color: isHovered ? shades[300] : hex400,
                    filter: isHovered
                      ? `drop-shadow(0 0 6px ${alpha(hex400, 0.8)})`
                      : undefined,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-slate-900 transition-colors dark:text-stone-50">
                  {question}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

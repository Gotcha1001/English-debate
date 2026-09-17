"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Flame, Sparkles, XCircle } from "lucide-react";
import { useColorTheme } from "@/app/context/ColorThemeContext";

interface PunCardProps {
  index: number;
  setup: string;
  punchline: string;
  distractors: string[]; // exactly 3 wrong-but-plausible punchlines
  explanation: string;
  groanRating: number; // 1-5
}

interface PunOption {
  text: string;
  isCorrect: boolean;
}

/** Fisher-Yates shuffle -- doesn't mutate the input. */
function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * A single pun in the "Pun Lab" set, now a mini multiple-choice quiz.
 * Shows the setup line, then 4 candidate punchlines (the real one + 3
 * decoys) in random order. Tapping one locks the guess, marks it
 * correct/incorrect, then reveals the wordplay explanation + a
 * "groan-o-meter" (flame icons, one per groanRating point).
 */
export function PunCard({
  index,
  setup,
  punchline,
  distractors,
  explanation,
  groanRating,
}: PunCardProps) {
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const options = useMemo<PunOption[]>(
    () =>
      shuffle([
        { text: punchline, isCorrect: true },
        ...distractors.map((text) => ({ text, isCorrect: false })),
      ]),
    [punchline, distractors],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [cardHovered, setCardHovered] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
  const answered = selected !== null;
  const gotItRight = answered && options[selected].isCorrect;

  return (
    <div
      className="group rounded-lg bg-[#0a1219] p-4 transition-colors"
      style={{
        border: `1px solid ${cardHovered ? `${hex400}4d` : `${hex400}1a`}`,
      }}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
    >
      <div className="flex items-start gap-3">
        <span
          className="shrink-0 font-mono text-xs tabular-nums"
          style={{ color: hex400 }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 text-stone-50">{setup}</span>
      </div>

      <div className="ml-7 mt-3 flex flex-col gap-1.5">
        {options.map((option, optIndex) => {
          const isSelected = selected === optIndex;
          const isOptHovered = hoveredOption === optIndex;

          let optionStyle: React.CSSProperties;
          let optionClassName =
            "flex items-center justify-between rounded-md border px-3 py-1.5 text-left text-sm transition-all duration-200";

          if (answered && option.isCorrect) {
            optionStyle = {
              borderColor: hex400,
              backgroundColor: `${hex400}26`,
              boxShadow: `0 0 20px -4px ${hex400}80`,
            };
          } else if (answered && isSelected) {
            optionClassName += " border-red-500 bg-red-500/10";
            optionStyle = {};
          } else if (answered) {
            optionClassName += " opacity-50";
            optionStyle = { borderColor: `${hex400}1a` };
          } else {
            optionStyle = {
              borderColor: isOptHovered ? `${hex400}66` : `${hex400}26`,
              backgroundColor: isOptHovered ? `${hex400}1a` : "transparent",
              boxShadow: isOptHovered ? `0 0 16px -4px ${hex400}59` : "none",
            };
          }

          return (
            <button
              key={optIndex}
              type="button"
              disabled={answered}
              onClick={() => setSelected(optIndex)}
              onMouseEnter={() => setHoveredOption(optIndex)}
              onMouseLeave={() => setHoveredOption(null)}
              className={optionClassName}
              style={optionStyle}
            >
              <span className="text-stone-50">{option.text}</span>
              {answered && option.isCorrect && (
                <CheckCircle2 className="h-4 w-4" style={{ color: hex400 }} />
              )}
              {answered && isSelected && !option.isCorrect && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {answered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-7 mt-3 space-y-3">
              <div
                className="rounded-lg bg-[#04070a] p-3"
                style={{ border: `1px solid ${hex400}33` }}
              >
                <p
                  className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: `${shades[300]}b3` }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {gotItRight
                    ? "Nice — that's the pun"
                    : "The actual pun was..."}
                </p>
                <p className="text-stone-50">{punchline}</p>
              </div>
              <p className="text-sm text-stone-400">{explanation}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: `${shades[300]}80` }}
                >
                  Groan-o-meter
                </span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Flame
                      key={i}
                      className={
                        i < groanRating
                          ? "h-3.5 w-3.5 fill-orange-400 text-orange-400"
                          : "h-3.5 w-3.5"
                      }
                      style={
                        i < groanRating
                          ? undefined
                          : { color: `${shades[300]}26` }
                      }
                    />
                  ))}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Flame, Sparkles, XCircle } from "lucide-react";

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
  const options = useMemo<PunOption[]>(
    () =>
      shuffle([
        { text: punchline, isCorrect: true },
        ...distractors.map((text) => ({ text, isCorrect: false })),
      ]),
    [punchline, distractors],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const gotItRight = answered && options[selected].isCorrect;

  return (
    <div
      className="
        group rounded-lg border border-cyan-400/10 bg-[#0a1219] p-4
        transition-colors hover:border-cyan-400/30
      "
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 font-mono text-xs tabular-nums text-cyan-400">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 text-cyan-50">{setup}</span>
      </div>

      <div className="ml-7 mt-3 flex flex-col gap-1.5">
        {options.map((option, optIndex) => {
          const isSelected = selected === optIndex;
          return (
            <button
              key={optIndex}
              type="button"
              disabled={answered}
              onClick={() => setSelected(optIndex)}
              className={`
                flex items-center justify-between rounded-md border px-3 py-1.5
                text-left text-sm transition-all duration-200
                ${
                  answered && option.isCorrect
                    ? "border-cyan-400 bg-cyan-400/15 shadow-[0_0_20px_-4px_rgba(34,211,238,0.5)]"
                    : answered && isSelected
                      ? "border-red-500 bg-red-500/10"
                      : answered
                        ? "border-cyan-400/10 opacity-50"
                        : "border-cyan-400/15 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:shadow-[0_0_16px_-4px_rgba(34,211,238,0.35)]"
                }
              `}
            >
              <span className="text-cyan-50">{option.text}</span>
              {answered && option.isCorrect && (
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
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
              <div className="rounded-lg border border-cyan-400/20 bg-[#04070a] p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-300/70">
                  <Sparkles className="h-3.5 w-3.5" />
                  {gotItRight
                    ? "Nice — that's the pun"
                    : "The actual pun was..."}
                </p>
                <p className="text-cyan-50">{punchline}</p>
              </div>
              <p className="text-sm text-cyan-200/60">{explanation}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-cyan-300/50">
                  Groan-o-meter
                </span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Flame
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < groanRating
                          ? "fill-orange-400 text-orange-400"
                          : "text-cyan-200/15"
                      }`}
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

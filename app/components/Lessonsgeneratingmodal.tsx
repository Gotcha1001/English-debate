"use client";

// components/LessonGeneratingModal.tsx
//
// Shown while generateLesson (prompt -> OpenRouter -> saveLesson) is
// running, replacing the old "Writing your lesson..." button state.
// Same visual language as the reference ScrapingModal — dark #04070a,
// cyan #22d3ee, --font-display / --font-hud — just reskinned for a
// language-lesson generator instead of a disaster scanner: the falling
// "readouts" are now lesson stats (CEFR level, part of speech, word
// counts) and the steps map to what generateLesson actually does.

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BookOpen, MessagesSquare, ListChecks, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const LESSON_STEPS = [
  { icon: BookOpen, label: "Sketching the story" },
  { icon: MessagesSquare, label: "Writing comprehension questions" },
  { icon: ListChecks, label: "Checking sentence structure" },
  { icon: Sparkles, label: "Polishing the lesson" },
];
const GRAMMAR_STEPS = [
  { icon: BookOpen, label: "Writing example sentences" },
  { icon: ListChecks, label: "Tagging every word" },
  { icon: MessagesSquare, label: "Writing quiz questions" },
  { icon: Sparkles, label: "Polishing the breakdown" },
];

const DEBATE_STEPS = [
  { icon: MessagesSquare, label: "Framing the topic" },
  { icon: ListChecks, label: "Drafting discussion questions" },
  { icon: BookOpen, label: "Varying angles and phrasing" },
  { icon: Sparkles, label: "Polishing the set" },
];

const COPY = {
  lesson: {
    title: "Writing your lesson",
    subtitle: "Building your Free Talking lesson",
    icon: BookOpen,
    steps: LESSON_STEPS,
  },
  debate: {
    title: "Writing your questions",
    subtitle: "Building your discussion & debate set",
    icon: MessagesSquare,
    steps: DEBATE_STEPS,
  },
  grammar: {
    title: "Writing your breakdown",
    subtitle: "Building your grammar breakdown",
    icon: BookOpen,
    steps: GRAMMAR_STEPS,
  },
} as const;

// Fixed positions — no Math.random() so SSR/client markup matches
const PULSES = [
  { top: "12%", left: "10%", delay: 0 },
  { top: "22%", left: "86%", delay: 0.8 },
  { top: "70%", left: "8%", delay: 1.5 },
  { top: "80%", left: "88%", delay: 0.5 },
  { top: "48%", left: "92%", delay: 1.9 },
  { top: "58%", left: "6%", delay: 1.1 },
];

// Playful lesson-stat tokens instead of seismic readouts
const READOUTS = [
  ["B2", "noun", "12 wds"],
  ["A2", "verb", "3 Qs"],
  ["C1", "adj.", "5 min"],
  ["B1", "adv.", "8 wds"],
  ["A1", "verb", "2 Qs"],
];
const RAIN_COLUMNS = Array.from({ length: 6 }).map((_, i) => ({
  left: `${(i / 5) * 100}%`,
  tokens: READOUTS[i % READOUTS.length],
  duration: 8 + (i % 4) * 1.8,
  delay: (i % 5) * 0.6,
}));

const GRID_BG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg stroke='%2322d3ee' stroke-opacity='0.35' stroke-width='1'%3E%3Cpath d='M24 18v12M18 24h12'/%3E%3C/g%3E%3C/svg%3E";

const flicker = {
  opacity: [0.55, 0.9, 0.5, 1, 0.6, 0.85, 0.55],
  scale: [0.95, 1.05, 0.92, 1.1, 0.97, 1.04, 0.95],
};

export function LessonGeneratingModal({
  open,
  variant = "lesson",
}: {
  open: boolean;
  variant?: "lesson" | "debate" | "grammar";
}) {
  const { title, subtitle, icon: CoreIcon, steps } = COPY[variant];
  const reduceMotion = useReducedMotion();
  const spin = (reverse = false) =>
    reduceMotion ? undefined : { rotate: reverse ? -360 : 360 };
  const spinTransition = (duration: number) =>
    reduceMotion
      ? { duration: 0 }
      : { duration, repeat: Infinity, ease: "linear" as const };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md border-0 bg-transparent p-0 shadow-none"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative overflow-hidden rounded-xl border border-cyan-400/25 bg-[#04070a] p-8 text-center shadow-[0_0_60px_-12px_rgba(34,211,238,0.5)]"
          >
            {/* coordinate-grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage: `url("${GRID_BG}")`,
                backgroundSize: "48px 48px",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a1219_0%,_#04070a_75%)]" />

            {/* falling lesson-stat readouts, clipped to card */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
              {RAIN_COLUMNS.map((col, i) => (
                <motion.div
                  key={i}
                  className="absolute top-0 flex flex-col gap-5 font-[family-name:var(--font-hud)] text-[10px]"
                  style={{
                    left: col.left,
                    color:
                      i % 2 === 0
                        ? "rgba(34,211,238,0.35)"
                        : "rgba(220,38,38,0.25)",
                    maskImage:
                      "linear-gradient(to bottom, transparent, black 25%, black 65%, transparent)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent, black 25%, black 65%, transparent)",
                  }}
                  animate={reduceMotion ? undefined : { y: ["-30%", "130%"] }}
                  transition={{
                    duration: col.duration,
                    repeat: Infinity,
                    delay: col.delay,
                    ease: "linear",
                  }}
                >
                  {col.tokens.map((t, j) => (
                    <span key={j}>{t}</span>
                  ))}
                </motion.div>
              ))}
            </div>

            {/* idea-spark dust */}
            {PULSES.map((s, i) => (
              <motion.span
                key={i}
                className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-cyan-300"
                style={{ top: s.top, left: s.left }}
                animate={
                  reduceMotion ? undefined : { opacity: [0.1, 0.7, 0.1] }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: s.delay,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* corner brackets */}
            {[
              "-left-px -top-px border-l-2 border-t-2",
              "-right-px -top-px border-r-2 border-t-2",
              "-left-px -bottom-px border-l-2 border-b-2",
              "-right-px -bottom-px border-r-2 border-b-2",
            ].map((cls, i) => (
              <div
                key={i}
                className={`pointer-events-none absolute ${cls} h-5 w-5 border-cyan-400/60`}
              />
            ))}

            {/* scanline sweep */}
            <motion.div
              className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"
              animate={reduceMotion ? undefined : { top: ["0%", "100%"] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
            />

            {/* ===== flickering core ===== */}
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border border-dashed border-cyan-400/35"
                animate={spin()}
                transition={spinTransition(14)}
              />
              <motion.div
                className="absolute inset-1.5 rounded-full border border-cyan-600/40"
                animate={spin(true)}
                transition={spinTransition(9)}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-300/30"
                animate={
                  reduceMotion
                    ? undefined
                    : { scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }
                }
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <motion.div
                className="absolute h-10 w-10 rounded-full bg-cyan-300 blur-xl"
                animate={reduceMotion ? undefined : flicker}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/50 bg-gradient-to-br from-cyan-700 to-cyan-500 shadow-[0_0_25px_-4px_rgba(34,211,238,0.9)]">
                <CoreIcon className="h-5 w-5 text-[#04070a]" />
              </div>
            </div>

            <h2 className="relative font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-cyan-50">
              {title}
            </h2>
            <p className="relative mt-2 font-[family-name:var(--font-hud)] text-xs uppercase tracking-[0.2em] text-cyan-200/50">
              {subtitle}
            </p>

            {/* cycling steps */}
            <div className="relative mt-8 space-y-2.5">
              {steps.map((step, i) => (
                <StepRow key={step.label} step={step} index={i} />
              ))}
            </div>

            {/* progress bar */}
            <div className="relative mt-8 h-1 overflow-hidden rounded-full bg-cyan-400/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-700 via-cyan-300 to-cyan-700"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ width: "35%" }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function StepRow({
  step,
  index,
}: {
  step: (typeof LESSON_STEPS)[number];
  index: number;
}) {
  const Icon = step.icon;
  return (
    <motion.div
      className="group flex items-center gap-3 rounded-md border border-cyan-400/10 bg-cyan-400/[0.04] px-3 py-2 text-left"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.12 * index + 0.2, duration: 0.4 }}
    >
      <motion.div
        className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded border border-cyan-400/30 bg-[#0a1219]"
        animate={{
          borderColor: [
            "rgba(34,211,238,0.3)",
            "rgba(103,232,249,0.7)",
            "rgba(34,211,238,0.3)",
          ],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          delay: index * 0.5,
          ease: "easeInOut",
        }}
      >
        <Icon className="h-3 w-3 text-cyan-200/80" />
      </motion.div>
      <span className="font-[family-name:var(--font-hud)] text-[13px] text-cyan-50/75">
        {step.label}
        <motion.span
          className="inline-block"
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.3,
          }}
        >
          …
        </motion.span>
      </span>
      <motion.span
        className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400"
        animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.3, 1] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: index * 0.25,
        }}
      />
    </motion.div>
  );
}

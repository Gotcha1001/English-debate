// components/LessonGeneratingModal.tsx
"use client";

import { useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  MessagesSquare,
  ListChecks,
  Sparkles,
  Clock,
  Layers,
  ArrowLeftRight,
  GitCompare,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { buildHudGridBackground } from "@/lib/colorThemes";

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
const PUNS_STEPS = [
  { icon: BookOpen, label: "Brainstorming wordplay" },
  { icon: ListChecks, label: "Writing setups & punchlines" },
  { icon: MessagesSquare, label: "Writing discussion questions" },
  { icon: Sparkles, label: "Polishing the set" },
];
const WORD_RELATIONS_STEPS = [
  { icon: BookOpen, label: "Picking base words" },
  { icon: ListChecks, label: "Writing synonym & antonym choices" },
  { icon: MessagesSquare, label: "Writing debate questions" },
  { icon: Sparkles, label: "Polishing the set" },
];
const SYNONYMS_STEPS = [
  { icon: BookOpen, label: "Building synonym spectrums" },
  { icon: ListChecks, label: "Writing fill-in-the-blank checks" },
  { icon: MessagesSquare, label: "Writing debate questions" },
  { icon: Sparkles, label: "Polishing the set" },
];
const ANTONYMS_STEPS = [
  { icon: BookOpen, label: "Pairing up opposites" },
  { icon: ListChecks, label: "Writing example sentences" },
  { icon: MessagesSquare, label: "Building analogy questions" },
  { icon: Sparkles, label: "Polishing the set" },
];
const TENSE_CONVERSION_STEPS = [
  { icon: BookOpen, label: "Writing example sentences" },
  { icon: Clock, label: "Picking a from/to tense pair" },
  { icon: ListChecks, label: "Working out each correct rewrite" },
  { icon: Sparkles, label: "Polishing the set" },
];
const TENSES_STEPS = [
  { icon: BookOpen, label: "Writing the paragraph" },
  { icon: Clock, label: "Shifting sentences across tenses" },
  { icon: ListChecks, label: "Writing tense-naming questions" },
  { icon: Sparkles, label: "Polishing the set" },
];
const IDIOMS_STEPS = [
  { icon: BookOpen, label: "Picking an idiom" },
  { icon: MessagesSquare, label: "Writing the origin story" },
  { icon: ListChecks, label: "Building the choices & scale" },
  { icon: Sparkles, label: "Polishing the lesson" },
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
  puns: {
    title: "Cooking up puns",
    subtitle: "Building your Pun Lab set",
    icon: Sparkles,
    steps: PUNS_STEPS,
  },
  wordRelations: {
    title: "Comparing word relations",
    subtitle: "Building your synonym vs antonym set",
    icon: GitCompare,
    steps: WORD_RELATIONS_STEPS,
  },
  synonyms: {
    title: "Sorting shades of meaning",
    subtitle: "Building your synonym spectrums",
    icon: Layers,
    steps: SYNONYMS_STEPS,
  },
  antonyms: {
    title: "Pairing up opposites",
    subtitle: "Building your antonym match",
    icon: ArrowLeftRight,
    steps: ANTONYMS_STEPS,
  },
  tenses: {
    title: "Writing your tenses set",
    subtitle: "Shifting each sentence across five tenses",
    icon: Clock,
    steps: TENSES_STEPS,
  },
  idioms: {
    title: "Finding your idiom",
    subtitle: "Building your idiom lesson",
    icon: BookOpen,
    steps: IDIOMS_STEPS,
  },
  tenseConversion: {
    title: "Writing your conversion set",
    subtitle: "Picking sentences and target tenses",
    icon: Clock,
    steps: TENSE_CONVERSION_STEPS,
  },
} as const;

const PULSES = [
  { top: "12%", left: "10%", delay: 0 },
  { top: "22%", left: "86%", delay: 0.8 },
  { top: "70%", left: "8%", delay: 1.5 },
  { top: "80%", left: "88%", delay: 0.5 },
  { top: "48%", left: "92%", delay: 1.9 },
  { top: "58%", left: "6%", delay: 1.1 },
];

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

const flicker = {
  opacity: [0.55, 0.9, 0.5, 1, 0.6, 0.85, 0.55],
  scale: [0.95, 1.05, 0.92, 1.1, 0.97, 1.04, 0.95],
};

export function LessonGeneratingModal({
  open,
  variant = "lesson",
}: {
  open: boolean;
  variant?:
    | "lesson"
    | "debate"
    | "grammar"
    | "tenses"
    | "tenseConversion"
    | "idioms"
    | "synonyms"
    | "antonyms"
    | "wordRelations"
    | "puns";
}) {
  const { title, subtitle, icon: CoreIcon, steps } = COPY[variant];
  const reduceMotion = useReducedMotion();
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const gridBg = useMemo(() => buildHudGridBackground(theme), [theme]);

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
            className="relative overflow-hidden rounded-xl border bg-[#04070a] p-8 text-center"
            style={{
              borderColor: `${hex400}40`,
              boxShadow: `0 0 60px -12px ${hex400}80`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage: `url("${gridBg}")`,
                backgroundSize: "48px 48px",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a1219_0%,_#04070a_75%)]" />

            {/* falling lesson-stat readouts */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
              {RAIN_COLUMNS.map((col, i) => (
                <motion.div
                  key={i}
                  className="absolute top-0 flex flex-col gap-5 font-[family-name:var(--font-hud)] text-[10px]"
                  style={{
                    left: col.left,
                    color: i % 2 === 0 ? `${hex400}59` : "rgba(220,38,38,0.25)",
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
                className="pointer-events-none absolute h-1.5 w-1.5 rounded-full"
                style={{
                  top: s.top,
                  left: s.left,
                  backgroundColor: shades[300],
                }}
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
                className={`pointer-events-none absolute ${cls} h-5 w-5`}
                style={{ borderColor: `${hex400}99` }}
              />
            ))}

            {/* scanline */}
            <motion.div
              className="pointer-events-none absolute left-0 right-0 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${shades[300]}80, transparent)`,
              }}
              animate={reduceMotion ? undefined : { top: ["0%", "100%"] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
            />

            {/* flickering core */}
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border border-dashed"
                style={{ borderColor: `${hex400}59` }}
                animate={spin()}
                transition={spinTransition(14)}
              />
              <motion.div
                className="absolute inset-1.5 rounded-full border"
                style={{ borderColor: `${shades[600]}66` }}
                animate={spin(true)}
                transition={spinTransition(9)}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: `${shades[300]}4d` }}
                animate={
                  reduceMotion
                    ? undefined
                    : { scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }
                }
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <motion.div
                className="absolute h-10 w-10 rounded-full blur-xl"
                style={{ backgroundColor: shades[300] }}
                animate={reduceMotion ? undefined : flicker}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full border"
                style={{
                  borderColor: `${hex400}80`,
                  background: `linear-gradient(to bottom right, ${shades[700]}, ${shades[500]})`,
                  boxShadow: `0 0 25px -4px ${hex400}e6`,
                }}
              >
                <CoreIcon className="h-5 w-5 text-[#04070a]" />
              </div>
            </div>

            <h2 className="relative font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-stone-50">
              {title}
            </h2>
            <p className="relative mt-2 font-[family-name:var(--font-hud)] text-xs uppercase tracking-[0.2em] text-stone-400">
              {subtitle}
            </p>

            <div className="relative mt-8 space-y-2.5">
              {steps.map((step, i) => (
                <StepRow
                  key={step.label}
                  step={step}
                  index={i}
                  hex400={hex400}
                  shades={shades}
                />
              ))}
            </div>

            <div
              className="relative mt-8 h-1 overflow-hidden rounded-full"
              style={{ backgroundColor: `${hex400}1a` }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: "35%",
                  background: `linear-gradient(to right, ${shades[700]}, ${shades[300]}, ${shades[700]})`,
                }}
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
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
  hex400,
  shades,
}: {
  step: (typeof LESSON_STEPS)[number];
  index: number;
  hex400: string;
  shades: { 300: string; 400: string; 500: string; 600: string; 700: string };
}) {
  const Icon = step.icon;
  return (
    <motion.div
      className="group flex items-center gap-3 rounded-md border px-3 py-2 text-left"
      style={{
        borderColor: `${hex400}1a`,
        backgroundColor: `${hex400}0a`,
      }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.12 * index + 0.2, duration: 0.4 }}
    >
      <motion.div
        className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded border bg-[#0a1219]"
        style={{ borderColor: `${hex400}4d` }}
        animate={{
          borderColor: [`${hex400}4d`, `${shades[300]}b3`, `${hex400}4d`],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          delay: index * 0.5,
          ease: "easeInOut",
        }}
      >
        <Icon className="h-3 w-3" style={{ color: `${shades[300]}cc` }} />
      </motion.div>
      <span className="font-[family-name:var(--font-hud)] text-[13px] text-stone-200/80">
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
        className="ml-auto h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: hex400 }}
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

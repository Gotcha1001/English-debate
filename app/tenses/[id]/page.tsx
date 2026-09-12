"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TenseSentenceCard } from "@/app/components/Tensesentencecard";

/* -------- matrix rain + orbitals -------- */
const READOUTS = [
  ["present", "past", "future"],
  ["cont.", "perfect", "simple"],
  ["will", "was", "is"],
  ["-ed", "-ing", "have"],
  ["B1", "A2", "B2"],
  ["present", "perfect", "simple"],
  ["past", "cont.", "future"],
  ["was", "will", "have"],
];

const RAIN_COLUMNS = Array.from({ length: 10 }).map((_, i) => ({
  left: `${(i / 9) * 100}%`,
  tokens: READOUTS[i % READOUTS.length],
  duration: 11 + (i % 5) * 2.4,
  delay: (i % 6) * 0.8,
}));

const ORBITALS = [
  { top: "10%", left: "6%", size: 10, delay: 0 },
  { top: "18%", left: "90%", size: 8, delay: 0.9 },
  { top: "42%", left: "4%", size: 12, delay: 1.6 },
  { top: "58%", left: "93%", size: 9, delay: 0.4 },
  { top: "72%", left: "12%", size: 11, delay: 2.1 },
  { top: "30%", left: "96%", size: 7, delay: 1.2 },
  { top: "50%", left: "48%", size: 10, delay: 0.6 },
  { top: "82%", left: "75%", size: 8, delay: 1.8 },
  { top: "25%", left: "35%", size: 6, delay: 2.4 },
  { top: "88%", left: "40%", size: 9, delay: 1.1 },
];

function MatrixBackground() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 opacity-40 dark:opacity-50">
        {RAIN_COLUMNS.map((col, i) => (
          <motion.div
            key={i}
            className="absolute top-0 flex flex-col gap-7 font-[family-name:var(--font-hud)] text-[10px] uppercase tracking-wider"
            style={{
              left: col.left,
              color:
                i % 2 === 0 ? "rgba(34,211,238,0.45)" : "rgba(34,211,238,0.25)",
              maskImage:
                "linear-gradient(to bottom, transparent, black 12%, black 78%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 12%, black 78%, transparent)",
            }}
            animate={reduceMotion ? undefined : { y: ["-45%", "145%"] }}
            transition={{
              duration: col.duration,
              repeat: Infinity,
              delay: col.delay,
              ease: "linear",
            }}
          >
            {[...col.tokens, ...col.tokens, ...col.tokens, ...col.tokens].map(
              (t, j) => (
                <span key={j}>{t}</span>
              ),
            )}
          </motion.div>
        ))}
      </div>
      {ORBITALS.map((o, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-cyan-300"
          style={{
            top: o.top,
            left: o.left,
            width: o.size,
            height: o.size,
            boxShadow:
              "0 0 16px 4px rgba(34,211,238,0.55), 0 0 32px 8px rgba(34,211,238,0.25)",
          }}
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.2, 0.85, 0.2], scale: [0.7, 1.5, 0.7] }
          }
          transition={{
            duration: 3.6,
            repeat: Infinity,
            delay: o.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function TenseSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.tensesData.getTenseSet, {
    id: params.id as Id<"tenseSets">,
  });

  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Loading tenses set...
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Tenses set not found.
      </p>
    );
  }

  const totalQuestions = set.sentences.reduce(
    (sum, sentence) => sum + sentence.variants.length,
    0,
  );

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 mx-auto max-w-3xl space-y-5 pb-16">
        <header className="mb-2">
          <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
            Tenses
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
            {set.topic}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-cyan-200/40">
            {set.sentences.length} sentences · {totalQuestions} quiz questions
          </p>
        </header>
        {set.sentences.map((sentence, i) => (
          <TenseSentenceCard key={i} index={i} data={sentence} />
        ))}
      </div>
    </div>
  );
}

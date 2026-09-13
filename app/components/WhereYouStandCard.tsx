"use client";
import { useState } from "react";
import { HudPanel, HudLabel } from "./HudPanel";

interface WhereYouStandCardProps {
  scaleLabels: string[]; // exactly 5, one extreme to the other
  questions: string[];
}

const SCALE_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-400",
  "bg-lime-500",
  "bg-emerald-500",
];

/** "Where Do You Stand?" section: a 5-point scale (colored red -> green,
 * top to bottom) plus discussion questions the learner answers by placing
 * themselves on it -- purely a discussion prompt, nothing to submit. */
export function WhereYouStandCard({
  scaleLabels,
  questions,
}: WhereYouStandCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <HudPanel className="p-5">
      <HudLabel>Where Do You Stand?</HudLabel>
      <p className="mb-4 text-sm text-cyan-200/60">
        Use the scale to answer the questions on how you relate to today&apos;s
        idiom.
      </p>
      <div className="mb-5 flex gap-3">
        <div className="flex flex-col overflow-hidden rounded-full">
          {scaleLabels.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={scaleLabels[i]}
              onClick={() => setSelected(i)}
              className={`h-8 w-8 shrink-0 transition-opacity ${SCALE_COLORS[i] ?? "bg-slate-500"} ${
                selected === null || selected === i
                  ? "opacity-100"
                  : "opacity-30"
              }`}
            />
          ))}
        </div>
        <div className="flex flex-col justify-between py-0.5">
          {scaleLabels.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`text-left text-sm transition-colors ${
                selected === i
                  ? "font-semibold text-cyan-50"
                  : "text-cyan-200/60 hover:text-cyan-100"
              }`}
            >
              &ldquo;{label}&rdquo;
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-cyan-400/10 bg-[#0a1219] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300/70">
          Questions
        </p>
        <ol className="space-y-2">
          {questions.map((q, i) => (
            <li key={i} className="text-sm text-cyan-100/90">
              <span className="mr-1.5 font-semibold text-cyan-400">
                {i + 1}.
              </span>
              {q}
            </li>
          ))}
        </ol>
      </div>
    </HudPanel>
  );
}

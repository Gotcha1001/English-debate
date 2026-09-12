"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { HudPanel } from "./HudPanel";

export type Tense =
  | "Present Simple"
  | "Past Simple"
  | "Past Continuous"
  | "Present Perfect"
  | "Future Simple";

export interface TenseVariant {
  tense: Tense;
  sentence: string;
  options: string[];
  correctIndex: number;
}

export interface TenseSentenceData {
  sentence: string;
  variants: TenseVariant[];
}

interface TenseSentenceCardProps {
  index: number;
  data: TenseSentenceData;
}

/** One tense-variant sentence + "which tense is this?" multiple choice --
 * same interaction and states (selected/correct/incorrect) as
 * MultipleChoiceItem on the Free Talking lesson page. */
function TenseQuestion({
  index,
  sentence,
  options,
  correctIndex,
}: {
  index: number;
  sentence: string;
  options: string[];
  correctIndex: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <li
      className="
        rounded-lg border border-slate-200 p-3
        transition-all duration-200
        dark:border-cyan-400/10
        hover:border-cyan-400/30
        dark:hover:border-cyan-400/25 dark:hover:bg-cyan-400/[0.04]
      "
    >
      <p className="mb-2 text-slate-800 dark:text-cyan-100/90">
        <span className="mr-2 text-slate-400 dark:text-cyan-200/40">
          {index + 1}.
        </span>
        {sentence}
      </p>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300/70">
        Which tense is this?
      </p>
      <div className="flex flex-col gap-1.5">
        {options.map((option, optIndex) => {
          const isSelected = selected === optIndex;
          const isCorrect = optIndex === correctIndex;
          const showState = selected !== null;
          return (
            <button
              key={optIndex}
              type="button"
              onClick={() => setSelected(optIndex)}
              className={`
                flex items-center justify-between rounded-md border px-3 py-1.5
                text-left text-sm transition-all duration-200
                ${
                  showState && isCorrect
                    ? "border-cyan-600 bg-cyan-50 shadow-[0_0_16px_-4px_rgba(34,211,238,0.45)] dark:border-cyan-400 dark:bg-cyan-400/15 dark:shadow-[0_0_20px_-4px_rgba(34,211,238,0.5)]"
                    : showState && isSelected
                      ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-500/10"
                      : "border-slate-200 hover:border-cyan-400 hover:bg-cyan-400/[0.06] dark:border-cyan-400/15 dark:hover:border-cyan-400/40 dark:hover:bg-cyan-400/10 dark:hover:shadow-[0_0_16px_-4px_rgba(34,211,238,0.35)]"
                }
              `}
            >
              <span className="text-slate-800 dark:text-cyan-50">{option}</span>
              {showState && isCorrect && (
                <CheckCircle2 className="h-4 w-4 text-cyan-700 dark:text-cyan-400" />
              )}
              {showState && isSelected && !isCorrect && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </button>
          );
        })}
      </div>
    </li>
  );
}

/** One base sentence, shown once, followed by its 5 tense-shifted
 * variants each as a "name the tense" multiple choice question. */
export function TenseSentenceCard({ index, data }: TenseSentenceCardProps) {
  return (
    <HudPanel className="p-5">
      <p className="mb-4 text-lg text-cyan-50">
        <span className="mr-2 text-cyan-500/60">{index + 1}.</span>
        {data.sentence}
      </p>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300/70">
          Tense shifts
        </p>
        <ul className="space-y-2">
          {data.variants.map((variant, i) => (
            <TenseQuestion
              key={i}
              index={i}
              sentence={variant.sentence}
              options={variant.options}
              correctIndex={variant.correctIndex}
            />
          ))}
        </ul>
      </div>
    </HudPanel>
  );
}

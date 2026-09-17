"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { HudPanel } from "./HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

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
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  return (
    <li
      className="
        rounded-lg border border-slate-200 p-3
        transition-all duration-200
        dark:border-stone-700
      "
      style={
        {
          // dark hover border/bg driven by accent
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = `${hex400}40`;
        el.style.backgroundColor = `${hex400}0a`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        // only reset if not in a selected/correct state for the list item itself
        el.style.borderColor = "";
        el.style.backgroundColor = "";
      }}
    >
      <p className="mb-2 text-slate-800 dark:text-stone-100">
        <span
          className="mr-2 text-slate-400"
          style={{ color: `${shades[300]}66` }}
        >
          {index + 1}.
        </span>
        {sentence}
      </p>
      <p
        className="mb-2 text-xs font-semibold uppercase tracking-wide"
        style={{ color: `${shades[300]}b3` }}
      >
        Which tense is this?
      </p>
      <div className="flex flex-col gap-1.5">
        {options.map((option, optIndex) => {
          const isSelected = selected === optIndex;
          const isCorrect = optIndex === correctIndex;
          const showState = selected !== null;

          let borderColor: string | undefined;
          let backgroundColor: string | undefined;
          let boxShadow: string | undefined;

          if (showState && isCorrect) {
            borderColor = hex400;
            backgroundColor = `${hex400}26`;
            boxShadow = `0 0 20px -4px ${hex400}80`;
          } else if (showState && isSelected) {
            // keep semantic red for incorrect
            borderColor = undefined;
            backgroundColor = undefined;
          } else {
            borderColor = `${hex400}26`;
          }

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
                    ? "border-cyan-600 bg-cyan-50 dark:border-transparent"
                    : showState && isSelected
                      ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-500/10"
                      : "border-slate-200 hover:bg-transparent dark:border-transparent"
                }
              `}
              style={
                showState && isCorrect
                  ? {
                      borderColor: hex400,
                      backgroundColor: `${hex400}26`,
                      boxShadow: `0 0 20px -4px ${hex400}80`,
                    }
                  : showState && isSelected
                    ? undefined
                    : {
                        borderColor: `${hex400}26`,
                      }
              }
              onMouseEnter={(e) => {
                if (showState) return;
                const el = e.currentTarget;
                el.style.borderColor = `${hex400}66`;
                el.style.backgroundColor = `${hex400}1a`;
                el.style.boxShadow = `0 0 16px -4px ${hex400}59`;
              }}
              onMouseLeave={(e) => {
                if (showState) return;
                const el = e.currentTarget;
                el.style.borderColor = `${hex400}26`;
                el.style.backgroundColor = "transparent";
                el.style.boxShadow = "none";
              }}
            >
              <span className="text-slate-800 dark:text-stone-50">
                {option}
              </span>
              {showState && isCorrect && (
                <CheckCircle2 className="h-4 w-4" style={{ color: hex400 }} />
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
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  return (
    <HudPanel className="p-5">
      <p className="mb-4 text-lg text-stone-50">
        <span className="mr-2" style={{ color: `${hex400}99` }}>
          {index + 1}.
        </span>
        {data.sentence}
      </p>
      <div>
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: `${shades[300]}b3` }}
        >
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

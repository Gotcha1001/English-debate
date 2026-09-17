"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { HudPanel, HudLabel } from "./HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

interface WordRelationGroupData {
  word: string;
  synonymOptions: string[];
  correctSynonymIndex: number;
  antonymOptions: string[];
  correctAntonymIndex: number;
  debateQuestion: string;
}

interface WordRelationCardProps {
  index: number;
  data: WordRelationGroupData;
}

function ChoiceRow({
  label,
  options,
  correctIndex,
}: {
  label: string;
  options: string[];
  correctIndex: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-semibold text-stone-100/90">{label}</p>

      <div className="flex flex-wrap gap-2">
        {options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = i === correctIndex;
          const showState = selected !== null;

          let className =
            "flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition";

          if (showState && isCorrect) {
            className += " text-stone-50";
          } else if (showState && isSelected) {
            className += " border-red-400 bg-red-500/10 text-red-300";
          } else {
            className += " text-stone-200/80";
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => setSelected(i)}
              className={className}
              style={
                showState && isCorrect
                  ? {
                      borderColor: hex400,
                      backgroundColor: `${hex400}26`,
                    }
                  : !showState || !isSelected
                    ? {
                        borderColor: `${hex400}26`,
                      }
                    : undefined
              }
              onMouseEnter={(e) => {
                if (!showState || (!isCorrect && !isSelected)) {
                  e.currentTarget.style.borderColor = `${hex400}66`;
                  e.currentTarget.style.backgroundColor = `${hex400}1a`;
                }
              }}
              onMouseLeave={(e) => {
                if (!showState || (!isCorrect && !isSelected)) {
                  e.currentTarget.style.borderColor = `${hex400}26`;
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {option}

              {showState && isCorrect && (
                <CheckCircle2
                  className="h-3.5 w-3.5"
                  style={{ color: shades[300] }}
                />
              )}

              {showState && isSelected && !isCorrect && (
                <XCircle className="h-3.5 w-3.5 text-red-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * One word: choose its synonym, choose its antonym, then a debate
 * question that compares the two -- combines Antonym Match's multiple-
 * choice interaction with Synonym Spectrum's "Debate it" card.
 */
export function WordRelationCard({ index, data }: WordRelationCardProps) {
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  return (
    <HudPanel className="p-5">
      <HudLabel>
        {index + 1}. {data.word}
      </HudLabel>

      <ChoiceRow
        label={`Which word means the SAME as "${data.word}"?`}
        options={data.synonymOptions}
        correctIndex={data.correctSynonymIndex}
      />

      <ChoiceRow
        label={`Which word means the OPPOSITE of "${data.word}"?`}
        options={data.antonymOptions}
        correctIndex={data.correctAntonymIndex}
      />

      <div
        className="rounded-lg p-3"
        style={{
          border: `1px solid ${hex400}33`,
          backgroundColor: `${hex400}0f`,
        }}
      >
        <p
          className="mb-1 text-xs font-semibold uppercase tracking-wide"
          style={{
            color: `${shades[300]}cc`,
          }}
        >
          Debate it
        </p>

        <p
          className="text-sm"
          style={{
            color: `${shades[300]}e6`,
          }}
        >
          {data.debateQuestion}
        </p>
      </div>
    </HudPanel>
  );
}

"use client";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { HudPanel, HudLabel } from "./HudPanel";

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
  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-semibold text-cyan-100/90">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = i === correctIndex;
          const showState = selected !== null;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setSelected(i)}
              className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                showState && isCorrect
                  ? "border-cyan-400 bg-cyan-400/15 text-cyan-50"
                  : showState && isSelected
                    ? "border-red-400 bg-red-500/10 text-red-300"
                    : "border-cyan-400/15 text-cyan-100/80 hover:border-cyan-400/40 hover:bg-cyan-400/10"
              }`}
            >
              {option}
              {showState && isCorrect && (
                <CheckCircle2 className="h-3.5 w-3.5" />
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

/** One word: choose its synonym, choose its antonym, then a debate
 * question that compares the two -- combines Antonym Match's multiple-
 * choice interaction with Synonym Spectrum's "Debate it" card. */
export function WordRelationCard({ index, data }: WordRelationCardProps) {
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
      <div className="rounded-lg border border-violet-400/20 bg-violet-400/[0.06] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-300/80">
          Debate it
        </p>
        <p className="text-sm text-violet-100/90">{data.debateQuestion}</p>
      </div>
    </HudPanel>
  );
}

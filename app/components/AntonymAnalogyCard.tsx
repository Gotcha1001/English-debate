"use client";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { HudPanel } from "./HudPanel";

interface AntonymPairData {
  word: string;
  antonym: string;
}

interface AntonymAnalogyData {
  pairIndexA: number;
  pairIndexB: number;
  options: string[];
  correctIndex: number;
}

interface AntonymAnalogyCardProps {
  index: number;
  pairs: AntonymPairData[];
  data: AntonymAnalogyData;
}

/** One "A is to A' as B is to ___" analogy, same multiple-choice
 * select/reveal interaction as MultipleChoiceItem on the Free Talking
 * lesson page. */
export function AntonymAnalogyCard({
  index,
  pairs,
  data,
}: AntonymAnalogyCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const pairA = pairs[data.pairIndexA];
  const pairB = pairs[data.pairIndexB];
  return (
    <HudPanel className="p-4">
      <p className="mb-3 text-slate-800 dark:text-cyan-100/90">
        <span className="mr-2 text-slate-400 dark:text-cyan-200/40">
          {index + 1}.
        </span>
        <span className="font-semibold text-cyan-50">{pairA.word}</span> is to{" "}
        <span className="font-semibold text-cyan-50">{pairA.antonym}</span> as{" "}
        <span className="font-semibold text-cyan-50">{pairB.word}</span> is to
        ___
      </p>
      <div className="flex flex-col gap-1.5">
        {data.options.map((option, optIndex) => {
          const isSelected = selected === optIndex;
          const isCorrect = optIndex === data.correctIndex;
          const showState = selected !== null;
          return (
            <button
              key={optIndex}
              type="button"
              onClick={() => setSelected(optIndex)}
              className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-left text-sm transition-all duration-200 ${
                showState && isCorrect
                  ? "border-cyan-400 bg-cyan-400/15 text-cyan-50"
                  : showState && isSelected
                    ? "border-red-400 bg-red-500/10 text-red-300"
                    : "border-cyan-400/15 text-cyan-100/80 hover:border-cyan-400/40 hover:bg-cyan-400/10"
              }`}
            >
              <span>{option}</span>
              {showState && isCorrect && <CheckCircle2 className="h-4 w-4" />}
              {showState && isSelected && !isCorrect && (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </button>
          );
        })}
      </div>
    </HudPanel>
  );
}

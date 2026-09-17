"use client";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { HudPanel } from "./HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { theme } = useColorTheme();
  const { hex400 } = theme;
  const pairA = pairs[data.pairIndexA];
  const pairB = pairs[data.pairIndexB];

  return (
    <HudPanel className="p-4">
      <p className="mb-3 text-slate-800 dark:text-stone-100">
        <span className="mr-2 text-slate-400 dark:text-stone-500">
          {index + 1}.
        </span>
        <span className="font-semibold text-stone-50">{pairA.word}</span> is to{" "}
        <span className="font-semibold text-stone-50">{pairA.antonym}</span> as{" "}
        <span className="font-semibold text-stone-50">{pairB.word}</span> is to
        ___
      </p>
      <div className="flex flex-col gap-1.5">
        {data.options.map((option, optIndex) => {
          const isSelected = selected === optIndex;
          const isCorrect = optIndex === data.correctIndex;
          const showState = selected !== null;
          const isHovered = hoveredIndex === optIndex;

          const wrongSelected = showState && isSelected && !isCorrect;
          const revealedCorrect = showState && isCorrect;
          const defaultState = !revealedCorrect && !wrongSelected;

          return (
            <button
              key={optIndex}
              type="button"
              onClick={() => setSelected(optIndex)}
              onMouseEnter={() => setHoveredIndex(optIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-left text-sm transition-all duration-200 ${
                wrongSelected
                  ? "border-red-400 bg-red-500/10 text-red-300"
                  : defaultState
                    ? "text-stone-200/80"
                    : "text-stone-50"
              }`}
              style={
                revealedCorrect
                  ? {
                      borderColor: hex400,
                      backgroundColor: `${hex400}26`,
                      color: "#fafaf9",
                    }
                  : defaultState
                    ? {
                        borderColor: isHovered ? `${hex400}66` : `${hex400}26`,
                        backgroundColor: isHovered ? `${hex400}1a` : undefined,
                      }
                    : undefined
              }
            >
              <span>{option}</span>
              {revealedCorrect && <CheckCircle2 className="h-4 w-4" />}
              {wrongSelected && <XCircle className="h-4 w-4 text-red-400" />}
            </button>
          );
        })}
      </div>
    </HudPanel>
  );
}

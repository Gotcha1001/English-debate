"use client";
import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { HudPanel, HudLabel } from "./HudPanel";

interface AntonymPairData {
  word: string;
  antonym: string;
  exampleSentence: string;
}

interface AntonymMatchGameProps {
  pairs: AntonymPairData[];
}

function shuffleOnce<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(((i + 11) * 2654435761) % (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Tap-to-match game: pick one word on the left, one antonym on the right.
 * A correct pair locks green and both buttons disable; a wrong pair flashes
 * red for a moment, then both sides deselect so the learner can retry. */
export function AntonymMatchGame({ pairs }: AntonymMatchGameProps) {
  const leftItems = useMemo(
    () => shuffleOnce(pairs.map((p) => p.word)),
    [pairs],
  );
  const rightItems = useMemo(
    () => shuffleOnce(pairs.map((p) => p.antonym)),
    [pairs],
  );
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState<{
    left: string;
    right: string;
  } | null>(null);

  const isMatch = (word: string, antonym: string) =>
    pairs.some((p) => p.word === word && p.antonym === antonym);

  const attemptMatch = (left: string, right: string) => {
    if (isMatch(left, right)) {
      setMatched((prev) => new Set(prev).add(left));
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setWrongFlash({ left, right });
      setTimeout(() => {
        setWrongFlash(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  const handleLeftClick = (word: string) => {
    if (matched.has(word) || wrongFlash) return;
    if (selectedRight) {
      attemptMatch(word, selectedRight);
    } else {
      setSelectedLeft(word);
    }
  };

  const handleRightClick = (antonym: string) => {
    const alreadyMatched = pairs.some(
      (p) => p.antonym === antonym && matched.has(p.word),
    );
    if (alreadyMatched || wrongFlash) return;
    if (selectedLeft) {
      attemptMatch(selectedLeft, antonym);
    } else {
      setSelectedRight(antonym);
    }
  };

  const allMatched = matched.size === pairs.length;

  return (
    <HudPanel className="p-5">
      <HudLabel>Match the Opposites</HudLabel>
      <p className="mb-4 text-sm text-cyan-200/60">
        Tap a word, then tap its opposite. {matched.size}/{pairs.length}{" "}
        matched.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {leftItems.map((word) => {
            const isDone = matched.has(word);
            const isSelected = selectedLeft === word;
            const isWrong = wrongFlash?.left === word;
            return (
              <button
                key={word}
                type="button"
                disabled={isDone}
                onClick={() => handleLeftClick(word)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  isDone
                    ? "border-cyan-400/30 bg-cyan-400/5 text-cyan-400/50"
                    : isWrong
                      ? "border-red-400 bg-red-500/10 text-red-300"
                      : isSelected
                        ? "border-cyan-400 bg-cyan-400/15 text-cyan-50"
                        : "border-cyan-400/15 text-cyan-100/80 hover:border-cyan-400/40 hover:bg-cyan-400/10"
                }`}
              >
                {word}
                {isDone && (
                  <CheckCircle2 className="ml-1.5 inline h-3.5 w-3.5" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {rightItems.map((antonym) => {
            const isDone = pairs.some(
              (p) => p.antonym === antonym && matched.has(p.word),
            );
            const isSelected = selectedRight === antonym;
            const isWrong = wrongFlash?.right === antonym;
            return (
              <button
                key={antonym}
                type="button"
                disabled={isDone}
                onClick={() => handleRightClick(antonym)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  isDone
                    ? "border-cyan-400/30 bg-cyan-400/5 text-cyan-400/50"
                    : isWrong
                      ? "border-red-400 bg-red-500/10 text-red-300"
                      : isSelected
                        ? "border-cyan-400 bg-cyan-400/15 text-cyan-50"
                        : "border-cyan-400/15 text-cyan-100/80 hover:border-cyan-400/40 hover:bg-cyan-400/10"
                }`}
              >
                {antonym}
                {isDone && (
                  <CheckCircle2 className="ml-1.5 inline h-3.5 w-3.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      {allMatched && (
        <div className="mt-5 space-y-2">
          <p className="text-sm font-semibold text-cyan-300">
            All matched! Here&apos;s each pair in context:
          </p>
          {pairs.map((p, i) => (
            <p
              key={i}
              className="rounded-lg border border-cyan-400/10 bg-[#0a1219] p-2.5 text-sm text-cyan-100/80"
            >
              {p.exampleSentence}
            </p>
          ))}
        </div>
      )}
    </HudPanel>
  );
}

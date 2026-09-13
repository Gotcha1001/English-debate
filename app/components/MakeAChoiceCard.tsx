"use client";
import { useState } from "react";
import { HudPanel, HudLabel } from "./HudPanel";

interface ChoicePair {
  optionA: string;
  optionB: string;
}

interface MakeAChoiceCardProps {
  prompt: string;
  pairs: ChoicePair[];
}

/** "Make a Choice" section: pick one of two options per row, then say why
 * out loud -- same no-correct-answer interaction as SituationCard on the
 * Life Situations page. */
export function MakeAChoiceCard({ prompt, pairs }: MakeAChoiceCardProps) {
  const [picked, setPicked] = useState<Record<number, "A" | "B">>({});
  return (
    <HudPanel className="p-5">
      <HudLabel>Make a Choice</HudLabel>
      <p className="mb-4 text-sm text-cyan-200/60">
        Choose 1 out of the 2 choices and give a reason behind your choice.
      </p>
      <p className="mb-3 font-semibold text-cyan-50">{prompt}</p>
      <div className="space-y-2">
        {pairs.map((pair, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            {(["A", "B"] as const).map((side) => {
              const label = side === "A" ? pair.optionA : pair.optionB;
              const isPicked = picked[i] === side;
              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => setPicked((p) => ({ ...p, [i]: side }))}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isPicked
                      ? "border-cyan-400 bg-cyan-400/15 text-cyan-50 shadow-[0_0_20px_-4px_rgba(34,211,238,0.5)]"
                      : "border-cyan-400/15 text-cyan-100/80 hover:border-cyan-400/40 hover:bg-cyan-400/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {Object.keys(picked).length > 0 && (
        <p className="mt-3 text-xs text-cyan-200/50">
          Now say why out loud -- there&apos;s no right answer here.
        </p>
      )}
    </HudPanel>
  );
}

"use client";
import { useState } from "react";
import { HudPanel, HudLabel } from "./HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

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
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const [picked, setPicked] = useState<Record<number, "A" | "B">>({});
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <HudPanel className="p-5">
      <HudLabel>Make a Choice</HudLabel>
      <p className="mb-4 text-sm text-stone-400">
        Choose 1 out of the 2 choices and give a reason behind your choice.
      </p>
      <p className="mb-3 font-semibold text-stone-50">{prompt}</p>
      <div className="space-y-2">
        {pairs.map((pair, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            {(["A", "B"] as const).map((side) => {
              const label = side === "A" ? pair.optionA : pair.optionB;
              const isPicked = picked[i] === side;
              const key = `${i}-${side}`;
              const isHovered = hovered === key;
              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => setPicked((p) => ({ ...p, [i]: side }))}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  className="rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200"
                  style={
                    isPicked
                      ? {
                          borderColor: hex400,
                          backgroundColor: `${hex400}26`,
                          color: "#fafaf9",
                          boxShadow: `0 0 20px -4px ${hex400}80`,
                        }
                      : {
                          borderColor: isHovered
                            ? `${hex400}66`
                            : `${hex400}26`,
                          backgroundColor: isHovered
                            ? `${hex400}1a`
                            : "transparent",
                          color: `${shades[300]}cc`,
                        }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {Object.keys(picked).length > 0 && (
        <p className="mt-3 text-xs text-stone-500">
          Now say why out loud -- there&apos;s no right answer here.
        </p>
      )}
    </HudPanel>
  );
}

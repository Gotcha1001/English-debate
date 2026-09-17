"use client";

import { useState } from "react";
import { HudPanel, HudLabel } from "./HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

interface WhereYouStandCardProps {
  scaleLabels: string[]; // exactly 5, one extreme to the other
  questions: string[];
}

const SCALE_COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#facc15", // yellow-400
  "#84cc16", // lime-500
  "#10b981", // emerald-500
];

/**
 * "Where Do You Stand?" section: a 5-point scale (colored red -> green,
 * top to bottom) plus discussion questions the learner answers by placing
 * themselves on it -- purely a discussion prompt, nothing to submit.
 */
export function WhereYouStandCard({
  scaleLabels,
  questions,
}: WhereYouStandCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  return (
    <HudPanel className="p-5">
      <HudLabel>Where Do You Stand?</HudLabel>

      <p className="mb-4 text-sm text-stone-200/60">
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
              className={`h-8 w-8 shrink-0 transition-opacity ${
                selected === null || selected === i
                  ? "opacity-100"
                  : "opacity-30"
              }`}
              style={{
                backgroundColor: SCALE_COLORS[i] ?? "#64748b",
              }}
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
                  ? "font-semibold text-stone-50"
                  : "text-stone-200/60"
              }`}
              style={
                selected === i
                  ? undefined
                  : {
                      color: `${shades[300]}99`,
                    }
              }
            >
              &ldquo;{label}&rdquo;
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-lg bg-[#0a1219] p-3"
        style={{
          border: `1px solid ${hex400}1a`,
        }}
      >
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-wide"
          style={{
            color: `${shades[300]}b3`,
          }}
        >
          Questions
        </p>

        <ol className="space-y-2">
          {questions.map((q, i) => (
            <li key={i} className="text-sm text-stone-100/90">
              <span className="mr-1.5 font-semibold" style={{ color: hex400 }}>
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

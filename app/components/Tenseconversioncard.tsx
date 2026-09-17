"use client";

import { useState } from "react";
import { HudPanel, HudLabel } from "./HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

export interface TenseConversionSentenceData {
  sentence: string;
  fromTense: string;
  toTense: string;
  answer: string;
}

interface TenseConversionCardProps {
  index: number;
  data: TenseConversionSentenceData;
}

/** One "convert this sentence into a different tense" exercise: the
 * original sentence + from/to tense labels, an optional scratch area for
 * the learner's own attempt, and a tap-to-reveal answer -- same
 * self-check interaction as the Grammar Breakdown quiz. */
export function TenseConversionCard({ index, data }: TenseConversionCardProps) {
  const [attempt, setAttempt] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  return (
    <HudPanel className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span
          className="rounded-full border px-2.5 py-1 font-semibold"
          style={{
            borderColor: `${hex400}66`,
            backgroundColor: `${hex400}1a`,
            color: shades[300],
          }}
        >
          {data.fromTense}
        </span>
        <span className="text-stone-500">→</span>
        <span className="rounded-full border border-violet-400/40 bg-violet-400/10 px-2.5 py-1 font-semibold text-violet-200">
          {data.toTense}
        </span>
      </div>

      <p className="mb-4 text-lg text-stone-50">
        <span className="mr-2" style={{ color: `${hex400}99` }}>
          {index + 1}.
        </span>
        {data.sentence}
      </p>

      <HudLabel>Your attempt (optional)</HudLabel>
      <textarea
        value={attempt}
        onChange={(e) => setAttempt(e.target.value)}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        placeholder={`Rewrite it in ${data.toTense}...`}
        rows={2}
        className="mb-3 w-full resize-none rounded-lg bg-[#0a1219] px-3 py-2 text-sm text-stone-50 outline-none transition"
        style={{
          border: `1px solid ${hex400}33`,
          boxShadow: inputFocused ? `0 0 0 2px ${hex400}33` : "none",
          borderColor: inputFocused ? hex400 : `${hex400}33`,
        }}
      />

      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="text-xs font-medium hover:underline"
        style={{ color: hex400 }}
      >
        {revealed ? "Hide answer" : "Show answer"}
      </button>

      {revealed && (
        <div
          className="mt-3 rounded-lg bg-[#0a1219] p-3"
          style={{ border: `1px solid ${hex400}1a` }}
        >
          <p className="text-sm font-medium text-stone-50">{data.answer}</p>
          <p className="mt-2 text-xs text-stone-500">
            There&apos;s often more than one correct way to say it -- check that
            your verb form matches {data.toTense}, not the exact wording.
          </p>
        </div>
      )}
    </HudPanel>
  );
}

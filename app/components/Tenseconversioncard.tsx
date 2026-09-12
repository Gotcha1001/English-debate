"use client";

import { useState } from "react";
import { HudPanel, HudLabel } from "./HudPanel";

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

  return (
    <HudPanel className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 font-semibold text-cyan-200">
          {data.fromTense}
        </span>
        <span className="text-cyan-200/40">→</span>
        <span className="rounded-full border border-violet-400/40 bg-violet-400/10 px-2.5 py-1 font-semibold text-violet-200">
          {data.toTense}
        </span>
      </div>

      <p className="mb-4 text-lg text-cyan-50">
        <span className="mr-2 text-cyan-500/60">{index + 1}.</span>
        {data.sentence}
      </p>

      <HudLabel>Your attempt (optional)</HudLabel>
      <textarea
        value={attempt}
        onChange={(e) => setAttempt(e.target.value)}
        placeholder={`Rewrite it in ${data.toTense}...`}
        rows={2}
        className="mb-3 w-full resize-none rounded-lg border border-cyan-400/20 bg-[#0a1219] px-3 py-2 text-sm text-cyan-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      />

      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="text-xs font-medium text-cyan-400 hover:underline"
      >
        {revealed ? "Hide answer" : "Show answer"}
      </button>

      {revealed && (
        <div className="mt-3 rounded-lg border border-cyan-400/10 bg-[#0a1219] p-3">
          <p className="text-sm font-medium text-cyan-50">{data.answer}</p>
          <p className="mt-2 text-xs text-cyan-200/50">
            There&apos;s often more than one correct way to say it -- check that
            your verb form matches {data.toTense}, not the exact wording.
          </p>
        </div>
      )}
    </HudPanel>
  );
}

"use client";

import { useState } from "react";
import { HudPanel } from "./HudPanel";

export type PartOfSpeech =
  | "noun"
  | "pronoun"
  | "verb"
  | "adjective"
  | "adverb"
  | "article"
  | "preposition"
  | "conjunction"
  | "interjection";

export interface GrammarToken {
  word: string;
  partOfSpeech: PartOfSpeech;
}

export interface GrammarQuizQuestion {
  question: string;
  answer: string;
}

interface GrammarSentenceCardProps {
  index: number;
  sentence: string;
  tokens: GrammarToken[];
  quiz: GrammarQuizQuestion[];
}

/** One style + short abbreviation per part of speech, shared by the
 * token chips and the legend so the two always stay in sync. */
export const POS_STYLES: Record<
  PartOfSpeech,
  { label: string; className: string }
> = {
  noun: {
    label: "n.",
    className: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  },
  pronoun: {
    label: "pron.",
    className: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  },
  verb: {
    label: "v.",
    className: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  },
  adjective: {
    label: "adj.",
    className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  },
  adverb: {
    label: "adv.",
    className: "border-violet-400/40 bg-violet-400/10 text-violet-200",
  },
  article: {
    label: "art.",
    className: "border-slate-400/40 bg-slate-400/10 text-slate-300",
  },
  preposition: {
    label: "prep.",
    className: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  },
  conjunction: {
    label: "conj.",
    className: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200",
  },
  interjection: {
    label: "interj.",
    className: "border-orange-400/40 bg-orange-400/10 text-orange-200",
  },
};

/** Compact color key, shown once above the list of sentence cards. */
export function PartOfSpeechLegend() {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {(Object.keys(POS_STYLES) as PartOfSpeech[]).map((pos) => (
        <span
          key={pos}
          className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${POS_STYLES[pos].className}`}
        >
          {POS_STYLES[pos].label} {pos}
        </span>
      ))}
    </div>
  );
}

/** Single quiz question with a tap-to-reveal answer, same interaction
 * as the ComprehensionItem reveal pattern used on the lessons page. */
function QuizQuestion({
  index,
  question,
  answer,
}: {
  index: number;
  question: string;
  answer: string;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <li className="rounded-lg border border-cyan-400/10 bg-[#0a1219] p-3">
      <p className="text-sm text-cyan-100/90">
        <span className="mr-2 text-cyan-200/40">{index + 1}.</span>
        {question}
      </p>
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="mt-2 text-xs font-medium text-cyan-400 hover:underline"
      >
        {revealed ? "Hide answer" : "Show answer"}
      </button>
      {revealed && (
        <p className="mt-1 text-sm font-medium text-cyan-50">{answer}</p>
      )}
    </li>
  );
}

/** One generated sentence: the sentence itself, its word-by-word
 * part-of-speech chips, and its 5-question reveal quiz. */
export function GrammarSentenceCard({
  index,
  sentence,
  tokens,
  quiz,
}: GrammarSentenceCardProps) {
  return (
    <HudPanel className="p-5">
      <p className="mb-4 text-lg text-cyan-50">
        <span className="mr-2 text-cyan-500/60">{index + 1}.</span>
        {sentence}
      </p>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {tokens.map((token, i) => {
          const style = POS_STYLES[token.partOfSpeech];
          return (
            <span
              key={i}
              title={token.partOfSpeech}
              className={`inline-flex flex-col items-center rounded-md border px-2 py-1 text-xs leading-tight ${style.className}`}
            >
              <span className="font-medium">{token.word}</span>
              <span className="text-[10px] opacity-70">{style.label}</span>
            </span>
          );
        })}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300/70">
          Quiz
        </p>
        <ul className="space-y-2">
          {quiz.map((q, i) => (
            <QuizQuestion
              key={i}
              index={i}
              question={q.question}
              answer={q.answer}
            />
          ))}
        </ul>
      </div>
    </HudPanel>
  );
}

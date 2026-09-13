"use client";
import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { HudPanel, HudLabel } from "./HudPanel";

interface SynonymGroupData {
  concept: string;
  spectrumLabel: string;
  words: string[]; // correct order, from the server
  connotationNote: string;
  fillBlankSentence: string;
  correctWordIndex: number;
  debateQuestion: string;
}

interface SynonymSpectrumCardProps {
  index: number;
  data: SynonymGroupData;
}

// Deterministic shuffle so it doesn't re-shuffle on every re-render.
function shuffleOnce<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(((i + 7) * 2654435761) % (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** One synonym group: (1) tap-to-order the spectrum with a reveal check,
 * (2) a fill-in-the-blank best-fit multiple choice, (3) a debate question
 * to hand off to speaking practice. All three share one card per group. */
export function SynonymSpectrumCard({ index, data }: SynonymSpectrumCardProps) {
  const shuffledWords = useMemo(() => shuffleOnce(data.words), [data.words]);
  const [order, setOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [pickedFit, setPickedFit] = useState<number | null>(null);

  const remaining = shuffledWords.filter((w) => !order.includes(w));

  const toggleWord = (word: string) => {
    if (checked) return;
    setOrder((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );
  };

  const reset = () => {
    setOrder([]);
    setChecked(false);
  };

  return (
    <HudPanel className="p-5">
      <HudLabel>
        {index + 1}. {data.concept}
      </HudLabel>
      <p className="mb-4 text-xs text-cyan-200/50">{data.spectrumLabel}</p>

      {/* --- Order the Spectrum --- */}
      <p className="mb-2 text-sm font-semibold text-cyan-100/90">
        Tap the words in order, from &ldquo;
        {data.spectrumLabel.split("->")[0]?.trim()}&rdquo; to &ldquo;
        {data.spectrumLabel.split("->")[1]?.trim() ?? "the other end"}&rdquo;
      </p>
      <div className="mb-2 flex min-h-[2.75rem] flex-wrap gap-2 rounded-lg border border-dashed border-cyan-400/20 bg-[#0a1219] p-2">
        {order.length === 0 && (
          <span className="px-1 py-1 text-xs text-cyan-200/30">
            Tap words below to build your order...
          </span>
        )}
        {order.map((word, i) => {
          const isCorrectSpot = checked && data.words[i] === word;
          return (
            <button
              key={word}
              type="button"
              onClick={() => toggleWord(word)}
              className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm font-medium ${
                checked
                  ? isCorrectSpot
                    ? "border-cyan-400 bg-cyan-400/15 text-cyan-50"
                    : "border-red-400 bg-red-500/10 text-red-300"
                  : "border-cyan-400/40 bg-cyan-400/10 text-cyan-50"
              }`}
            >
              {i + 1}. {word}
              {checked &&
                (isCorrectSpot ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                ))}
            </button>
          );
        })}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {remaining.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => toggleWord(word)}
            className="rounded-md border border-cyan-400/15 px-2.5 py-1.5 text-sm text-cyan-100/80 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
          >
            {word}
          </button>
        ))}
      </div>
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          disabled={order.length !== data.words.length}
          onClick={() => setChecked(true)}
          className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-[#04070a] transition hover:bg-cyan-400 disabled:opacity-40"
        >
          Check order
        </button>
        {checked && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs text-cyan-200/50 hover:text-cyan-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </button>
        )}
        {checked && (
          <span className="text-xs text-cyan-200/50">
            Correct order: {data.words.join(" -> ")}
          </span>
        )}
      </div>
      {checked && (
        <p className="mb-5 rounded-lg border border-cyan-400/10 bg-[#0a1219] p-3 text-sm text-cyan-100/80">
          {data.connotationNote}
        </p>
      )}

      {/* --- Pick the Best Fit --- */}
      <p className="mb-2 text-sm font-semibold text-cyan-100/90">
        Which word fits best?
      </p>
      <p className="mb-3 rounded-lg border border-cyan-400/10 bg-[#0a1219] p-3 text-cyan-50">
        {data.fillBlankSentence}
      </p>
      <div className="mb-5 flex flex-wrap gap-2">
        {data.words.map((word, i) => {
          const isPicked = pickedFit === i;
          const isCorrect = i === data.correctWordIndex;
          const showState = pickedFit !== null;
          return (
            <button
              key={word}
              type="button"
              onClick={() => setPickedFit(i)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                showState && isCorrect
                  ? "border-cyan-400 bg-cyan-400/15 text-cyan-50"
                  : showState && isPicked
                    ? "border-red-400 bg-red-500/10 text-red-300"
                    : "border-cyan-400/15 text-cyan-100/80 hover:border-cyan-400/40 hover:bg-cyan-400/10"
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* --- Debate it --- */}
      <div className="rounded-lg border border-violet-400/20 bg-violet-400/[0.06] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-300/80">
          Debate it
        </p>
        <p className="text-sm text-violet-100/90">{data.debateQuestion}</p>
      </div>
    </HudPanel>
  );
}

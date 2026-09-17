"use client";
import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { HudPanel, HudLabel } from "./HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

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
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const shuffledWords = useMemo(() => shuffleOnce(data.words), [data.words]);
  const [order, setOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [pickedFit, setPickedFit] = useState<number | null>(null);
  const [hoveredRemaining, setHoveredRemaining] = useState<string | null>(null);
  const [checkHovered, setCheckHovered] = useState(false);
  const [tryAgainHovered, setTryAgainHovered] = useState(false);
  const [hoveredFit, setHoveredFit] = useState<number | null>(null);

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
      <p className="mb-4 text-xs text-stone-500">{data.spectrumLabel}</p>

      {/* --- Order the Spectrum --- */}
      <p className="mb-2 text-sm font-semibold text-stone-100">
        Tap the words in order, from &ldquo;
        {data.spectrumLabel.split("->")[0]?.trim()}&rdquo; to &ldquo;
        {data.spectrumLabel.split("->")[1]?.trim() ?? "the other end"}&rdquo;
      </p>
      <div
        className="mb-2 flex min-h-[2.75rem] flex-wrap gap-2 rounded-lg bg-[#0a1219] p-2"
        style={{ border: `1px dashed ${hex400}33` }}
      >
        {order.length === 0 && (
          <span
            className="px-1 py-1 text-xs"
            style={{ color: `${shades[300]}4d` }}
          >
            Tap words below to build your order...
          </span>
        )}
        {order.map((word, i) => {
          const isCorrectSpot = checked && data.words[i] === word;
          const chipStyle = checked
            ? isCorrectSpot
              ? {
                  borderColor: hex400,
                  backgroundColor: `${hex400}26`,
                  color: "#fafaf9",
                }
              : {}
            : {
                borderColor: `${hex400}66`,
                backgroundColor: `${hex400}1a`,
                color: "#fafaf9",
              };
          return (
            <button
              key={word}
              type="button"
              onClick={() => toggleWord(word)}
              className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm font-medium ${
                checked && !isCorrectSpot
                  ? "border-red-400 bg-red-500/10 text-red-300"
                  : ""
              }`}
              style={chipStyle}
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
        {remaining.map((word) => {
          const isHovered = hoveredRemaining === word;
          return (
            <button
              key={word}
              type="button"
              onClick={() => toggleWord(word)}
              onMouseEnter={() => setHoveredRemaining(word)}
              onMouseLeave={() => setHoveredRemaining(null)}
              className="rounded-md border px-2.5 py-1.5 text-sm transition"
              style={{
                borderColor: isHovered ? `${hex400}66` : `${hex400}26`,
                backgroundColor: isHovered ? `${hex400}1a` : "transparent",
                color: `${shades[300]}cc`,
              }}
            >
              {word}
            </button>
          );
        })}
      </div>
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          disabled={order.length !== data.words.length}
          onClick={() => setChecked(true)}
          onMouseEnter={() => setCheckHovered(true)}
          onMouseLeave={() => setCheckHovered(false)}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#04070a] transition disabled:opacity-40"
          style={{ backgroundColor: checkHovered ? hex400 : shades[500] }}
        >
          Check order
        </button>
        {checked && (
          <button
            type="button"
            onClick={reset}
            onMouseEnter={() => setTryAgainHovered(true)}
            onMouseLeave={() => setTryAgainHovered(false)}
            className="inline-flex items-center gap-1 text-xs"
            style={{
              color: tryAgainHovered ? shades[300] : `${shades[300]}80`,
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </button>
        )}
        {checked && (
          <span className="text-xs text-stone-500">
            Correct order: {data.words.join(" -> ")}
          </span>
        )}
      </div>
      {checked && (
        <p
          className="mb-5 rounded-lg bg-[#0a1219] p-3 text-sm text-stone-300"
          style={{ border: `1px solid ${hex400}1a` }}
        >
          {data.connotationNote}
        </p>
      )}

      {/* --- Pick the Best Fit --- */}
      <p className="mb-2 text-sm font-semibold text-stone-100">
        Which word fits best?
      </p>
      <p
        className="mb-3 rounded-lg bg-[#0a1219] p-3 text-stone-50"
        style={{ border: `1px solid ${hex400}1a` }}
      >
        {data.fillBlankSentence}
      </p>
      <div className="mb-5 flex flex-wrap gap-2">
        {data.words.map((word, i) => {
          const isPicked = pickedFit === i;
          const isCorrect = i === data.correctWordIndex;
          const showState = pickedFit !== null;
          const isHovered = hoveredFit === i;

          let fitStyle: React.CSSProperties = {};
          let fitClassName =
            "rounded-md border px-3 py-1.5 text-sm font-medium transition";

          if (showState && isCorrect) {
            fitStyle = {
              borderColor: hex400,
              backgroundColor: `${hex400}26`,
              color: "#fafaf9",
            };
          } else if (showState && isPicked) {
            fitClassName += " border-red-400 bg-red-500/10 text-red-300";
          } else {
            fitStyle = {
              borderColor: isHovered ? `${hex400}66` : `${hex400}26`,
              backgroundColor: isHovered ? `${hex400}1a` : "transparent",
              color: `${shades[300]}cc`,
            };
          }

          return (
            <button
              key={word}
              type="button"
              onClick={() => setPickedFit(i)}
              onMouseEnter={() => setHoveredFit(i)}
              onMouseLeave={() => setHoveredFit(null)}
              className={fitClassName}
              style={fitStyle}
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

"use client";

import { Pause, Square, Volume2 } from "lucide-react";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

/**
 * Drop this next to any block of lesson text to let the learner hear it
 * read aloud — useful for pronunciation practice. Self-contained: reads
 * `text` on click, no props beyond that are required.
 */
export function ReadAloudButton({
  text,
  label = "Listen",
}: {
  text: string;
  label?: string;
}) {
  const { theme } = useColorTheme();
  const { hex400 } = theme;
  const { status, rate, setRate, speak, pause, stop } = useTextToSpeech();

  if (status === "unsupported") return null;

  const isPlaying = status === "playing";
  const isPaused = status === "paused";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => (isPlaying ? pause() : speak(text))}
        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200"
        style={{
          borderColor: `${hex400}4d`,
          color: hex400,
          backgroundColor: `${hex400}0d`,
        }}
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
        {isPlaying ? "Pause" : isPaused ? "Resume" : label}
      </button>

      {(isPlaying || isPaused) && (
        <button
          type="button"
          onClick={stop}
          className="flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-stone-400"
          style={{ borderColor: `${hex400}26` }}
        >
          <Square className="h-3 w-3" />
          Stop
        </button>
      )}

      <select
        value={rate}
        onChange={(e) => setRate(Number(e.target.value))}
        className="rounded-full border bg-transparent px-2 py-1 text-xs text-slate-600 dark:text-stone-300"
        style={{ borderColor: `${hex400}26` }}
        aria-label="Reading speed"
      >
        <option value={0.65}>Slow</option>
        <option value={0.85}>Normal</option>
        <option value={1}>Fast</option>
      </select>
    </div>
  );
}

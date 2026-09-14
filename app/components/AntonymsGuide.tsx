"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HudPanel, HudLabel } from "./HudPanel";

interface AntonymPairEntry {
  word: string;
  opposite: string;
  example: string; // one sentence that uses both words to show the contrast
  swatch: string; // border/bg/text classes, kept in one place per pair
}

// A small, varied sample -- not tied to any generated set, just enough to
// show what a clean antonym pair (and the contrast it creates) looks like.
const ANTONYM_GUIDE: AntonymPairEntry[] = [
  {
    word: "Generous",
    opposite: "Stingy",
    example:
      "He's generous with his time but stingy with compliments -- you'll wait a long time to hear \"good job.\"",
    swatch: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  },
  {
    word: "Transparent",
    opposite: "Secretive",
    example:
      "The old manager was secretive about the budget; the new one is completely transparent about it.",
    swatch: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  },
  {
    word: "Cautious",
    opposite: "Reckless",
    example:
      "She's cautious with money and invests slowly, while her brother is reckless and bets on anything.",
    swatch: "border-violet-400/40 bg-violet-400/10 text-violet-200",
  },
];

interface AntonymsGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Static "what is an antonym" reference, opened from the Antonyms page.
 * No AI call -- this is a fixed teaching panel, not generated content. */
export function AntonymsGuide({ open, onOpenChange }: AntonymsGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] overflow-y-auto border border-cyan-400/25 bg-[#04070a] p-0 shadow-[0_0_60px_-12px_rgba(34,211,238,0.5)] sm:max-w-2xl scrollbar-hide"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-400/10 bg-[#04070a]/95 px-6 py-4 backdrop-blur">
          <DialogTitle className="text-xl font-bold text-cyan-50">
            What is an antonym?
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="rounded-md border border-transparent p-1.5 text-cyan-200/50 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-6 pt-4">
          <p className="text-sm text-cyan-200/60">
            An antonym is a word that means the opposite of another word.
            Learning words in opposite pairs -- rather than alone -- makes both
            words easier to remember and easier to use precisely, since each one
            sharpens what the other doesn&apos;t mean.
          </p>
          {ANTONYM_GUIDE.map((entry) => (
            <HudPanel key={entry.word} className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${entry.swatch}`}
                >
                  {entry.word}
                </span>
                <span className="text-cyan-200/30">&harr;</span>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${entry.swatch}`}
                >
                  {entry.opposite}
                </span>
              </div>
              <HudLabel>In a sentence</HudLabel>
              <p className="text-base font-medium text-cyan-50">
                {entry.example}
              </p>
            </HudPanel>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

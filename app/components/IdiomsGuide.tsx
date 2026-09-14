"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HudPanel, HudLabel } from "./HudPanel";

interface IdiomGuideEntry {
  idiom: string;
  meaning: string;
  example: string;
  swatch: string; // border/bg/text classes, kept in one place per idiom
}

// A small, varied sample -- not tied to any generated set, just enough to
// show what "figurative, not literal" actually looks like in practice.
const IDIOM_GUIDE: IdiomGuideEntry[] = [
  {
    idiom: "Break the ice",
    meaning:
      "To say or do something that eases tension and helps people feel more comfortable, usually when meeting for the first time.",
    example: "She told a joke to break the ice at the start of the meeting.",
    swatch: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  },
  {
    idiom: "Under the weather",
    meaning: "Feeling slightly ill -- not seriously sick, just off.",
    example: "I'm feeling a bit under the weather, so I'll skip the gym today.",
    swatch: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  },
  {
    idiom: "Piece of cake",
    meaning: "Something that is very easy to do.",
    example: "Don't worry about the test -- it's a piece of cake.",
    swatch: "border-violet-400/40 bg-violet-400/10 text-violet-200",
  },
];

interface IdiomsGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Static "what is an idiom" reference, opened from the Idioms page.
 * No AI call -- this is a fixed teaching panel, not generated content. */
export function IdiomsGuide({ open, onOpenChange }: IdiomsGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] overflow-y-auto border border-cyan-400/25 bg-[#04070a] p-0 shadow-[0_0_60px_-12px_rgba(34,211,238,0.5)] sm:max-w-2xl scrollbar-hide"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-400/10 bg-[#04070a]/95 px-6 py-4 backdrop-blur">
          <DialogTitle className="text-xl font-bold text-cyan-50">
            What is an idiom?
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
            An idiom is a phrase whose meaning isn&apos;t literal &mdash; you
            can&apos;t guess it just by knowing each word. Native speakers use
            them constantly, so it&apos;s worth learning the meaning as a whole
            phrase, not word by word.
          </p>
          {IDIOM_GUIDE.map((entry) => (
            <HudPanel key={entry.idiom} className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${entry.swatch}`}
                >
                  {entry.idiom}
                </span>
              </div>
              <HudLabel>Meaning</HudLabel>
              <p className="mb-3 text-sm text-cyan-100/90">{entry.meaning}</p>
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

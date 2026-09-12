"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HudPanel, HudLabel } from "./HudPanel";

interface TenseGuideEntry {
  tense: string;
  usedFor: string;
  structure: string;
  example: string;
  swatch: string; // border/bg/text classes, kept in one place per tense
}

// Same base idea ("I walk to school") carried through every tense so the
// only thing that changes is the tense itself -- makes the pattern obvious.
const TENSE_GUIDE: TenseGuideEntry[] = [
  {
    tense: "Present Simple",
    usedFor: "Habits, routines, and general facts",
    structure: "I + base verb  (add -s for he / she / it)",
    example: "I walk to school every day.",
    swatch: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  },
  {
    tense: "Past Simple",
    usedFor: "A finished action at a specific point in the past",
    structure: "I + past form of the verb  (regular verbs: base + -ed)",
    example: "I walked to school yesterday.",
    swatch: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  },
  {
    tense: "Past Continuous",
    usedFor: "An action in progress in the past, often interrupted",
    structure: "I + was + verb-ing",
    example: "I was walking to school when it started to rain.",
    swatch: "border-violet-400/40 bg-violet-400/10 text-violet-200",
  },
  {
    tense: "Present Perfect",
    usedFor: "A past action that still matters now, or hasn't finished",
    structure: "I + have + past participle",
    example: "I have walked to school every day this month.",
    swatch: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  },
  {
    tense: "Future Simple",
    usedFor: "A prediction, decision, or fact about the future",
    structure: "I + will + base verb",
    example: "I will walk to school tomorrow.",
    swatch: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  },
];

interface TensesGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Static "how the tenses work" reference, opened from the Tenses page.
 * No AI call -- this is a fixed teaching panel, not generated content. */
export function TensesGuide({ open, onOpenChange }: TensesGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] overflow-y-auto border border-cyan-400/25 bg-[#04070a] p-0 shadow-[0_0_60px_-12px_rgba(34,211,238,0.5)] sm:max-w-2xl scrollbar-hide"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-400/10 bg-[#04070a]/95 px-6 py-4 backdrop-blur">
          <DialogTitle className="text-xl font-bold text-cyan-50">
            How the tenses work
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
            Same sentence, five tenses. Watch what changes each time -- usually
            just the verb, and sometimes a helper word.
          </p>

          {TENSE_GUIDE.map((entry) => (
            <HudPanel key={entry.tense} className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${entry.swatch}`}
                >
                  {entry.tense}
                </span>
                <span className="text-xs text-cyan-200/50">
                  {entry.usedFor}
                </span>
              </div>

              <HudLabel>Structure</HudLabel>
              <p className="mb-3 font-mono text-sm text-cyan-100/90">
                {entry.structure}
              </p>

              <HudLabel>Example</HudLabel>
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

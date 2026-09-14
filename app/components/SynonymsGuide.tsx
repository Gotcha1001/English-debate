"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HudPanel, HudLabel } from "./HudPanel";

interface SynonymSpectrumEntry {
  concept: string;
  words: string[]; // exactly 5, mild -> intense
  note: string; // one-line insight on why the order/word choice matters
  swatch: string; // border/bg/text classes, kept in one place per concept
}

// A small, varied sample -- not tied to any generated set, just enough to
// show what "ordered by intensity" actually looks like in practice.
const SYNONYM_GUIDE: SynonymSpectrumEntry[] = [
  {
    concept: "Happy",
    words: ["Content", "Happy", "Delighted", "Thrilled", "Ecstatic"],
    note: '"Content" is quiet and settled; "ecstatic" is loud and can\'t-sit-still. Same feeling, very different volume.',
    swatch: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  },
  {
    concept: "Angry",
    words: ["Annoyed", "Irritated", "Angry", "Furious", "Enraged"],
    note: 'Calling your boss "furious" instead of "annoyed" changes how serious the situation sounds -- word choice sets the stakes.',
    swatch: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  },
  {
    concept: "Tired",
    words: ["Sleepy", "Tired", "Weary", "Exhausted", "Drained"],
    note: '"Sleepy" just needs a nap; "drained" suggests something took more out of you than a late night usually would.',
    swatch: "border-violet-400/40 bg-violet-400/10 text-violet-200",
  },
];

interface SynonymsGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Static "what is a synonym spectrum" reference, opened from the Synonyms
 * page. No AI call -- this is a fixed teaching panel, not generated content. */
export function SynonymsGuide({ open, onOpenChange }: SynonymsGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] overflow-y-auto border border-cyan-400/25 bg-[#04070a] p-0 shadow-[0_0_60px_-12px_rgba(34,211,238,0.5)] sm:max-w-2xl scrollbar-hide"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-400/10 bg-[#04070a]/95 px-6 py-4 backdrop-blur">
          <DialogTitle className="text-xl font-bold text-cyan-50">
            What is a synonym spectrum?
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
            Near-synonyms rarely mean exactly the same thing. Lining them up
            from mild to intense shows how swapping one word for another changes
            the strength of what you&apos;re saying, even when the dictionary
            definition is almost identical.
          </p>
          {SYNONYM_GUIDE.map((entry) => (
            <HudPanel key={entry.concept} className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${entry.swatch}`}
                >
                  {entry.concept}
                </span>
              </div>
              <HudLabel>Mild &rarr; intense</HudLabel>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {entry.words.map((word, i) => (
                  <span key={word} className="flex items-center gap-2">
                    <span className="rounded-md border border-cyan-400/20 bg-[#0a1219] px-2.5 py-1 text-sm font-medium text-cyan-50">
                      {word}
                    </span>
                    {i < entry.words.length - 1 && (
                      <span className="text-cyan-200/30">&rarr;</span>
                    )}
                  </span>
                ))}
              </div>
              <HudLabel>Why it matters</HudLabel>
              <p className="text-sm text-cyan-100/90">{entry.note}</p>
            </HudPanel>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

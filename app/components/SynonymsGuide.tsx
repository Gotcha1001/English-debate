"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HudPanel, HudLabel } from "./HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

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
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const [closeHovered, setCloseHovered] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] overflow-y-auto bg-[#04070a] p-0 sm:max-w-2xl scrollbar-hide"
        style={{
          border: `1px solid ${hex400}40`,
          boxShadow: `0 0 60px -12px ${hex400}80`,
        }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between bg-[#04070a]/95 px-6 py-4 backdrop-blur"
          style={{ borderBottom: `1px solid ${hex400}1a` }}
        >
          <DialogTitle className="text-xl font-bold text-stone-50">
            What is a synonym spectrum?
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
            aria-label="Close"
            className="rounded-md border p-1.5 transition"
            style={{
              borderColor: closeHovered ? `${hex400}4d` : "transparent",
              backgroundColor: closeHovered ? `${hex400}1a` : "transparent",
              color: closeHovered ? shades[300] : `${shades[300]}80`,
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-6 pt-4">
          <p className="text-sm text-stone-400">
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
                    <span
                      className="rounded-md bg-[#0a1219] px-2.5 py-1 text-sm font-medium text-stone-50"
                      style={{ border: `1px solid ${hex400}33` }}
                    >
                      {word}
                    </span>
                    {i < entry.words.length - 1 && (
                      <span style={{ color: `${shades[300]}4d` }}>&rarr;</span>
                    )}
                  </span>
                ))}
              </div>
              <HudLabel>Why it matters</HudLabel>
              <p className="text-sm text-stone-100">{entry.note}</p>
            </HudPanel>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

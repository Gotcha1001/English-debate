"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HudPanel, HudLabel } from "./HudPanel";

interface PunGuideEntry {
  type: string;
  description: string;
  example: string;
  swatch: string; // border/bg/text classes, kept in one place per type
}

// The three wordplay mechanics the generator itself is instructed to use
// (see buildPunsPrompt) -- kept in sync so the guide always matches what
// students will actually see in a generated set.
const PUN_GUIDE: PunGuideEntry[] = [
  {
    type: "Homophone Pun",
    description:
      "Two words that sound alike (or nearly alike) but mean different things -- the joke swaps one in for the other.",
    example: "I used to be a baker, but I couldn't make enough dough.",
    swatch: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  },
  {
    type: "Double Meaning",
    description:
      "One word or phrase genuinely means two different things at once, and both readings fit the sentence.",
    example: "The math teacher called in sick with algebra.",
    swatch: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  },
  {
    type: "Idiom Twist",
    description:
      "A common saying gets taken literally, so the familiar phrase suddenly means something unexpected.",
    example: "I'm reading a book on anti-gravity. It's impossible to put down.",
    swatch: "border-violet-400/40 bg-violet-400/10 text-violet-200",
  },
];

interface PunsGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Static "what is a pun" reference, opened from the Pun Lab page.
 * No AI call -- this is a fixed teaching panel, not generated content. */
export function PunsGuide({ open, onOpenChange }: PunsGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] overflow-y-auto border border-cyan-400/25 bg-[#04070a] p-0 shadow-[0_0_60px_-12px_rgba(34,211,238,0.5)] sm:max-w-2xl scrollbar-hide"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-400/10 bg-[#04070a]/95 px-6 py-4 backdrop-blur">
          <DialogTitle className="text-xl font-bold text-cyan-50">
            What is a pun?
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
            A pun is a joke that plays on the sound or multiple meanings of a
            word. Here are the three flavors you&apos;ll see most often in Pun
            Lab.
          </p>
          {PUN_GUIDE.map((entry) => (
            <HudPanel key={entry.type} className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${entry.swatch}`}
                >
                  {entry.type}
                </span>
              </div>
              <HudLabel>How it works</HudLabel>
              <p className="mb-3 text-sm text-cyan-100/90">
                {entry.description}
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

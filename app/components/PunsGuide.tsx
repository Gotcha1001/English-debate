"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HudPanel, HudLabel } from "./HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

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
            What is a pun?
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
              <p className="mb-3 text-sm text-stone-100">{entry.description}</p>
              <HudLabel>Example</HudLabel>
              <p className="text-base font-medium text-stone-50">
                {entry.example}
              </p>
            </HudPanel>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

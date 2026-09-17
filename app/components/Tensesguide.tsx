"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HudPanel, HudLabel } from "./HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

interface TenseGuideEntry {
  tense: string;
  usedFor: string;
  structure: string;
  example: string;
  /** Fixed Tailwind classes for non-primary accent swatches (visual distinction). */
  swatch: string;
}

// Same base idea ("I walk to school") carried through every tense so the
// only thing that changes is the tense itself -- makes the pattern obvious.
const TENSE_GUIDE: TenseGuideEntry[] = [
  {
    tense: "Present Simple",
    usedFor: "Habits, routines, and general facts",
    structure: "I + base verb  (add -s for he / she / it)",
    example: "I walk to school every day.",
    // Primary accent is theme-driven below; this entry uses the theme swatch.
    swatch: "", // rendered with style instead of class
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
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] overflow-y-auto border bg-[#04070a] p-0 sm:max-w-2xl scrollbar-hide"
        style={{
          borderColor: `${hex400}40`,
          boxShadow: `0 0 60px -12px ${hex400}80`,
        }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b bg-[#04070a]/95 px-6 py-4 backdrop-blur"
          style={{ borderColor: `${hex400}1a` }}
        >
          <DialogTitle className="text-xl font-bold text-stone-50">
            How the tenses work
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="rounded-md border border-transparent p-1.5 text-stone-400 transition"
            style={
              {
                // hover handled via CSS variables / onMouse for theme color
              } as React.CSSProperties
            }
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = `${hex400}4d`;
              el.style.backgroundColor = `${hex400}1a`;
              el.style.color = shades[300];
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "transparent";
              el.style.backgroundColor = "transparent";
              el.style.color = ""; // falls back to text-stone-400
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6 pt-4">
          <p className="text-sm text-stone-400">
            Same sentence, five tenses. Watch what changes each time -- usually
            just the verb, and sometimes a helper word.
          </p>

          {TENSE_GUIDE.map((entry, i) => (
            <HudPanel key={entry.tense} className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {i === 0 ? (
                  // Present Simple uses the active theme accent
                  <span
                    className="rounded-full border px-2.5 py-1 text-xs font-semibold"
                    style={{
                      borderColor: `${hex400}66`,
                      backgroundColor: `${hex400}1a`,
                      color: shades[300],
                    }}
                  >
                    {entry.tense}
                  </span>
                ) : (
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${entry.swatch}`}
                  >
                    {entry.tense}
                  </span>
                )}
                <span className="text-xs text-stone-500">{entry.usedFor}</span>
              </div>

              <HudLabel>Structure</HudLabel>
              <p className="mb-3 font-mono text-sm text-stone-100">
                {entry.structure}
              </p>

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

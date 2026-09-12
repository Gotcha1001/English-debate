"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HudPanel, HudLabel } from "./HudPanel";
import { POS_STYLES, type PartOfSpeech } from "./Grammarsentencecard";

interface PosGuideEntry {
  pos: PartOfSpeech;
  definition: string;
  example: string;
  highlight: string; // the exact word/phrase from `example` that demonstrates it
  why: string;
}

// One consistent "a teacher writing a lesson" scene across all nine, so the
// only thing that changes is which word is doing the part-of-speech's job.
const POS_GUIDE: PosGuideEntry[] = [
  {
    pos: "noun",
    definition: "Names a person, place, thing, or idea.",
    example: "The teacher wrote the lesson on the board.",
    highlight: "teacher",
    why: 'Nouns are the "who" and "what" of a sentence -- almost every sentence needs at least one.',
  },
  {
    pos: "pronoun",
    definition: "Stands in for a noun so you don't have to repeat it.",
    example: "She wrote it on the board.",
    highlight: "She",
    why: "Without pronouns you'd repeat the same noun over and over -- \"the teacher wrote the teacher's lesson.\"",
  },
  {
    pos: "verb",
    definition: "Shows an action, or a state of being.",
    example: "She wrote the lesson.",
    highlight: "wrote",
    why: "The verb is the engine of the sentence -- every complete sentence needs one.",
  },
  {
    pos: "adjective",
    definition: "Describes or gives more detail about a noun.",
    example: "She wrote a difficult lesson.",
    highlight: "difficult",
    why: 'Adjectives answer "what kind?" or "which one?" -- they add color without changing the action.',
  },
  {
    pos: "adverb",
    definition:
      "Describes a verb, an adjective, or another adverb -- often ends in -ly.",
    example: "She wrote the lesson quickly.",
    highlight: "quickly",
    why: 'Adverbs answer "how," "when," "where," or "how much" -- they add detail to the action itself.',
  },
  {
    pos: "article",
    definition: "A, an, or the -- marks a noun as specific or general.",
    example: "She wrote the lesson.",
    highlight: "the",
    why: '"The lesson" (one specific lesson) reads very differently from "a lesson" (any lesson) -- articles carry that distinction.',
  },
  {
    pos: "preposition",
    definition:
      "Shows how a noun relates to the rest of the sentence -- often place, time, or direction.",
    example: "She wrote the lesson on the board.",
    highlight: "on",
    why: 'Prepositions anchor nouns in time and space -- swap "on" for "under" and the whole picture changes.',
  },
  {
    pos: "conjunction",
    definition: "Joins words, phrases, or clauses together.",
    example: "She wrote the lesson, but the students were confused.",
    highlight: "but",
    why: "Conjunctions show the relationship between ideas -- contrast, addition, cause -- not just glue them together.",
  },
  {
    pos: "interjection",
    definition:
      "A short burst that expresses emotion, standing apart from the sentence's grammar.",
    example: "Wow! She wrote a great lesson.",
    highlight: "Wow",
    why: "Interjections carry tone and feeling -- they don't follow normal sentence rules, and that's the point.",
  },
];

interface PartsOfSpeechGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Static "what is each part of speech" reference, opened from the Grammar
 * Breakdown page. No AI call -- fixed teaching content, not generated. */
export function PartsOfSpeechGuide({
  open,
  onOpenChange,
}: PartsOfSpeechGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="scrollbar-hide max-h-[85vh] overflow-y-auto border border-cyan-400/25 bg-[#04070a] p-0 shadow-[0_0_60px_-12px_rgba(34,211,238,0.5)] sm:max-w-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-400/10 bg-[#04070a]/95 px-6 py-4 backdrop-blur">
          <DialogTitle className="text-xl font-bold text-cyan-50">
            Parts of speech, explained
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
            Same little scene, nine jobs. Watch which word is doing the work
            each time.
          </p>

          {POS_GUIDE.map((entry) => {
            const style = POS_STYLES[entry.pos];
            return (
              <HudPanel key={entry.pos} className="p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${style.className}`}
                  >
                    {style.label} {entry.pos}
                  </span>
                  <span className="text-xs text-cyan-200/50">
                    {entry.definition}
                  </span>
                </div>

                <HudLabel>Example</HudLabel>
                <p className="mb-2 text-base font-medium text-cyan-50">
                  {entry.example}
                </p>
                <span
                  title={entry.pos}
                  className={`mb-3 inline-flex flex-col items-center rounded-md border px-2 py-1 text-xs leading-tight ${style.className}`}
                >
                  <span className="font-medium">{entry.highlight}</span>
                  <span className="text-[10px] opacity-70">{style.label}</span>
                </span>

                <HudLabel>Why it matters</HudLabel>
                <p className="text-sm text-cyan-100/80">{entry.why}</p>
              </HudPanel>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

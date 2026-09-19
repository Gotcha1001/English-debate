// "use client";

// import { useState } from "react";
// import { useParams } from "next/navigation";
// import { useQuery } from "convex/react";
// import { CheckCircle2, XCircle } from "lucide-react";
// import { api } from "@/convex/_generated/api";
// import type { Id } from "@/convex/_generated/dataModel";

// function SectionLabel({
//   color,
//   children,
// }: {
//   color: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="mb-3 flex items-center gap-2">
//       <span className={`h-4 w-1.5 rounded-full ${color}`} />
//       <h2 className="text-lg font-semibold text-slate-800 dark:text-cyan-100/90">
//         {children}
//       </h2>
//     </div>
//   );
// }

// function ComprehensionItem({
//   index,
//   question,
//   answer,
// }: {
//   index: number;
//   question: string;
//   answer: string;
// }) {
//   const [revealed, setRevealed] = useState(false);
//   return (
//     <li
//       className="
//         group rounded-lg border border-slate-200 p-3
//         transition-all duration-200
//         dark:border-cyan-400/10
//         hover:border-cyan-400/40 hover:bg-cyan-400/[0.05]
//         dark:hover:border-cyan-400/35 dark:hover:bg-cyan-400/10
//         dark:hover:shadow-[0_0_20px_-6px_rgba(34,211,238,0.4)]
//       "
//     >
//       <p className="text-slate-800 dark:text-cyan-100/90">
//         <span className="mr-2 text-slate-400 transition-colors group-hover:text-cyan-500 dark:text-cyan-200/40 dark:group-hover:text-cyan-400">
//           {index + 1}.
//         </span>
//         {question}
//       </p>
//       <button
//         type="button"
//         onClick={() => setRevealed((v) => !v)}
//         className="mt-2 text-xs font-medium text-cyan-700 transition-colors hover:text-cyan-500 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
//       >
//         {revealed ? "Hide answer" : "Show answer"}
//       </button>
//       {revealed && (
//         <p className="mt-1 text-sm text-slate-600 dark:text-cyan-200/60">
//           {answer}
//         </p>
//       )}
//     </li>
//   );
// }

// function MultipleChoiceItem({
//   index,
//   question,
//   options,
//   correctIndex,
// }: {
//   index: number;
//   question: string;
//   options: string[];
//   correctIndex: number;
// }) {
//   const [selected, setSelected] = useState<number | null>(null);
//   return (
//     <li
//       className="
//         rounded-lg border border-slate-200 p-3
//         transition-all duration-200
//         dark:border-cyan-400/10
//         hover:border-cyan-400/30
//         dark:hover:border-cyan-400/25 dark:hover:bg-cyan-400/[0.04]
//       "
//     >
//       <p className="mb-2 text-slate-800 dark:text-cyan-100/90">
//         <span className="mr-2 text-slate-400 dark:text-cyan-200/40">
//           {index + 1}.
//         </span>
//         {question}
//       </p>
//       <div className="flex flex-col gap-1.5">
//         {options.map((option, optIndex) => {
//           const isSelected = selected === optIndex;
//           const isCorrect = optIndex === correctIndex;
//           const showState = selected !== null;
//           return (
//             <button
//               key={optIndex}
//               type="button"
//               onClick={() => setSelected(optIndex)}
//               className={`
//                 flex items-center justify-between rounded-md border px-3 py-1.5
//                 text-left text-sm transition-all duration-200
//                 ${
//                   showState && isCorrect
//                     ? "border-cyan-600 bg-cyan-50 shadow-[0_0_16px_-4px_rgba(34,211,238,0.45)] dark:border-cyan-400 dark:bg-cyan-400/15 dark:shadow-[0_0_20px_-4px_rgba(34,211,238,0.5)]"
//                     : showState && isSelected
//                       ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-500/10"
//                       : "border-slate-200 hover:border-cyan-400 hover:bg-cyan-400/[0.06] dark:border-cyan-400/15 dark:hover:border-cyan-400/40 dark:hover:bg-cyan-400/10 dark:hover:shadow-[0_0_16px_-4px_rgba(34,211,238,0.35)]"
//                 }
//               `}
//             >
//               <span className="text-slate-800 dark:text-cyan-50">{option}</span>
//               {showState && isCorrect && (
//                 <CheckCircle2 className="h-4 w-4 text-cyan-700 dark:text-cyan-400" />
//               )}
//               {showState && isSelected && !isCorrect && (
//                 <XCircle className="h-4 w-4 text-red-500" />
//               )}
//             </button>
//           );
//         })}
//       </div>
//     </li>
//   );
// }

// export default function LessonPage() {
//   const params = useParams<{ id: string }>();
//   const lesson = useQuery(api.lessonData.getLesson, {
//     id: params.id as Id<"lessons">,
//   });

//   if (lesson === undefined) {
//     return (
//       <p className="text-sm text-slate-500 dark:text-cyan-200/50">
//         Loading lesson…
//       </p>
//     );
//   }
//   if (lesson === null) {
//     return (
//       <p className="text-sm text-slate-500 dark:text-cyan-200/50">
//         Lesson not found.
//       </p>
//     );
//   }

//   return (
//     <div className="mx-auto max-w-3xl space-y-10 pb-16">
//       <header>
//         <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
//           Free Talking lesson
//         </p>
//         <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
//           {lesson.topic}
//         </h1>
//       </header>

//       <section>
//         <SectionLabel color="bg-cyan-600">Story</SectionLabel>
//         <p className="whitespace-pre-line rounded-xl border border-slate-200 bg-white p-5 leading-relaxed text-slate-800 transition-all duration-200 dark:border-cyan-400/10 dark:bg-[#0a1219] dark:text-cyan-100/90 dark:hover:border-cyan-400/25 dark:hover:shadow-[0_0_30px_-10px_rgba(34,211,238,0.25)]">
//           {lesson.story}
//         </p>
//       </section>

//       <section>
//         <SectionLabel color="bg-amber-500">Comprehension</SectionLabel>
//         <ul className="space-y-2">
//           {lesson.comprehensionQuestions.map((q, i) => (
//             <ComprehensionItem
//               key={i}
//               index={i}
//               question={q.question}
//               answer={q.answer}
//             />
//           ))}
//         </ul>
//       </section>

//       <section>
//         <SectionLabel color="bg-amber-500">Which is correct?</SectionLabel>
//         <ul className="space-y-3">
//           {lesson.multipleChoice.map((mcq, i) => (
//             <MultipleChoiceItem
//               key={i}
//               index={i}
//               question={mcq.question}
//               options={mcq.options}
//               correctIndex={mcq.correctIndex}
//             />
//           ))}
//         </ul>
//       </section>

//       <section>
//         <SectionLabel color="bg-violet-600">Difficult words</SectionLabel>
//         <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//           {lesson.vocabulary.map((entry, i) => (
//             <div
//               key={i}
//               className="
//                 rounded-lg border border-slate-200 p-3
//                 transition-all duration-200
//                 dark:border-cyan-400/10
//                 hover:border-cyan-400/40 hover:bg-cyan-400/[0.05]
//                 dark:hover:border-cyan-400/35 dark:hover:bg-cyan-400/10
//                 dark:hover:shadow-[0_0_18px_-4px_rgba(34,211,238,0.4)]
//               "
//             >
//               <dt className="font-semibold text-slate-800 dark:text-cyan-100/90">
//                 {entry.word}
//               </dt>
//               <dd className="text-sm text-slate-600 dark:text-cyan-200/60">
//                 {entry.meaning}
//               </dd>
//             </div>
//           ))}
//         </dl>
//       </section>

//       <section>
//         <SectionLabel color="bg-cyan-600">
//           Discussion questions ({lesson.discussionQuestions.length})
//         </SectionLabel>
//         <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
//           {lesson.discussionQuestions.map((q, i) => (
//             <li
//               key={i}
//               className="
//                 group rounded-md border border-transparent px-2 py-1.5 text-sm
//                 transition-all duration-200
//                 text-slate-700 dark:text-cyan-100/80
//                 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]
//                 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-400/10
//                 dark:hover:shadow-[0_0_18px_-4px_rgba(34,211,238,0.4)]
//                 dark:hover:text-cyan-50
//               "
//             >
//               <span className="mr-1.5 text-slate-400 transition-colors group-hover:text-cyan-500 dark:text-cyan-200/40 dark:group-hover:text-cyan-400">
//                 {i + 1}.
//               </span>
//               {q}
//             </li>
//           ))}
//         </ol>
//       </section>

//       <section>
//         <SectionLabel color="bg-rose-500">Sentence structure</SectionLabel>
//         <div className="space-y-3">
//           {lesson.sentenceAnalysis.map((entry, i) => (
//             <div
//               key={i}
//               className="
//                 rounded-lg border border-slate-200 p-4
//                 transition-all duration-200
//                 dark:border-cyan-400/10
//                 hover:border-cyan-400/40 hover:bg-cyan-400/[0.04]
//                 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-400/[0.06]
//                 dark:hover:shadow-[0_0_20px_-6px_rgba(34,211,238,0.35)]
//               "
//             >
//               <p className="mb-2 italic text-slate-800 dark:text-cyan-100/90">
//                 &ldquo;{entry.sentence}&rdquo;
//               </p>
//               <div className="flex flex-wrap gap-2 text-xs">
//                 <span className="rounded-full bg-cyan-100 px-2.5 py-1 font-medium text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-300">
//                   Subject: {entry.subject}
//                 </span>
//                 <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
//                   Verb: {entry.verb}
//                 </span>
//                 {entry.adverb && (
//                   <span className="rounded-full bg-violet-100 px-2.5 py-1 font-medium text-violet-800 dark:bg-violet-500/15 dark:text-violet-300">
//                     Adverb: {entry.adverb}
//                   </span>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }
// app/free-talking/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { LessonHeader } from "@/app/components/LessonHeader";
import { useLessonHeader } from "@/hooks/useLessonHeader";

const READOUTS = [
  ["noun", "verb", "adj."],
  ["adverb", "article", "conj."],
  ["pronoun", "prep.", "tense"],
  ["subject", "clause", "B2"],
  ["A2", "C1", "B1"],
  ["noun", "verb", "interj."],
  ["adj.", "adv.", "article"],
  ["conj.", "prep.", "pronoun"],
];

const RAIN_COLUMNS = Array.from({ length: 10 }).map((_, i) => ({
  left: `${(i / 9) * 100}%`,
  tokens: READOUTS[i % READOUTS.length],
  duration: 11 + (i % 5) * 2.4,
  delay: (i % 6) * 0.8,
}));

const ORBITALS = [
  { top: "10%", left: "6%", size: 10, delay: 0 },
  { top: "18%", left: "90%", size: 8, delay: 0.9 },
  { top: "42%", left: "4%", size: 12, delay: 1.6 },
  { top: "58%", left: "93%", size: 9, delay: 0.4 },
  { top: "72%", left: "12%", size: 11, delay: 2.1 },
  { top: "30%", left: "96%", size: 7, delay: 1.2 },
  { top: "50%", left: "48%", size: 10, delay: 0.6 },
  { top: "82%", left: "75%", size: 8, delay: 1.8 },
  { top: "25%", left: "35%", size: 6, delay: 2.4 },
  { top: "88%", left: "40%", size: 9, delay: 1.1 },
];

function MatrixBackground() {
  const reduceMotion = useReducedMotion();
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 opacity-40 dark:opacity-50">
        {RAIN_COLUMNS.map((col, i) => (
          <motion.div
            key={i}
            className="absolute top-0 flex flex-col gap-7 font-[family-name:var(--font-hud)] text-[10px] uppercase tracking-wider"
            style={{
              left: col.left,
              color: i % 2 === 0 ? `${hex400}73` : `${hex400}40`,
              maskImage:
                "linear-gradient(to bottom, transparent, black 12%, black 78%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 12%, black 78%, transparent)",
            }}
            animate={reduceMotion ? undefined : { y: ["-45%", "145%"] }}
            transition={{
              duration: col.duration,
              repeat: Infinity,
              delay: col.delay,
              ease: "linear",
            }}
          >
            {[...col.tokens, ...col.tokens, ...col.tokens, ...col.tokens].map(
              (t, j) => (
                <span key={j}>{t}</span>
              ),
            )}
          </motion.div>
        ))}
      </div>

      {ORBITALS.map((o, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            top: o.top,
            left: o.left,
            width: o.size,
            height: o.size,
            backgroundColor: shades[300],
            boxShadow: `0 0 16px 4px ${hex400}8c, 0 0 32px 8px ${hex400}40`,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.2, 0.85, 0.2],
                  scale: [0.7, 1.5, 0.7],
                }
          }
          transition={{
            duration: 3.6,
            repeat: Infinity,
            delay: o.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function SectionLabel({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className={`h-4 w-1.5 rounded-full ${color}`} />
      <h2 className="text-lg font-semibold text-slate-800 dark:text-stone-100">
        {children}
      </h2>
    </div>
  );
}

function ComprehensionItem({
  index,
  question,
  answer,
}: {
  index: number;
  question: string;
  answer: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const [hovered, setHovered] = useState(false);

  return (
    <li
      className="group rounded-lg border p-3 transition-all duration-200"
      style={{
        borderColor: hovered ? `${hex400}66` : `${hex400}1a`,
        backgroundColor: hovered ? `${hex400}0d` : "transparent",
        boxShadow: hovered ? `0 0 20px -6px ${hex400}66` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p className="text-slate-800 dark:text-stone-100">
        <span
          className="mr-2 transition-colors"
          style={{ color: hovered ? hex400 : `${shades[300]}66` }}
        >
          {index + 1}.
        </span>
        {question}
      </p>
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="mt-2 text-xs font-medium transition-colors hover:underline"
        style={{ color: hex400 }}
      >
        {revealed ? "Hide answer" : "Show answer"}
      </button>
      {revealed && (
        <p className="mt-1 text-sm text-slate-600 dark:text-stone-400">
          {answer}
        </p>
      )}
    </li>
  );
}

function MultipleChoiceItem({
  index,
  question,
  options,
  correctIndex,
}: {
  index: number;
  question: string;
  options: string[];
  correctIndex: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const [hovered, setHovered] = useState(false);

  return (
    <li
      className="rounded-lg border p-3 transition-all duration-200"
      style={{
        borderColor: hovered ? `${hex400}4d` : `${hex400}1a`,
        backgroundColor: hovered ? `${hex400}0a` : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p className="mb-2 text-slate-800 dark:text-stone-100">
        <span className="mr-2" style={{ color: `${shades[300]}66` }}>
          {index + 1}.
        </span>
        {question}
      </p>
      <div className="flex flex-col gap-1.5">
        {options.map((option, optIndex) => {
          const isSelected = selected === optIndex;
          const isCorrect = optIndex === correctIndex;
          const showState = selected !== null;

          let borderColor = `${hex400}26`;
          let backgroundColor = "transparent";
          let boxShadow: string | undefined;

          if (showState && isCorrect) {
            borderColor = hex400;
            backgroundColor = `${hex400}26`;
            boxShadow = `0 0 16px -4px ${hex400}80`;
          } else if (showState && isSelected) {
            borderColor = "#f87171";
            backgroundColor = "rgba(248,113,113,0.1)";
          }

          return (
            <button
              key={optIndex}
              type="button"
              onClick={() => setSelected(optIndex)}
              className="flex items-center justify-between rounded-md border px-3 py-1.5 text-left text-sm transition-all duration-200"
              style={{ borderColor, backgroundColor, boxShadow }}
            >
              <span className="text-slate-800 dark:text-stone-50">
                {option}
              </span>
              {showState && isCorrect && (
                <CheckCircle2 className="h-4 w-4" style={{ color: hex400 }} />
              )}
              {showState && isSelected && !isCorrect && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </button>
          );
        })}
      </div>
    </li>
  );
}

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const lessonId = params.id as Id<"lessons">;
  const lesson = useQuery(api.lessonData.getLesson, { id: lessonId });
  // Must sit above the early returns below (rules of hooks).
  const header = useLessonHeader(lessonId);
  const { theme } = useColorTheme();
  const { hex400 } = theme;

  if (lesson === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Loading lesson…
      </p>
    );
  }
  if (lesson === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Lesson not found.
      </p>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />

      <div className="relative z-10 mx-auto max-w-3xl space-y-10 pb-16">
        {/* A <div>, not <header>: <LessonHeader> renders its own <header>
            and headers can't nest. */}
        <div>
          <p className="text-sm font-medium" style={{ color: hex400 }}>
            Free Talking lesson
          </p>
          {/* Themed glow around the header card. `getLesson` only returns
              lessons the signed-in user owns, so anyone who can see this
              page can edit it. */}
          <div
            className="mt-3 rounded-2xl"
            style={{
              boxShadow: `0 0 0 1px ${hex400}59, 0 0 40px -10px ${hex400}73`,
            }}
          >
            <LessonHeader
              title={lesson.topic}
              learningObjective={lesson.learningObjective}
              imageUrl={lesson.headerImage?.url}
              editable
              isUploadingImage={header.isImageBusy}
              isSavingObjective={header.isSavingObjective}
              onUploadImage={header.uploadImage}
              onRemoveImage={header.removeImage}
              onSaveObjective={header.saveObjective}
            />
          </div>
        </div>

        <section>
          <SectionLabel color="bg-cyan-600">Story</SectionLabel>
          <p
            className="whitespace-pre-line rounded-xl border bg-white/90 p-5 leading-relaxed text-slate-800 backdrop-blur-sm transition-all duration-200 dark:bg-[#0a1219]/90 dark:text-stone-100"
            style={{ borderColor: `${hex400}1a` }}
          >
            {lesson.story}
          </p>
        </section>

        <section>
          <SectionLabel color="bg-amber-500">Comprehension</SectionLabel>
          <ul className="space-y-2">
            {lesson.comprehensionQuestions.map((q, i) => (
              <ComprehensionItem
                key={i}
                index={i}
                question={q.question}
                answer={q.answer}
              />
            ))}
          </ul>
        </section>

        <section>
          <SectionLabel color="bg-amber-500">Which is correct?</SectionLabel>
          <ul className="space-y-3">
            {lesson.multipleChoice.map((mcq, i) => (
              <MultipleChoiceItem
                key={i}
                index={i}
                question={mcq.question}
                options={mcq.options}
                correctIndex={mcq.correctIndex}
              />
            ))}
          </ul>
        </section>

        <section>
          <SectionLabel color="bg-violet-600">Difficult words</SectionLabel>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {lesson.vocabulary.map((entry, i) => (
              <VocabCard key={i} word={entry.word} meaning={entry.meaning} />
            ))}
          </dl>
        </section>

        <section>
          <SectionLabel color="bg-cyan-600">
            Discussion questions ({lesson.discussionQuestions.length})
          </SectionLabel>
          <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {lesson.discussionQuestions.map((q, i) => (
              <DiscussionItem key={i} index={i} text={q} />
            ))}
          </ol>
        </section>

        <section>
          <SectionLabel color="bg-rose-500">Sentence structure</SectionLabel>
          <div className="space-y-3">
            {lesson.sentenceAnalysis.map((entry, i) => (
              <SentenceCard
                key={i}
                sentence={entry.sentence}
                subject={entry.subject}
                verb={entry.verb}
                adverb={entry.adverb}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function VocabCard({ word, meaning }: { word: string; meaning: string }) {
  const { theme } = useColorTheme();
  const { hex400 } = theme;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-lg border bg-white/80 p-3 backdrop-blur-sm transition-all duration-200 dark:bg-[#0a1219]/80"
      style={{
        borderColor: hovered ? `${hex400}66` : `${hex400}1a`,
        backgroundColor: hovered ? `${hex400}0d` : undefined,
        boxShadow: hovered ? `0 0 18px -4px ${hex400}66` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <dt className="font-semibold text-slate-800 dark:text-stone-100">
        {word}
      </dt>
      <dd className="text-sm text-slate-600 dark:text-stone-400">{meaning}</dd>
    </div>
  );
}

function DiscussionItem({ index, text }: { index: number; text: string }) {
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const [hovered, setHovered] = useState(false);

  return (
    <li
      className="group rounded-md border border-transparent px-2 py-1.5 text-sm transition-all duration-200 text-slate-700 dark:text-stone-200"
      style={{
        borderColor: hovered ? `${hex400}4d` : "transparent",
        backgroundColor: hovered ? `${hex400}0f` : "transparent",
        boxShadow: hovered ? `0 0 18px -4px ${hex400}66` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="mr-1.5 transition-colors"
        style={{ color: hovered ? hex400 : `${shades[300]}66` }}
      >
        {index + 1}.
      </span>
      {text}
    </li>
  );
}

function SentenceCard({
  sentence,
  subject,
  verb,
  adverb,
}: {
  sentence: string;
  subject: string;
  verb: string;
  adverb?: string | null;
}) {
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-lg border bg-white/80 p-4 backdrop-blur-sm transition-all duration-200 dark:bg-[#0a1219]/80"
      style={{
        borderColor: hovered ? `${hex400}66` : `${hex400}1a`,
        backgroundColor: hovered ? `${hex400}0a` : undefined,
        boxShadow: hovered ? `0 0 20px -6px ${hex400}59` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p className="mb-2 italic text-slate-800 dark:text-stone-100">
        &ldquo;{sentence}&rdquo;
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span
          className="rounded-full px-2.5 py-1 font-medium"
          style={{
            backgroundColor: `${hex400}26`,
            color: shades[300],
          }}
        >
          Subject: {subject}
        </span>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
          Verb: {verb}
        </span>
        {adverb && (
          <span className="rounded-full bg-violet-100 px-2.5 py-1 font-medium text-violet-800 dark:bg-violet-500/15 dark:text-violet-300">
            Adverb: {adverb}
          </span>
        )}
      </div>
    </div>
  );
}

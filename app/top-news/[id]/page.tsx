// app/top-news/[id]/page.tsx

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { ExternalLink } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { LessonHeader } from "@/app/components/LessonHeader";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { useTopNewsHeader } from "@/hooks/useTopNewsHeader";
import { ReadAloudButton } from "@/app/components/ReadAloudButton";

function SectionLabel({
  color,
  children,
  right,
}: {
  color: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className={`h-4 w-1.5 rounded-full ${color}`} />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-stone-100">
          {children}
        </h2>
      </div>
      {right}
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

export default function TopNewsLessonPage() {
  const params = useParams<{ id: string }>();
  const lessonId = params.id as Id<"topNewsLessons">;
  const lesson = useQuery(api.topNewsData.getTopNewsLesson, { id: lessonId });
  // Must sit above the early returns below (rules of hooks).
  const header = useTopNewsHeader(lessonId);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

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
            Top News lesson
          </p>
          <div
            className="mt-3 rounded-2xl"
            style={{
              boxShadow: `0 0 0 1px ${hex400}59, 0 0 40px -10px ${hex400}73`,
            }}
          >
            <LessonHeader
              title={lesson.headline}
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
          <p
            className="mt-3 flex flex-wrap items-center gap-2 text-sm"
            style={{ color: `${shades[300]}99` }}
          >
            <a
              href={lesson.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
              style={{ color: hex400 }}
            >
              {lesson.sourceName}
              <ExternalLink className="h-3 w-3" />
            </a>
            {lesson.publishedDate && (
              <span>
                · {new Date(lesson.publishedDate).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        <section>
          <SectionLabel
            color="bg-cyan-600"
            right={
              <ReadAloudButton text={lesson.story} label="Read story aloud" />
            }
          >
            Story
          </SectionLabel>
          <p
            className="whitespace-pre-line rounded-xl border bg-white/90 p-5 leading-relaxed text-slate-800 backdrop-blur-sm transition-all duration-200 dark:bg-[#0a1219]/90 dark:text-stone-100"
            style={{ borderColor: `${hex400}1a` }}
          >
            {lesson.story}
          </p>
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
          <SectionLabel color="bg-cyan-600">
            Discussion questions ({lesson.discussionQuestions.length})
          </SectionLabel>
          <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {lesson.discussionQuestions.map((q, i) => (
              <DiscussionItem key={i} index={i} text={q} />
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

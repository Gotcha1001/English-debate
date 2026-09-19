"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TenseSentenceCard } from "@/app/components/Tensesentencecard";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { LessonHeader } from "@/app/components/LessonHeader";
import { useTenseSetHeader } from "@/hooks/useTenseSetHeader";

export default function TenseSetPage() {
  const params = useParams<{ id: string }>();
  const setId = params.id as Id<"tenseSets">;
  const set = useQuery(api.tensesData.getTenseSet, { id: setId });
  // Must sit above the early returns below (rules of hooks).
  const header = useTenseSetHeader(setId);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Loading tenses set...
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Tenses set not found.
      </p>
    );
  }

  const totalQuestions = set.sentences.reduce(
    (sum, sentence) => sum + sentence.variants.length,
    0,
  );

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />

      <div className="relative z-10 mx-auto max-w-3xl space-y-5 pb-16">
        {/* A <div>, not <header>: <LessonHeader> renders its own <header>
            and headers can't nest. */}
        <div className="mb-2">
          <p className="text-sm font-medium" style={{ color: hex400 }}>
            Tenses
          </p>
          {/* Themed glow around the header card. `getTenseSet` only returns
              sets the signed-in user owns, so anyone who can see this page
              can edit it. */}
          <div
            className="mt-3 rounded-2xl"
            style={{
              boxShadow: `0 0 0 1px ${hex400}59, 0 0 40px -10px ${hex400}73`,
            }}
          >
            <LessonHeader
              title={set.topic}
              learningObjective={set.learningObjective}
              imageUrl={set.headerImage?.url}
              editable
              isUploadingImage={header.isImageBusy}
              isSavingObjective={header.isSavingObjective}
              onUploadImage={header.uploadImage}
              onRemoveImage={header.removeImage}
              onSaveObjective={header.saveObjective}
            />
          </div>
          <p
            className="mt-3 text-sm text-slate-500"
            style={{ color: `${shades[300]}66` }}
          >
            {set.sentences.length} sentences · {totalQuestions} quiz questions
          </p>
        </div>

        {set.sentences.map((sentence, i) => (
          <TenseSentenceCard key={i} index={i} data={sentence} />
        ))}
      </div>
    </div>
  );
}

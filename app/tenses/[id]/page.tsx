"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TenseSentenceCard } from "@/app/components/Tensesentencecard";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { useColorTheme } from "@/app/context/ColorThemeContext";

export default function TenseSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.tensesData.getTenseSet, {
    id: params.id as Id<"tenseSets">,
  });
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
        <header className="mb-2">
          <p className="text-sm font-medium" style={{ color: hex400 }}>
            Tenses
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
            {set.topic}
          </h1>
          <p
            className="mt-1 text-sm text-slate-500"
            style={{ color: `${shades[300]}66` }}
          >
            {set.sentences.length} sentences · {totalQuestions} quiz questions
          </p>
        </header>
        {set.sentences.map((sentence, i) => (
          <TenseSentenceCard key={i} index={i} data={sentence} />
        ))}
      </div>
    </div>
  );
}

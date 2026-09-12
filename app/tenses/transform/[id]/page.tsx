"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TenseConversionCard } from "@/app/components/Tenseconversioncard";

export default function TenseConversionSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.tenseConversionData.getTenseConversionSet, {
    id: params.id as Id<"tenseConversionSets">,
  });

  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Loading set...
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Set not found.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-16">
      <header className="mb-2">
        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
          Transform the Tense
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
          {set.topic}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-cyan-200/40">
          {set.sentences.length} sentences to convert
        </p>
      </header>
      {set.sentences.map((sentence, i) => (
        <TenseConversionCard key={i} index={i} data={sentence} />
      ))}
    </div>
  );
}

"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SynonymSpectrumCard } from "@/app/components/SynonymSpectrumCard";
import { HudPanel, HudLabel } from "@/app/components/HudPanel";

export default function SynonymSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.synonymsData.getSynonymSet, {
    id: params.id as Id<"synonymSets">,
  });
  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Loading synonym set...
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Synonym set not found.
      </p>
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-16">
      <header className="mb-2">
        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
          Synonym Spectrum
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
          {set.topic}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-cyan-200/40">
          {set.groups.length} spectrums &middot;{" "}
          {set.discussionQuestions.length} discussion questions
        </p>
      </header>
      {set.groups.map((group, i) => (
        <SynonymSpectrumCard key={i} index={i} data={group} />
      ))}
      <HudPanel className="p-5">
        <HudLabel>
          Discussion questions ({set.discussionQuestions.length})
        </HudLabel>
        <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {set.discussionQuestions.map((q, i) => (
            <li key={i} className="text-sm text-cyan-100/80">
              <span className="mr-1.5 text-cyan-200/40">{i + 1}.</span>
              {q}
            </li>
          ))}
        </ol>
      </HudPanel>
    </div>
  );
}

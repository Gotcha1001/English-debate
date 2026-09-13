"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { WordRelationCard } from "@/app/components/WordRelationCard";
import { HudPanel, HudLabel } from "@/app/components/HudPanel";

export default function WordRelationSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.wordRelationsData.getWordRelationSet, {
    id: params.id as Id<"wordRelationSets">,
  });
  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Loading word relation set...
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Word relation set not found.
      </p>
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-16">
      <header className="mb-2">
        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
          Word Relations
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
          {set.topic}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-cyan-200/40">
          {set.groups.length} words &middot; {set.discussionQuestions.length}{" "}
          discussion questions
        </p>
      </header>
      {set.groups.map((group, i) => (
        <WordRelationCard key={i} index={i} data={group} />
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

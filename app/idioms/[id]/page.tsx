"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { IdiomOriginCard } from "@/app/components/IdiomOriginCard";
import { MakeAChoiceCard } from "@/app/components/MakeAChoiceCard";
import { WhereYouStandCard } from "@/app/components/WhereYouStandCard";
import { HudPanel } from "@/app/components/HudPanel";

export default function IdiomSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.idiomsData.getIdiomSet, {
    id: params.id as Id<"idiomSets">,
  });
  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Loading idiom lesson...
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Idiom lesson not found.
      </p>
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-16">
      <header className="mb-2">
        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
          Idioms
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
          {set.idiom}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-cyan-200/40">
          {set.topic}
        </p>
      </header>
      <HudPanel className="p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-300/70">
          Today&apos;s Goal
        </p>
        <p className="text-cyan-50">{set.goal}</p>
      </HudPanel>
      <IdiomOriginCard
        idiom={set.idiom}
        origin={set.origin}
        example={set.example}
        relatedExpressions={set.relatedExpressions}
      />
      <MakeAChoiceCard prompt={set.choicePrompt} pairs={set.choicePairs} />
      <WhereYouStandCard
        scaleLabels={set.standScaleLabels}
        questions={set.standQuestions}
      />
    </div>
  );
}

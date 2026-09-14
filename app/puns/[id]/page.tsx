"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PunCard } from "@/app/components/PunCard";
import { HudPanel, HudLabel } from "@/app/components/HudPanel";

export default function PunSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.punsData.getPunSet, {
    id: params.id as Id<"punSets">,
  });

  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Loading puns...
      </p>
    );
  }

  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Pun set not found.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-16">
      <header className="mb-2">
        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
          Pun Lab
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
          {set.topic}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-cyan-200/40">
          {set.puns.length} puns &middot; tap each one to reveal the punchline
        </p>
      </header>

      <div className="space-y-2">
        {set.puns.map((pun, i) => (
          <PunCard
            key={i}
            index={i}
            setup={pun.setup}
            punchline={pun.punchline}
            distractors={pun.distractors}
            explanation={pun.explanation}
            groanRating={pun.groanRating}
          />
        ))}
      </div>

      <HudPanel className="p-5">
        <HudLabel>Talk about it</HudLabel>
        <ol className="space-y-2">
          {set.discussionQuestions.map((question, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="shrink-0 font-mono text-xs tabular-nums text-cyan-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-cyan-50">{question}</span>
            </li>
          ))}
        </ol>
      </HudPanel>
    </div>
  );
}

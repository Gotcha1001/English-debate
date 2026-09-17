"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PunCard } from "@/app/components/PunCard";
import { HudPanel, HudLabel } from "@/app/components/HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { MatrixBackground } from "@/app/components/MatrixBackground";

export default function PunSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.punsData.getPunSet, {
    id: params.id as Id<"punSets">,
  });
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Loading puns...
      </p>
    );
  }

  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Pun set not found.
      </p>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 mx-auto max-w-3xl space-y-5 pb-16">
        <header className="mb-2">
          <p className="text-sm font-medium" style={{ color: hex400 }}>
            Pun Lab
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
            {set.topic}
          </h1>
          <p
            className="mt-1 text-sm text-slate-500"
            style={{ color: `${shades[300]}66` }}
          >
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
                <span
                  className="shrink-0 font-mono text-xs tabular-nums"
                  style={{ color: hex400 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-stone-50">{question}</span>
              </li>
            ))}
          </ol>
        </HudPanel>
      </div>
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PunCard } from "@/app/components/PunCard";
import { HudPanel, HudLabel } from "@/app/components/HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { LessonHeader } from "@/app/components/LessonHeader";
import { usePunHeader } from "@/hooks/usePunHeader";

/** Append an alpha channel (0-1) to a #rrggbb hex color. */
function alpha(hex: string, a: number) {
  const v = Math.round(a * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${v}`;
}

export default function PunSetPage() {
  const params = useParams<{ id: string }>();
  const setId = params.id as Id<"punSets">;
  const set = useQuery(api.punsData.getPunSet, { id: setId });
  // Must sit above the early returns below (rules of hooks).
  const header = usePunHeader(setId);
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

          {/* Themed glow around the neutral header card, same treatment as
              the other set pages. `get` only returns sets the signed-in
              user owns, so anyone who can see this page can edit it. */}
          <div
            className="mt-3 rounded-2xl"
            style={{
              boxShadow: `0 0 0 1px ${alpha(hex400, 0.35)}, 0 0 40px -10px ${alpha(hex400, 0.45)}`,
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

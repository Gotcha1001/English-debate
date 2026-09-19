"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { IdiomOriginCard } from "@/app/components/IdiomOriginCard";
import { MakeAChoiceCard } from "@/app/components/MakeAChoiceCard";
import { WhereYouStandCard } from "@/app/components/WhereYouStandCard";
import { HudPanel } from "@/app/components/HudPanel";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { LessonHeader } from "@/app/components/LessonHeader";
import { useIdiomHeader } from "@/hooks/useIdiomHeader";

export default function IdiomSetPage() {
  const params = useParams<{ id: string }>();
  const setId = params.id as Id<"idiomSets">;
  const set = useQuery(api.idiomsData.getIdiomSet, { id: setId });
  // Must sit above the early returns below (rules of hooks).
  const header = useIdiomHeader(setId);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Loading idiom lesson...
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Idiom lesson not found.
      </p>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />

      <div className="relative z-10 mx-auto max-w-3xl space-y-5 pb-16">
        {/* A <div>, not <header>: <LessonHeader> renders its own <header>
            and headers can't nest. */}
        <div className="mb-2">
          <p className="text-sm font-medium" style={{ color: hex400 }}>
            Idioms
          </p>
          {/* Themed glow around the header card. `getIdiomSet` only returns
              sets the signed-in user owns, so anyone who can see this page
              can edit it. */}
          <div
            className="mt-3 rounded-2xl"
            style={{
              boxShadow: `0 0 0 1px ${hex400}59, 0 0 40px -10px ${hex400}73`,
            }}
          >
            <LessonHeader
              title={set.idiom}
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
            {set.topic}
          </p>
        </div>

        <HudPanel className="p-5">
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-wide"
            style={{ color: `${hex400}b3` }}
          >
            Today&apos;s Goal
          </p>
          <p className="text-stone-50">{set.goal}</p>
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
    </div>
  );
}

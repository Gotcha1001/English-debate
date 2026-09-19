"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SynonymSpectrumCard } from "@/app/components/SynonymSpectrumCard";
import { HudPanel, HudLabel } from "@/app/components/HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { LessonHeader } from "@/app/components/LessonHeader";
import { useSynonymHeader } from "@/hooks/useSynonymHeader";

export default function SynonymSetPage() {
  const params = useParams<{ id: string }>();
  const setId = params.id as Id<"synonymSets">;
  const set = useQuery(api.synonymsData.getSynonymSet, { id: setId });
  // Must sit above the early returns below (rules of hooks).
  const header = useSynonymHeader(setId);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  if (set === undefined) {
    return (
      <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <MatrixBackground />
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="text-sm text-slate-500 dark:text-stone-500">
            Loading synonym set...
          </p>
        </div>
      </div>
    );
  }
  if (set === null) {
    return (
      <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <MatrixBackground />
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="text-sm text-slate-500 dark:text-stone-500">
            Synonym set not found.
          </p>
        </div>
      </div>
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
            Synonym Spectrum
          </p>
          {/* Themed glow around the header card. `getSynonymSet` only
              returns sets the signed-in user owns, so anyone who can see
              this page can edit it. */}
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
            {set.groups.length} spectrums &middot;{" "}
            {set.discussionQuestions.length} discussion questions
          </p>
        </div>

        {set.groups.map((group, i) => (
          <SynonymSpectrumCard key={i} index={i} data={group} />
        ))}

        <HudPanel className="p-5">
          <HudLabel>
            Discussion questions ({set.discussionQuestions.length})
          </HudLabel>
          <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {set.discussionQuestions.map((q, i) => (
              <li key={i} className="text-sm text-stone-200/80">
                <span className="mr-1.5" style={{ color: `${shades[300]}66` }}>
                  {i + 1}.
                </span>
                {q}
              </li>
            ))}
          </ol>
        </HudPanel>
      </div>
    </div>
  );
}

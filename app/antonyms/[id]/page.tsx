"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AntonymMatchGame } from "@/app/components/AntonymMatchGame";
import { AntonymAnalogyCard } from "@/app/components/AntonymAnalogyCard";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { LessonHeader } from "@/app/components/LessonHeader";
import { useAntonymHeader } from "@/hooks/useAntonymHeader";

export default function AntonymSetPage() {
  const params = useParams<{ id: string }>();
  const setId = params.id as Id<"antonymSets">;
  const set = useQuery(api.antonymsData.getAntonymSet, { id: setId });
  // Must sit above the early returns below (rules of hooks).
  const header = useAntonymHeader(setId);
  // Only used for the header's glow; the rest of this page still uses its
  // own fixed cyan classes.
  const { theme } = useColorTheme();
  const { hex400 } = theme;

  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Loading antonym set...
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-cyan-200/50">
        Antonym set not found.
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
          <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
            Antonym Match
          </p>
          {/* Themed glow around the header card. `getAntonymSet` only
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
          <p className="mt-3 text-sm text-slate-500 dark:text-cyan-200/40">
            {set.pairs.length} pairs &middot; {set.analogies.length} analogies
          </p>
        </div>

        <AntonymMatchGame pairs={set.pairs} />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-cyan-100/90">
            Complete the Analogy
          </h2>
          {set.analogies.map((analogy, i) => (
            <AntonymAnalogyCard
              key={i}
              index={i}
              pairs={set.pairs}
              data={analogy}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

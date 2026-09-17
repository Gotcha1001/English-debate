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

export default function IdiomSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.idiomsData.getIdiomSet, {
    id: params.id as Id<"idiomSets">,
  });
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
        <header className="mb-2">
          <p className="text-sm font-medium" style={{ color: hex400 }}>
            Idioms
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
            {set.idiom}
          </h1>
          <p
            className="mt-1 text-sm text-slate-500"
            style={{ color: `${shades[300]}66` }}
          >
            {set.topic}
          </p>
        </header>
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

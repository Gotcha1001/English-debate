"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { WordRelationCard } from "@/app/components/WordRelationCard";
import { HudPanel, HudLabel } from "@/app/components/HudPanel";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { useColorTheme } from "@/app/context/ColorThemeContext";

export default function WordRelationSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.wordRelationsData.getWordRelationSet, {
    id: params.id as Id<"wordRelationSets">,
  });
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Loading word relation set...
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Word relation set not found.
      </p>
    );
  }
  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 mx-auto max-w-3xl space-y-5 pb-16">
        <header className="mb-2">
          <p className="text-sm font-medium" style={{ color: hex400 }}>
            Word Relations
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
            {set.topic}
          </h1>
          <p
            className="mt-1 text-sm text-slate-500"
            style={{ color: `${shades[300]}66` }}
          >
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

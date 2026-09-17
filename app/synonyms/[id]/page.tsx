"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SynonymSpectrumCard } from "@/app/components/SynonymSpectrumCard";
import { HudPanel, HudLabel } from "@/app/components/HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { MatrixBackground } from "@/app/components/MatrixBackground";

export default function SynonymSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.synonymsData.getSynonymSet, {
    id: params.id as Id<"synonymSets">,
  });
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
        <header className="mb-2">
          <p className="text-sm font-medium" style={{ color: hex400 }}>
            Synonym Spectrum
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
            {set.topic}
          </h1>
          <p
            className="mt-1 text-sm text-slate-500"
            style={{ color: `${shades[300]}66` }}
          >
            {set.groups.length} spectrums &middot;{" "}
            {set.discussionQuestions.length} discussion questions
          </p>
        </header>
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

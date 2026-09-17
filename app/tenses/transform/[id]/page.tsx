"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TenseConversionCard } from "@/app/components/Tenseconversioncard";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { useColorTheme } from "@/app/context/ColorThemeContext";

export default function TenseConversionSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.tenseConversionData.getTenseConversionSet, {
    id: params.id as Id<"tenseConversionSets">,
  });
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Loading set...
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Set not found.
      </p>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 mx-auto max-w-3xl space-y-5 pb-16">
        <header className="mb-2">
          <p className="text-sm font-medium" style={{ color: hex400 }}>
            Transform the Tense
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
            {set.topic}
          </h1>
          <p
            className="mt-1 text-sm text-slate-500"
            style={{ color: `${shades[300]}66` }}
          >
            {set.sentences.length} sentences to convert
          </p>
        </header>
        {set.sentences.map((sentence, i) => (
          <TenseConversionCard key={i} index={i} data={sentence} />
        ))}
      </div>
    </div>
  );
}

"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AntonymMatchGame } from "@/app/components/AntonymMatchGame";
import { AntonymAnalogyCard } from "@/app/components/AntonymAnalogyCard";

export default function AntonymSetPage() {
  const params = useParams<{ id: string }>();
  const set = useQuery(api.antonymsData.getAntonymSet, {
    id: params.id as Id<"antonymSets">,
  });
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
    <div className="mx-auto max-w-3xl space-y-5 pb-16">
      <header className="mb-2">
        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
          Antonym Match
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
          {set.topic}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-cyan-200/40">
          {set.pairs.length} pairs &middot; {set.analogies.length} analogies
        </p>
      </header>
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
  );
}

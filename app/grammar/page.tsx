"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { SpellCheck, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useGrammarGenerator } from "@/hooks/useGrammarGenerator";
import { useDeleteSet } from "@/hooks/useDeleteSet";
import { LessonGeneratingModal } from "@/app/components/Lessonsgeneratingmodal";
import { HudPanel } from "@/app/components/HudPanel";
import { DeleteButton } from "@/app/components/DeleteButton";
import { SearchBar } from "../components/SearchBar";

export default function GrammarBreakdownPage() {
  const [topic, setTopic] = useState("");
  const [search, setSearch] = useState("");
  const { generateGrammarSet, isGenerating, error } = useGrammarGenerator();
  const pastSets = useQuery(api.grammarData.listMyGrammarSets);
  const { deleteItem, deletingId } = useDeleteSet(
    api.grammarData.deleteGrammarSet,
    "grammar breakdown",
  );

  const filteredSets = pastSets?.filter((set) =>
    set.topic.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    void generateGrammarSet(topic);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* If you add a "grammar" entry to LessonGeneratingModal's COPY map
          (see note below), switch this to variant="grammar". Falls back
          to the existing lesson copy/steps until then. */}
      <LessonGeneratingModal open={isGenerating} variant="lesson" />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
          Grammar Breakdown
        </h1>
        <p className="mt-2 max-w-xl text-slate-600 dark:text-cyan-200/60">
          Get 5 example sentences on any topic, a word-by-word parts-of-speech
          breakdown, and a 5-question reveal-the-answer quiz for each one.
        </p>
      </header>

      <HudPanel className="p-5">
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="grammar-topic"
            className="mb-2 block text-sm font-medium text-cyan-100/80"
          >
            Topic{" "}
            <span className="font-normal text-cyan-200/40">(optional)</span>
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="grammar-topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. cooking, weekend plans... or leave blank"
              className="flex-1 rounded-lg border border-cyan-400/20 bg-[#0a1219] px-4 py-2.5 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-[#04070a] transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Breaking it down..." : "Generate breakdown"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </form>
      </HudPanel>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-cyan-100/90">
          Your grammar breakdowns
        </h2>
        <SearchBar value={search} onChange={setSearch} />
        {pastSets === undefined && (
          <p className="text-sm text-slate-500 dark:text-cyan-200/50">
            Loading...
          </p>
        )}
        {pastSets?.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-cyan-200/50">
            No breakdowns yet -- generate your first one above.
          </p>
        )}
        <ul className="space-y-2">
          {filteredSets?.map((set) => (
            <li key={set._id} className="flex items-center gap-2">
              <Link
                href={`/grammar/${set._id}`}
                className="flex flex-1 items-center justify-between rounded-lg border border-cyan-400/10 bg-[#0a1219] px-4 py-3 text-sm transition hover:border-cyan-400/40"
              >
                <span className="flex items-center gap-2 font-medium text-cyan-50">
                  <SpellCheck className="h-4 w-4 text-cyan-400" />
                  {set.topic}
                </span>
                <span className="text-xs text-cyan-200/40">
                  {new Date(set.createdAt).toLocaleDateString()}
                </span>
              </Link>
              <DeleteButton
                label="Delete grammar breakdown"
                isDeleting={deletingId === set._id}
                onDelete={() => deleteItem({ id: set._id })}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

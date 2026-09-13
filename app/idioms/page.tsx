"use client";
import { useState, type FormEvent } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Quote, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useIdiomsGenerator } from "@/hooks/useIdiomsGenerator";
import { useDeleteSet } from "@/hooks/useDeleteSet";
import { LessonGeneratingModal } from "@/app/components/Lessonsgeneratingmodal";
import { HudPanel } from "@/app/components/HudPanel";
import { DeleteButton } from "@/app/components/DeleteButton";
import { SearchBar } from "../components/SearchBar";

export default function IdiomsPage() {
  const [topic, setTopic] = useState("");
  const [search, setSearch] = useState("");
  const { generateIdiomSet, isGenerating, error } = useIdiomsGenerator();
  const pastSets = useQuery(api.idiomsData.listMyIdiomSets);
  const { deleteItem, deletingId } = useDeleteSet(
    api.idiomsData.deleteIdiomSet,
    "idiom lesson",
  );
  const filteredSets = pastSets?.filter(
    (set) =>
      set.topic.toLowerCase().includes(search.toLowerCase()) ||
      set.idiom.toLowerCase().includes(search.toLowerCase()),
  );
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    void generateIdiomSet(topic);
  };
  return (
    <div className="mx-auto max-w-3xl">
      <LessonGeneratingModal open={isGenerating} variant="idioms" />
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
          Idioms
        </h1>
        <p className="mt-2 max-w-xl text-slate-600 dark:text-cyan-200/60">
          Get one idiom connected to any topic, its origin, related expressions,
          a &ldquo;make a choice&rdquo; discussion, and a &ldquo;where do you
          stand&rdquo; scale.
        </p>
      </header>
      <HudPanel className="p-5">
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="idiom-topic"
            className="mb-2 block text-sm font-medium text-cyan-100/80"
          >
            Topic{" "}
            <span className="font-normal text-cyan-200/40">(optional)</span>
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="idiom-topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. privacy, money, friendship... or leave blank"
              className="flex-1 rounded-lg border border-cyan-400/20 bg-[#0a1219] px-4 py-2.5 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-[#04070a] transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Finding an idiom..." : "Generate idiom lesson"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </form>
      </HudPanel>
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-cyan-100/90">
          Your idiom lessons
        </h2>
        <SearchBar value={search} onChange={setSearch} />
        {pastSets === undefined && (
          <p className="text-sm text-slate-500 dark:text-cyan-200/50">
            Loading...
          </p>
        )}
        {pastSets?.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-cyan-200/50">
            No idiom lessons yet -- generate your first one above.
          </p>
        )}
        <ul className="space-y-2">
          {filteredSets?.map((set) => (
            <li key={set._id} className="flex items-center gap-2">
              <Link
                href={`/idioms/${set._id}`}
                className="flex flex-1 items-center justify-between rounded-lg border border-cyan-400/10 bg-[#0a1219] px-4 py-3 text-sm transition hover:border-cyan-400/40"
              >
                <span className="flex items-center gap-2 font-medium text-cyan-50">
                  <Quote className="h-4 w-4 text-cyan-400" />
                  {set.idiom}
                  <span className="font-normal text-cyan-200/40">
                    &middot; {set.topic}
                  </span>
                </span>
                <span className="text-xs text-cyan-200/40">
                  {new Date(set.createdAt).toLocaleDateString()}
                </span>
              </Link>
              <DeleteButton
                label="Delete idiom lesson"
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

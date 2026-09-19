"use client";
import { useState, type FormEvent } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { GitCompare, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useWordRelationsGenerator } from "@/hooks/useWordRelationsGenerator";
import { useDeleteSet, useDeleteSetAction } from "@/hooks/useDeleteSet";
import { LessonGeneratingModal } from "@/app/components/Lessonsgeneratingmodal";
import { HudPanel } from "@/app/components/HudPanel";
import { DeleteButton } from "@/app/components/DeleteButton";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { SearchBar } from "../components/SearchBar";

export default function WordRelationsPage() {
  const [topic, setTopic] = useState("");
  const [search, setSearch] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const { generateWordRelationSet, isGenerating, error } =
    useWordRelationsGenerator();
  const pastSets = useQuery(api.wordRelationsData.listMyWordRelationSets);
  const { deleteItem, deletingId } = useDeleteSetAction(
    api.wordRelationsActions.deleteWordRelationSet,
    "word relation set",
  );
  const filteredSets = pastSets?.filter((set) =>
    set.topic.toLowerCase().includes(search.toLowerCase()),
  );
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    void generateWordRelationSet(topic);
  };
  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 mx-auto max-w-3xl">
        <LessonGeneratingModal open={isGenerating} variant="wordRelations" />
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
            Word Relations
          </h1>
          <p className="mt-2 max-w-xl text-slate-600 dark:text-stone-400">
            For each word, choose its synonym, choose its antonym, then debate
            how the two really compare -- plus a set of general discussion
            questions on the topic.
          </p>
        </header>
        <HudPanel className="p-5">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="relation-topic"
              className="mb-2 block text-sm font-medium text-stone-200/80"
            >
              Topic{" "}
              <span
                className="font-normal"
                style={{ color: `${shades[300]}66` }}
              >
                (optional)
              </span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="relation-topic"
                name="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="e.g. personality, emotions... or leave blank"
                className="flex-1 rounded-lg bg-[#0a1219] px-4 py-2.5 text-stone-50 outline-none transition"
                style={{
                  border: `1px solid ${hex400}33`,
                  boxShadow: inputFocused ? `0 0 0 2px ${hex400}33` : "none",
                  borderColor: inputFocused ? hex400 : `${hex400}33`,
                }}
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-[#04070a] transition disabled:opacity-50"
                style={{ backgroundColor: shades[500] }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = hex400;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = shades[500];
                }}
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating
                  ? "Comparing word relations..."
                  : "Generate word relations"}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </form>
        </HudPanel>
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-stone-100">
            Your word relation sets
          </h2>
          <SearchBar value={search} onChange={setSearch} />
          {pastSets === undefined && (
            <p className="text-sm text-slate-500 dark:text-stone-500">
              Loading...
            </p>
          )}
          {pastSets?.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-stone-500">
              No sets yet -- generate your first one above.
            </p>
          )}
          <ul className="space-y-2">
            {filteredSets?.map((set) => (
              <li key={set._id} className="flex items-center gap-2">
                <Link
                  href={`/word-relations/${set._id}`}
                  className="flex flex-1 items-center justify-between rounded-lg bg-[#0a1219] px-4 py-3 text-sm transition"
                  style={{ border: `1px solid ${hex400}1a` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${hex400}66`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${hex400}1a`;
                  }}
                >
                  <span className="flex items-center gap-2 font-medium text-stone-50">
                    <GitCompare className="h-4 w-4" style={{ color: hex400 }} />
                    {set.topic}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: `${shades[300]}66` }}
                  >
                    {new Date(set.createdAt).toLocaleDateString()}
                  </span>
                </Link>
                <DeleteButton
                  label="Delete word relation set"
                  isDeleting={deletingId === set._id}
                  onDelete={() => deleteItem({ id: set._id })}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

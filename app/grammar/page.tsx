"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { GraduationCap, SpellCheck, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useGrammarGenerator } from "@/hooks/useGrammarGenerator";
import { useDeleteSet, useDeleteSetAction } from "@/hooks/useDeleteSet";
import { LessonGeneratingModal } from "@/app/components/Lessonsgeneratingmodal";
import { HudPanel } from "@/app/components/HudPanel";
import { DeleteButton } from "@/app/components/DeleteButton";
import { PartsOfSpeechGuide } from "@/app/components/Partsofspeechguide";
import { SearchBar } from "../components/SearchBar";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { MatrixBackground } from "@/app/components/MatrixBackground";

export default function GrammarBreakdownPage() {
  const [topic, setTopic] = useState("");
  const [search, setSearch] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const { generateGrammarSet, isGenerating, error } = useGrammarGenerator();
  const pastSets = useQuery(api.grammarData.listMyGrammarSets);
  const { deleteItem, deletingId } = useDeleteSetAction(
    api.grammarActions.deleteGrammarSet,
    "grammar breakdown",
  );
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  const filteredSets = pastSets?.filter((set) =>
    set.topic.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    void generateGrammarSet(topic);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 mx-auto max-w-3xl">
        {/* If you add a "grammar" entry to LessonGeneratingModal's COPY map
            (see note below), switch this to variant="grammar". Falls back
            to the existing lesson copy/steps until then. */}
        <LessonGeneratingModal open={isGenerating} variant="lesson" />
        <PartsOfSpeechGuide open={guideOpen} onOpenChange={setGuideOpen} />

        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
              Grammar Breakdown
            </h1>
            <p className="mt-2 max-w-xl text-slate-600 dark:text-stone-400">
              Get 5 example sentences on any topic, a word-by-word
              parts-of-speech breakdown, and a 5-question reveal-the-answer quiz
              for each one.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
            style={{
              borderColor: `${hex400}4d`,
              backgroundColor: `${hex400}1a`,
              color: shades[300],
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${hex400}99`;
              e.currentTarget.style.backgroundColor = `${hex400}33`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${hex400}4d`;
              e.currentTarget.style.backgroundColor = `${hex400}1a`;
            }}
          >
            <GraduationCap className="h-4 w-4" />
            Let&apos;s learn how
          </button>
        </header>

        <HudPanel className="p-5">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="grammar-topic"
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
                id="grammar-topic"
                name="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. cooking, weekend plans... or leave blank"
                className="flex-1 rounded-lg border bg-[#0a1219] px-4 py-2.5 text-stone-50 outline-none transition-colors"
                style={{ borderColor: `${hex400}33` }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = hex400;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${hex400}33`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${hex400}33`;
                  e.currentTarget.style.boxShadow = "none";
                }}
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-[#04070a] transition disabled:opacity-50"
                style={{
                  backgroundColor: shades[500],
                  boxShadow: `0 0 20px -6px ${hex400}80`,
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating) {
                    e.currentTarget.style.backgroundColor = hex400;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = shades[500];
                }}
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? "Breaking it down..." : "Generate breakdown"}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </form>
        </HudPanel>

        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-stone-100">
            Your grammar breakdowns
          </h2>
          <SearchBar value={search} onChange={setSearch} />
          {pastSets === undefined && (
            <p className="text-sm text-slate-500 dark:text-stone-500">
              Loading...
            </p>
          )}
          {pastSets?.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-stone-500">
              No breakdowns yet -- generate your first one above.
            </p>
          )}
          <ul className="space-y-2">
            {filteredSets?.map((set) => (
              <li key={set._id} className="flex items-center gap-2">
                <Link
                  href={`/grammar/${set._id}`}
                  className="flex flex-1 items-center justify-between rounded-lg border bg-[#0a1219] px-4 py-3 text-sm transition"
                  style={{ borderColor: `${hex400}1a` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${hex400}66`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${hex400}1a`;
                  }}
                >
                  <span className="flex items-center gap-2 font-medium text-stone-50">
                    <SpellCheck className="h-4 w-4" style={{ color: hex400 }} />
                    {set.topic}
                  </span>
                  <span className="text-xs text-stone-500">
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
    </div>
  );
}

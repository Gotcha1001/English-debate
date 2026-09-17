"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { ListChecks, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useQuickQuestionsGenerator } from "@/hooks/useQuickQuestionsGenerator";
import { useDeleteSet } from "@/hooks/useDeleteSet";
import { LessonGeneratingModal } from "@/app/components/Lessonsgeneratingmodal";
import { HudPanel } from "@/app/components/HudPanel";
import { DeleteButton } from "@/app/components/DeleteButton";
import { SearchBar } from "../components/SearchBar";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { MatrixBackground } from "@/app/components/MatrixBackground";

export default function QuickQuestionsPage() {
  const [topic, setTopic] = useState("");
  const [search, setSearch] = useState("");
  const { generateQuickQuestionSet, isGenerating, error } =
    useQuickQuestionsGenerator();
  const pastSets = useQuery(api.quickQuestionsData.listMyQuickQuestionSets);
  const { deleteItem, deletingId } = useDeleteSet(
    api.quickQuestionsData.deleteQuickQuestionSet,
    "question set",
  );
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  const filteredLessons = pastSets?.filter((lesson) =>
    lesson.topic.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    void generateQuickQuestionSet(topic);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 mx-auto max-w-3xl">
        <LessonGeneratingModal open={isGenerating} variant="debate" />
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-stone-50">40 Questions</h1>
          <p className="mt-2 max-w-xl text-stone-400">
            Skip the story --- just get 40 quick, easy questions on any topic
            for a fast speaking warm-up.
          </p>
        </header>
        <HudPanel className="p-5">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="quick-topic"
              className="mb-2 block text-sm font-medium text-stone-200/80"
            >
              Topic
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="quick-topic"
                name="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. weekend plans, coffee habits, pets..."
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
                {isGenerating
                  ? "Writing questions..."
                  : "Generate 40 questions"}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </form>
        </HudPanel>
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-stone-100">
            Your question sets
          </h2>

          <SearchBar value={search} onChange={setSearch} />
          {pastSets === undefined && (
            <p className="text-sm text-stone-500">Loading...</p>
          )}
          {pastSets?.length === 0 && (
            <p className="text-sm text-stone-500">
              No sets yet --- generate your first one above.
            </p>
          )}
          <ul className="space-y-2">
            {filteredLessons?.map((set) => (
              <li key={set._id} className="flex items-center gap-2">
                <Link
                  href={`/quick-questions/${set._id}`}
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
                    <ListChecks className="h-4 w-4" style={{ color: hex400 }} />
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
                  label="Delete question set"
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

// app/top-news/page.tsx

"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Newspaper, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useTopNewsGenerator } from "@/hooks/useTopNewsGenerator";
import { useDeleteSetAction } from "@/hooks/useDeleteSet";
import { LessonGeneratingModal } from "@/app/components/Lessonsgeneratingmodal";
import { HudPanel } from "@/app/components/HudPanel";
import { DeleteButton } from "@/app/components/DeleteButton";
import { SearchBar } from "../components/SearchBar";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { MatrixBackground } from "@/app/components/MatrixBackground";

export default function TopNewsPage() {
  const [search, setSearch] = useState("");
  const { generateTopNewsLesson, isGenerating, error } = useTopNewsGenerator();
  const pastLessons = useQuery(api.topNewsData.listMyTopNewsLessons);
  const { deleteItem, deletingId } = useDeleteSetAction(
    api.topNewsActions.deleteTopNewsLesson,
    "news lesson",
  );
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  const filteredLessons = pastLessons?.filter((lesson) =>
    lesson.headline.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 mx-auto max-w-3xl">
        <LessonGeneratingModal open={isGenerating} variant="topNews" />
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
            Top News
          </h1>
          <p className="mt-2 max-w-xl text-slate-600 dark:text-stone-400">
            Pulls today&apos;s top news story and turns it into a reading lesson
            --- comprehension questions, difficult words explained, and
            discussion questions about the real issue behind the story.
          </p>
        </header>

        <HudPanel className="p-5">
          <p className="mb-3 text-sm text-stone-200/80">
            No topic to type --- this generates a fresh lesson from whatever is
            leading the news right now.
          </p>
          <button
            type="button"
            onClick={() => {
              if (isGenerating) return;
              void generateTopNewsLesson();
            }}
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
              ? "Fetching today's news..."
              : "Get today's news lesson"}
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </HudPanel>

        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-stone-100">
            Your news lessons
          </h2>
          <SearchBar value={search} onChange={setSearch} />
          {pastLessons === undefined && (
            <p className="text-sm text-slate-500 dark:text-stone-500">
              Loading...
            </p>
          )}
          {pastLessons?.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-stone-500">
              No lessons yet --- generate your first one above.
            </p>
          )}
          <ul className="space-y-2">
            {filteredLessons?.map((lesson) => (
              <li key={lesson._id} className="flex items-center gap-2">
                <Link
                  href={`/top-news/${lesson._id}`}
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
                    <Newspaper className="h-4 w-4" style={{ color: hex400 }} />
                    {lesson.headline}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: `${shades[300]}66` }}
                  >
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </span>
                </Link>
                <DeleteButton
                  label="Delete news lesson"
                  isDeleting={deletingId === lesson._id}
                  onDelete={() => deleteItem({ id: lesson._id })}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

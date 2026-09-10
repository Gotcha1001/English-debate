"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { BookOpen, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useLessonGenerator } from "@/hooks/useLessonGenerator";
import { LessonGeneratingModal } from "@/app/components/Lessonsgeneratingmodal";
import { HudPanel } from "@/app/components/HudPanel";
import { SearchBar } from "../components/SearchBar";

export default function FreeTalkingPage() {
  const [topic, setTopic] = useState("");
  const [search, setSearch] = useState("");
  const { generateLesson, isGenerating, error } = useLessonGenerator();
  const pastLessons = useQuery(api.lessonData.listMyLessons);

  const filteredLessons = pastLessons?.filter((lesson) =>
    lesson.topic.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    void generateLesson(topic);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <LessonGeneratingModal open={isGenerating} variant="lesson" />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-50">
          Free Talking lesson generator
        </h1>
        <p className="mt-2 max-w-xl text-slate-600 dark:text-cyan-200/60">
          Give it a topic — or leave it blank and let it pick one — and it
          builds a full worksheet: a short story, comprehension questions,
          multiple choice, tricky vocabulary, 50 discussion questions, and a
          quick sentence-structure breakdown.
        </p>
      </header>

      <HudPanel className="p-5">
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="topic"
            className="mb-2 block text-sm font-medium text-cyan-100/80"
          >
            Topic
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. weekend plans, first jobs, favorite foods…"
              className="flex-1 rounded-lg border border-cyan-400/20 bg-[#0a1219] px-4 py-2.5 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              disabled={isGenerating}
            />
            <Button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-[#04070a] transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? "Writing your lesson…" : "Generate lesson"}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => {
              setTopic("");
              if (!isGenerating) void generateLesson("");
            }}
            disabled={isGenerating}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-cyan-200/50 hover:text-cyan-400 disabled:opacity-50"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Surprise me with a topic
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </form>
      </HudPanel>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-cyan-100/90">
          Your lessons
        </h2>

        <SearchBar value={search} onChange={setSearch} />

        {pastLessons === undefined && (
          <p className="text-sm text-slate-500 dark:text-cyan-200/50">
            Loading…
          </p>
        )}
        {pastLessons?.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-cyan-200/50">
            No lessons yet — generate your first one above.
          </p>
        )}
        <ul className="space-y-2">
          {filteredLessons?.map((lesson) => (
            <li key={lesson._id}>
              <Link
                href={`/free-talking/${lesson._id}`}
                className="flex items-center justify-between rounded-lg border border-cyan-400/10 bg-[#0a1219] px-4 py-3 text-sm transition hover:border-cyan-400/40"
              >
                <span className="flex items-center gap-2 font-medium text-cyan-50">
                  <BookOpen className="h-4 w-4 text-cyan-400" />
                  {lesson.topic}
                </span>
                <span className="text-xs text-cyan-200/40">
                  {new Date(lesson.createdAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

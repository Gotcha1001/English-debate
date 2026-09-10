"use client";

// app/dashboard/page.tsx
//
// "My Corner" — the signed-in user's generated lessons and debate sets,
// most recent first. Styling matches the free-talking list section
// (stone neutrals, teal accent, dark-mode variants).

import { useQuery } from "convex/react";
import Link from "next/link";
import { BookOpen, MessagesSquare } from "lucide-react";
import { api } from "@/convex/_generated/api";

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-stone-500 dark:text-stone-400">{message}</p>
  );
}

function LoadingState() {
  return <p className="text-sm text-stone-500 dark:text-stone-400">Loading…</p>;
}

export default function DashboardPage() {
  const lessons = useQuery(api.lessonData.listMyLessons);
  const debateSets = useQuery(api.debateData.listMyDebateSets);

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <header>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50">
          My Corner
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Everything you&apos;ve generated, in one place.
        </p>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
            Free Talking lessons
          </h2>
          <Link
            href="/free-talking"
            className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
          >
            New lesson
          </Link>
        </div>

        {lessons === undefined && <LoadingState />}
        {lessons?.length === 0 && (
          <EmptyState message="No lessons yet — generate your first one." />
        )}

        <ul className="space-y-2">
          {lessons?.map((lesson) => (
            <li key={lesson._id}>
              <Link
                href={`/free-talking/${lesson._id}`}
                className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm transition hover:border-teal-600/40 hover:bg-teal-50/50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800/60"
              >
                <span className="flex items-center gap-2 font-medium text-stone-800 dark:text-stone-200">
                  <BookOpen className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  {lesson.topic}
                </span>
                <span className="text-xs text-stone-400">
                  {new Date(lesson.createdAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
            Debate &amp; Discussion sets
          </h2>
          <Link
            href="/debate"
            className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
          >
            New set
          </Link>
        </div>

        {debateSets === undefined && <LoadingState />}
        {debateSets?.length === 0 && (
          <EmptyState message="No debate sets yet — generate your first one." />
        )}

        <ul className="space-y-2">
          {debateSets?.map((set) => (
            <li key={set._id}>
              <Link
                href={`/debate/${set._id}`}
                className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm transition hover:border-teal-600/40 hover:bg-teal-50/50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800/60"
              >
                <span className="flex items-center gap-2 font-medium text-stone-800 dark:text-stone-200">
                  <MessagesSquare className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  {set.topic}
                </span>
                <span className="text-xs text-stone-400">
                  {new Date(set.createdAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

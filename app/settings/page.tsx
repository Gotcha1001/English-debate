"use client";

// app/settings/page.tsx
//
// Account info comes straight from Clerk (read-only here, with a link
// into Clerk's own account portal for edits — no need to duplicate
// profile-editing UI/validation Clerk already provides). App preferences
// (theme, default lesson difficulty) are ours to own, stored on the
// Convex `users` row.

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser, useClerk } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { ThemeToggle } from "@/app/components/ThemeToggle";

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

type Difficulty = (typeof DIFFICULTIES)[number]["value"];

export default function SettingsPage() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const me = useQuery(api.user.getMe);
  const updatePreferences = useMutation(api.user.updateMyPreferences);
  const [saving, setSaving] = useState<Difficulty | null>(null);

  const handleDifficultyChange = async (value: Difficulty) => {
    setSaving(value);
    try {
      await updatePreferences({ defaultDifficulty: value });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-16">
      <header>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50">
          Settings
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Manage your account and how new lessons are generated.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-800 dark:text-stone-200">
          Account
        </h2>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex min-w-0 items-center gap-3">
            {user?.imageUrl && (
              // Clerk-hosted avatar URL, not user-uploaded content
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full"
              />
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-stone-800 dark:text-stone-200">
                {user?.fullName ?? user?.username}
              </p>
              <p className="truncate text-sm text-stone-500 dark:text-stone-400">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openUserProfile()}
            className="shrink-0 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-teal-600 hover:text-teal-700 dark:border-stone-700 dark:text-stone-300 dark:hover:text-teal-400"
          >
            Manage account
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-800 dark:text-stone-200">
          Appearance
        </h2>
        <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <div>
            <p className="font-medium text-stone-800 dark:text-stone-200">
              Theme
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Switch between light and dark mode.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-800 dark:text-stone-200">
          Lesson generation
        </h2>
        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <p className="mb-1 font-medium text-stone-800 dark:text-stone-200">
            Default difficulty
          </p>
          <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
            Used automatically the next time you generate a lesson or debate
            set.
          </p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map(({ value, label }) => {
              const isActive = me?.preferences?.defaultDifficulty === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={saving !== null}
                  onClick={() => void handleDifficultyChange(value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                    isActive
                      ? "border-teal-600 bg-teal-50 text-teal-800 dark:border-teal-500 dark:bg-teal-500/10 dark:text-teal-300"
                      : "border-stone-300 text-stone-700 hover:border-teal-600/50 dark:border-stone-700 dark:text-stone-300"
                  }`}
                >
                  {saving === value ? "Saving…" : label}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

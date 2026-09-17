// "use client";

// // app/settings/page.tsx
// //
// // Account info comes straight from Clerk (read-only here, with a link
// // into Clerk's own account portal for edits — no need to duplicate
// // profile-editing UI/validation Clerk already provides). App preferences
// // (theme, default lesson difficulty) are ours to own, stored on the
// // Convex `users` row.

// import { useState } from "react";
// import { useMutation, useQuery } from "convex/react";
// import { useUser, useClerk } from "@clerk/nextjs";
// import { api } from "@/convex/_generated/api";
// import { ThemeToggle } from "@/app/components/ThemeToggle";

// const DIFFICULTIES = [
//   { value: "beginner", label: "Beginner" },
//   { value: "intermediate", label: "Intermediate" },
//   { value: "advanced", label: "Advanced" },
// ] as const;

// type Difficulty = (typeof DIFFICULTIES)[number]["value"];

// export default function SettingsPage() {
//   const { user } = useUser();
//   const { openUserProfile } = useClerk();
//   const me = useQuery(api.user.getMe);
//   const updatePreferences = useMutation(api.user.updateMyPreferences);
//   const [saving, setSaving] = useState<Difficulty | null>(null);

//   const handleDifficultyChange = async (value: Difficulty) => {
//     setSaving(value);
//     try {
//       await updatePreferences({ defaultDifficulty: value });
//     } finally {
//       setSaving(null);
//     }
//   };

//   return (
//     <div className="mx-auto max-w-2xl space-y-10 pb-16">
//       <header>
//         <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50">
//           Settings
//         </h1>
//         <p className="mt-2 text-stone-600 dark:text-stone-400">
//           Manage your account and how new lessons are generated.
//         </p>
//       </header>

//       <section>
//         <h2 className="mb-3 text-lg font-semibold text-stone-800 dark:text-stone-200">
//           Account
//         </h2>
//         <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
//           <div className="flex min-w-0 items-center gap-3">
//             {user?.imageUrl && (
//               // Clerk-hosted avatar URL, not user-uploaded content
//               // eslint-disable-next-line @next/next/no-img-element
//               <img
//                 src={user.imageUrl}
//                 alt=""
//                 className="h-10 w-10 shrink-0 rounded-full"
//               />
//             )}
//             <div className="min-w-0">
//               <p className="truncate font-medium text-stone-800 dark:text-stone-200">
//                 {user?.fullName ?? user?.username}
//               </p>
//               <p className="truncate text-sm text-stone-500 dark:text-stone-400">
//                 {user?.primaryEmailAddress?.emailAddress}
//               </p>
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={() => openUserProfile()}
//             className="shrink-0 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-teal-600 hover:text-teal-700 dark:border-stone-700 dark:text-stone-300 dark:hover:text-teal-400"
//           >
//             Manage account
//           </button>
//         </div>
//       </section>

//       <section>
//         <h2 className="mb-3 text-lg font-semibold text-stone-800 dark:text-stone-200">
//           Appearance
//         </h2>
//         <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
//           <div>
//             <p className="font-medium text-stone-800 dark:text-stone-200">
//               Theme
//             </p>
//             <p className="text-sm text-stone-500 dark:text-stone-400">
//               Switch between light and dark mode.
//             </p>
//           </div>
//           <ThemeToggle />
//         </div>
//       </section>

//       <section>
//         <h2 className="mb-3 text-lg font-semibold text-stone-800 dark:text-stone-200">
//           Lesson generation
//         </h2>
//         <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
//           <p className="mb-1 font-medium text-stone-800 dark:text-stone-200">
//             Default difficulty
//           </p>
//           <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
//             Used automatically the next time you generate a lesson or debate
//             set.
//           </p>
//           <div className="flex flex-wrap gap-2">
//             {DIFFICULTIES.map(({ value, label }) => {
//               const isActive = me?.preferences?.defaultDifficulty === value;
//               return (
//                 <button
//                   key={value}
//                   type="button"
//                   disabled={saving !== null}
//                   onClick={() => void handleDifficultyChange(value)}
//                   className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
//                     isActive
//                       ? "border-teal-600 bg-teal-50 text-teal-800 dark:border-teal-500 dark:bg-teal-500/10 dark:text-teal-300"
//                       : "border-stone-300 text-stone-700 hover:border-teal-600/50 dark:border-stone-700 dark:text-stone-300"
//                   }`}
//                 >
//                   {saving === value ? "Saving…" : label}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import { COLOR_THEME_LIST, type ColorThemeId } from "@/lib/colorThemes";
import { MatrixBackground } from "@/app/components/MatrixBackground";

/** Append an alpha channel (0–1) to a #rrggbb hex color, e.g. alpha("#22d3ee", 0.4) -> "#22d3ee66" */
function alpha(hex: string, a: number) {
  const v = Math.round(a * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${v}`;
}

export default function SettingsPage() {
  const { theme, themeId, setThemeId, isSaving } = useColorTheme();
  const { hex400 } = theme;
  const [hoveredId, setHoveredId] = useState<ColorThemeId | null>(null);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1
            className="text-2xl font-black tracking-tight text-slate-900 dark:text-stone-50"
            style={{ filter: `drop-shadow(0 0 16px ${alpha(hex400, 0.35)})` }}
          >
            Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-stone-400">
            Personalize how the app looks for you.
          </p>
        </div>

        <div
          className="rounded-xl border bg-white p-6 dark:bg-[#04070a]"
          style={{
            borderColor: alpha(hex400, 0.15),
            boxShadow: `0 0 24px -10px ${alpha(hex400, 0.3)}`,
          }}
        >
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-stone-400">
              Accent color
            </p>
            {isSaving && (
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-stone-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving
              </span>
            )}
          </div>
          <p className="mb-4 text-sm text-slate-500 dark:text-stone-400">
            Pick the accent used across the HUD, sidebar, and cards.
          </p>
          <div
            role="radiogroup"
            aria-label="Accent color"
            className="grid grid-cols-3 gap-3 sm:grid-cols-6"
          >
            {COLOR_THEME_LIST.map((swatchTheme) => {
              const isSelected = themeId === swatchTheme.id;
              const isHovered = hoveredId === swatchTheme.id;
              const glowHex = swatchTheme.hex400;

              return (
                <button
                  key={swatchTheme.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setThemeId(swatchTheme.id)}
                  onMouseEnter={() => setHoveredId(swatchTheme.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group flex flex-col items-center gap-2 rounded-lg border p-3 transition-all duration-200"
                  style={{
                    borderColor: isSelected
                      ? alpha(glowHex, 0.4)
                      : isHovered
                        ? alpha(glowHex, 0.25)
                        : "transparent",
                    backgroundColor: isSelected
                      ? alpha(glowHex, 0.08)
                      : isHovered
                        ? alpha(glowHex, 0.05)
                        : undefined,
                    boxShadow: isSelected
                      ? `0 0 20px -4px ${alpha(glowHex, 0.5)}`
                      : isHovered
                        ? `0 0 16px -6px ${alpha(glowHex, 0.4)}`
                        : undefined,
                  }}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-shadow duration-200"
                    style={{
                      backgroundColor: swatchTheme.swatchHex,
                      boxShadow:
                        isSelected || isHovered
                          ? `0 0 0 1px ${alpha(glowHex, 0.6)} inset, 0 0 14px 2px ${alpha(
                              glowHex,
                              isSelected ? 0.65 : 0.45,
                            )}`
                          : "inset 0 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    {isSelected && (
                      <Check
                        className="h-4 w-4 text-black/70"
                        strokeWidth={3}
                      />
                    )}
                  </span>
                  <span
                    className={
                      isSelected || isHovered
                        ? ""
                        : "text-slate-600 dark:text-stone-300"
                    }
                    style={{
                      color: isSelected || isHovered ? glowHex : undefined,
                    }}
                  >
                    <span className="text-[11px] font-medium">
                      {swatchTheme.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-xl border bg-white p-6 dark:bg-[#04070a]"
          style={{
            borderColor: alpha(hex400, 0.15),
            boxShadow: `0 0 24px -10px ${alpha(hex400, 0.3)}`,
          }}
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-stone-400">
            Appearance
          </p>
          <p className="mb-4 text-sm text-slate-500 dark:text-stone-400">
            Switch between light and dark mode.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

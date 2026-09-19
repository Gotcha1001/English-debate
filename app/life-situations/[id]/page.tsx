// "use client";

// import { useState } from "react";
// import { useParams } from "next/navigation";
// import { useQuery } from "convex/react";
// import { motion, useReducedMotion } from "framer-motion";
// import { api } from "@/convex/_generated/api";
// import type { Id } from "@/convex/_generated/dataModel";
// import { HudPanel } from "@/app/components/HudPanel";
// import { useColorTheme } from "@/app/context/ColorThemeContext";
// import type { ColorTheme } from "@/lib/colorThemes";

// /* ---------- matrix rain + orbitals ---------- */
// const READOUTS = [
//   ["noun", "verb", "adj."],
//   ["adverb", "article", "conj."],
//   ["pronoun", "prep.", "tense"],
//   ["subject", "clause", "B2"],
//   ["A2", "C1", "B1"],
//   ["noun", "verb", "interj."],
//   ["adj.", "adv.", "article"],
//   ["conj.", "prep.", "pronoun"],
// ];

// const RAIN_COLUMNS = Array.from({ length: 10 }).map((_, i) => ({
//   left: `${(i / 9) * 100}%`,
//   tokens: READOUTS[i % READOUTS.length],
//   duration: 11 + (i % 5) * 2.4,
//   delay: (i % 6) * 0.8,
// }));

// const ORBITALS = [
//   { top: "10%", left: "6%", size: 10, delay: 0 },
//   { top: "18%", left: "90%", size: 8, delay: 0.9 },
//   { top: "42%", left: "4%", size: 12, delay: 1.6 },
//   { top: "58%", left: "93%", size: 9, delay: 0.4 },
//   { top: "72%", left: "12%", size: 11, delay: 2.1 },
//   { top: "30%", left: "96%", size: 7, delay: 1.2 },
//   { top: "50%", left: "48%", size: 10, delay: 0.6 },
//   { top: "82%", left: "75%", size: 8, delay: 1.8 },
//   { top: "25%", left: "35%", size: 6, delay: 2.4 },
//   { top: "88%", left: "40%", size: 9, delay: 1.1 },
// ];

// function MatrixBackground({ hex400 }: { hex400: string }) {
//   const reduceMotion = useReducedMotion();

//   return (
//     <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
//       {/* falling grammar tokens */}
//       <div className="absolute inset-0 opacity-40 dark:opacity-50">
//         {RAIN_COLUMNS.map((col, i) => (
//           <motion.div
//             key={i}
//             className="absolute top-0 flex flex-col gap-7 font-[family-name:var(--font-hud)] text-[10px] uppercase tracking-wider"
//             style={{
//               left: col.left,
//               color: i % 2 === 0 ? `${hex400}73` : `${hex400}40`,
//               maskImage:
//                 "linear-gradient(to bottom, transparent, black 12%, black 78%, transparent)",
//               WebkitMaskImage:
//                 "linear-gradient(to bottom, transparent, black 12%, black 78%, transparent)",
//             }}
//             animate={reduceMotion ? undefined : { y: ["-45%", "145%"] }}
//             transition={{
//               duration: col.duration,
//               repeat: Infinity,
//               delay: col.delay,
//               ease: "linear",
//             }}
//           >
//             {[...col.tokens, ...col.tokens, ...col.tokens, ...col.tokens].map(
//               (t, j) => (
//                 <span key={j}>{t}</span>
//               ),
//             )}
//           </motion.div>
//         ))}
//       </div>

//       {/* glowing orbitals */}
//       {ORBITALS.map((o, i) => (
//         <motion.span
//           key={i}
//           className="absolute rounded-full"
//           style={{
//             top: o.top,
//             left: o.left,
//             width: o.size,
//             height: o.size,
//             backgroundColor: hex400,
//             boxShadow: `0 0 16px 4px ${hex400}8c, 0 0 32px 8px ${hex400}40`,
//           }}
//           animate={
//             reduceMotion
//               ? undefined
//               : {
//                   opacity: [0.2, 0.85, 0.2],
//                   scale: [0.7, 1.5, 0.7],
//                 }
//           }
//           transition={{
//             duration: 3.6,
//             repeat: Infinity,
//             delay: o.delay,
//             ease: "easeInOut",
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function SituationCard({
//   index,
//   scenario,
//   options,
//   hex400,
//   shades,
// }: {
//   index: number;
//   scenario: string;
//   options: string[];
//   hex400: string;
//   shades: ColorTheme["shades"];
// }) {
//   const [picked, setPicked] = useState<number | null>(null);
//   return (
//     <HudPanel className="p-4">
//       <p className="mb-3 text-stone-50">
//         <span className="mr-2" style={{ color: `${shades[500]}99` }}>
//           {index + 1}.
//         </span>
//         {scenario}
//       </p>
//       <div className="flex flex-col gap-1.5">
//         {options.map((option, i) => {
//           const isPicked = picked === i;
//           return (
//             <button
//               key={i}
//               type="button"
//               onClick={() => setPicked(i)}
//               className="rounded-md border px-3 py-1.5 text-left text-sm transition-all duration-200 text-stone-200/80"
//               style={
//                 isPicked
//                   ? {
//                       borderColor: hex400,
//                       backgroundColor: `${hex400}26`,
//                       color: "#fafaf9",
//                       boxShadow: `0 0 20px -4px ${hex400}80`,
//                     }
//                   : {
//                       borderColor: `${hex400}26`,
//                     }
//               }
//               onMouseEnter={(e) => {
//                 if (!isPicked) {
//                   e.currentTarget.style.borderColor = `${hex400}66`;
//                   e.currentTarget.style.backgroundColor = `${hex400}1a`;
//                   e.currentTarget.style.boxShadow = `0 0 18px -4px ${hex400}59`;
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (!isPicked) {
//                   e.currentTarget.style.borderColor = `${hex400}26`;
//                   e.currentTarget.style.backgroundColor = "transparent";
//                   e.currentTarget.style.boxShadow = "none";
//                 }
//               }}
//             >
//               {option}
//             </button>
//           );
//         })}
//       </div>
//       {picked !== null && (
//         <p className="mt-3 text-xs text-stone-500">
//           Now say why out loud — there&apos;s no right answer here.
//         </p>
//       )}
//     </HudPanel>
//   );
// }

// export default function LifeSituationSetPage() {
//   const params = useParams<{ id: string }>();
//   const set = useQuery(api.lifeSituationsData.getLifeSituationSet, {
//     id: params.id as Id<"lifeSituationSets">,
//   });
//   const { theme } = useColorTheme();
//   const { hex400, shades } = theme;

//   if (set === undefined) {
//     return (
//       <p className="text-sm text-slate-500 dark:text-stone-500">
//         Loading scenarios...
//       </p>
//     );
//   }
//   if (set === null) {
//     return (
//       <p className="text-sm text-slate-500 dark:text-stone-500">
//         Scenario set not found.
//       </p>
//     );
//   }

//   return (
//     <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
//       <MatrixBackground hex400={hex400} />

//       <div className="relative z-10 mx-auto max-w-3xl space-y-4 pb-16">
//         <header className="mb-4">
//           <p className="text-sm font-medium" style={{ color: hex400 }}>
//             Life situations
//           </p>
//           <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
//             {set.topic}
//           </h1>
//           <p
//             className="mt-1 text-sm text-slate-500"
//             style={{ color: `${shades[300]}66` }}
//           >
//             {set.situations.length} scenarios
//           </p>
//         </header>

//         {set.situations.map((situation, i) => (
//           <SituationCard
//             key={i}
//             index={i}
//             scenario={situation.scenario}
//             options={situation.options}
//             hex400={hex400}
//             shades={shades}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { HudPanel } from "@/app/components/HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";
import type { ColorTheme } from "@/lib/colorThemes";
import { LessonHeader } from "@/app/components/LessonHeader";
import { useLifeSituationHeader } from "@/hooks/useLifeSituationsHeader";

/* ---------- matrix rain + orbitals ---------- */

const READOUTS = [
  ["noun", "verb", "adj."],
  ["adverb", "article", "conj."],
  ["pronoun", "prep.", "tense"],
  ["subject", "clause", "B2"],
  ["A2", "C1", "B1"],
  ["noun", "verb", "interj."],
  ["adj.", "adv.", "article"],
  ["conj.", "prep.", "pronoun"],
];

const RAIN_COLUMNS = Array.from({ length: 10 }).map((_, i) => ({
  left: `${(i / 9) * 100}%`,
  tokens: READOUTS[i % READOUTS.length],
  duration: 11 + (i % 5) * 2.4,
  delay: (i % 6) * 0.8,
}));

const ORBITALS = [
  { top: "10%", left: "6%", size: 10, delay: 0 },
  { top: "18%", left: "90%", size: 8, delay: 0.9 },
  { top: "42%", left: "4%", size: 12, delay: 1.6 },
  { top: "58%", left: "93%", size: 9, delay: 0.4 },
  { top: "72%", left: "12%", size: 11, delay: 2.1 },
  { top: "30%", left: "96%", size: 7, delay: 1.2 },
  { top: "50%", left: "48%", size: 10, delay: 0.6 },
  { top: "82%", left: "75%", size: 8, delay: 1.8 },
  { top: "25%", left: "35%", size: 6, delay: 2.4 },
  { top: "88%", left: "40%", size: 9, delay: 1.1 },
];

function MatrixBackground({ hex400 }: { hex400: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* falling grammar tokens */}
      <div className="absolute inset-0 opacity-40 dark:opacity-50">
        {RAIN_COLUMNS.map((col, i) => (
          <motion.div
            key={i}
            className="absolute top-0 flex flex-col gap-7 font-[family-name:var(--font-hud)] text-[10px] uppercase tracking-wider"
            style={{
              left: col.left,
              color: i % 2 === 0 ? `${hex400}73` : `${hex400}40`,
              maskImage:
                "linear-gradient(to bottom, transparent, black 12%, black 78%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 12%, black 78%, transparent)",
            }}
            animate={reduceMotion ? undefined : { y: ["-45%", "145%"] }}
            transition={{
              duration: col.duration,
              repeat: Infinity,
              delay: col.delay,
              ease: "linear",
            }}
          >
            {[...col.tokens, ...col.tokens, ...col.tokens, ...col.tokens].map(
              (t, j) => (
                <span key={j}>{t}</span>
              ),
            )}
          </motion.div>
        ))}
      </div>

      {/* glowing orbitals */}
      {ORBITALS.map((o, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            top: o.top,
            left: o.left,
            width: o.size,
            height: o.size,
            backgroundColor: hex400,
            boxShadow: `0 0 16px 4px ${hex400}8c, 0 0 32px 8px ${hex400}40`,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.2, 0.85, 0.2],
                  scale: [0.7, 1.5, 0.7],
                }
          }
          transition={{
            duration: 3.6,
            repeat: Infinity,
            delay: o.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function SituationCard({
  index,
  scenario,
  options,
  hex400,
  shades,
}: {
  index: number;
  scenario: string;
  options: string[];
  hex400: string;
  shades: ColorTheme["shades"];
}) {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <HudPanel className="p-4">
      <p className="mb-3 text-stone-50">
        <span className="mr-2" style={{ color: `${shades[500]}99` }}>
          {index + 1}.
        </span>
        {scenario}
      </p>
      <div className="flex flex-col gap-1.5">
        {options.map((option, i) => {
          const isPicked = picked === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setPicked(i)}
              className="rounded-md border px-3 py-1.5 text-left text-sm transition-all duration-200 text-stone-200/80"
              style={
                isPicked
                  ? {
                      borderColor: hex400,
                      backgroundColor: `${hex400}26`,
                      color: "#fafaf9",
                      boxShadow: `0 0 20px -4px ${hex400}80`,
                    }
                  : {
                      borderColor: `${hex400}26`,
                    }
              }
              onMouseEnter={(e) => {
                if (!isPicked) {
                  e.currentTarget.style.borderColor = `${hex400}66`;
                  e.currentTarget.style.backgroundColor = `${hex400}1a`;
                  e.currentTarget.style.boxShadow = `0 0 18px -4px ${hex400}59`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isPicked) {
                  e.currentTarget.style.borderColor = `${hex400}26`;
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="mt-3 text-xs text-stone-500">
          Now say why out loud — there&apos;s no right answer here.
        </p>
      )}
    </HudPanel>
  );
}

export default function LifeSituationSetPage() {
  const params = useParams<{ id: string }>();
  const setId = params.id as Id<"lifeSituationSets">;
  const set = useQuery(api.lifeSituationsData.getLifeSituationSet, {
    id: setId,
  });
  // Must sit above the early returns below (rules of hooks).
  const header = useLifeSituationHeader(setId);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  if (set === undefined) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Loading scenarios...
      </p>
    );
  }
  if (set === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-stone-500">
        Scenario set not found.
      </p>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <MatrixBackground hex400={hex400} />

      <div className="relative z-10 mx-auto max-w-3xl space-y-4 pb-16">
        {/* A <div>, not <header>: <LessonHeader> renders its own <header>
            and headers can't nest. */}
        <div className="mb-4">
          <p className="text-sm font-medium" style={{ color: hex400 }}>
            Life situations
          </p>
          {/* Themed glow around the header card. `getLifeSituationSet` only
              returns sets the signed-in user owns, so anyone who can see this
              page can edit it. */}
          <div
            className="mt-3 rounded-2xl"
            style={{
              boxShadow: `0 0 0 1px ${hex400}59, 0 0 40px -10px ${hex400}73`,
            }}
          >
            <LessonHeader
              title={set.topic}
              learningObjective={set.learningObjective}
              imageUrl={set.headerImage?.url}
              editable
              isUploadingImage={header.isImageBusy}
              isSavingObjective={header.isSavingObjective}
              onUploadImage={header.uploadImage}
              onRemoveImage={header.removeImage}
              onSaveObjective={header.saveObjective}
            />
          </div>
          <p
            className="mt-3 text-sm text-slate-500"
            style={{ color: `${shades[300]}66` }}
          >
            {set.situations.length} scenarios
          </p>
        </div>

        {set.situations.map((situation, i) => (
          <SituationCard
            key={i}
            index={i}
            scenario={situation.scenario}
            options={situation.options}
            hex400={hex400}
            shades={shades}
          />
        ))}
      </div>
    </div>
  );
}

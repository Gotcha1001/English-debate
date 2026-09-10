"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  MessagesSquare,
  PenLine,
  ImagePlus,
  Languages,
} from "lucide-react";

const FEATURES = [
  {
    title: "A story built for the conversation",
    description:
      "Give it any topic and it writes a short, level-appropriate story to anchor the lesson — comprehension, multiple choice, and tricky vocabulary all pulled straight from it.",
    icon: BookOpen,
  },
  {
    title: "Fifty ways to keep talking",
    description:
      "Every lesson comes with 50 short, easy discussion questions on the topic, so a five-minute warm-up never runs out of things to ask.",
    icon: MessagesSquare,
  },
  {
    title: "Grammar, broken all the way down",
    description:
      "Five real sentences on the topic, tagged word by word — noun, verb, article, conjunction — then turned into a quiz with a tab to reveal each answer.",
    icon: PenLine,
  },
  {
    title: "A cover for every lesson",
    description:
      'Add a header image and get an AI-drafted "what you\'ll learn today" brief you can edit before class. Delete the lesson and the image goes with it.',
    icon: ImagePlus,
  },
];

// Fixed positions — no Math.random() so SSR/client markup matches
const PULSES = [
  { top: "10%", left: "8%", delay: 0 },
  { top: "18%", left: "88%", delay: 0.8 },
  { top: "62%", left: "5%", delay: 1.5 },
  { top: "74%", left: "92%", delay: 0.5 },
  { top: "40%", left: "95%", delay: 1.9 },
  { top: "52%", left: "3%", delay: 1.1 },
];

// Grammar-flavored version of the modal's lesson-stat readouts
const READOUTS = [
  ["noun", "verb", "B2"],
  ["adj.", "clause", "Q14"],
  ["article", "C1", "tense"],
  ["conj.", "A2", "adverb"],
  ["pronoun", "subject", "B1"],
];

const RAIN_COLUMNS = Array.from({ length: 8 }).map((_, i) => ({
  left: `${(i / 7) * 100}%`,
  tokens: READOUTS[i % READOUTS.length],
  duration: 9 + (i % 4) * 1.8,
  delay: (i % 5) * 0.6,
}));

const GRID_BG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg stroke='%2322d3ee' stroke-opacity='0.35' stroke-width='1'%3E%3Cpath d='M24 18v12M18 24h12'/%3E%3C/g%3E%3C/svg%3E";

const flicker = {
  opacity: [0.55, 0.9, 0.5, 1, 0.6, 0.85, 0.55],
  scale: [0.95, 1.05, 0.92, 1.1, 0.97, 1.04, 0.95],
};

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const spin = (reverse = false) =>
    reduceMotion ? undefined : { rotate: reverse ? -360 : 360 };
  const spinTransition = (duration: number) =>
    reduceMotion
      ? { duration: 0 }
      : { duration, repeat: Infinity, ease: "linear" as const };

  useEffect(() => {
    if (isSignedIn) router.prefetch("/free-talking");
  }, [isSignedIn, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] text-stone-100">
      {/* coordinate-grid texture, same token as LessonGeneratingModal */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage: `url("${GRID_BG}")`,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_#0a1219_0%,_#04070a_70%)]" />

      {/* falling grammar-term columns */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-70">
        {RAIN_COLUMNS.map((col, i) => (
          <motion.div
            key={i}
            className="absolute top-0 flex flex-col gap-5 font-[family-name:var(--font-hud)] text-[10px]"
            style={{
              left: col.left,
              color:
                i % 2 === 0 ? "rgba(34,211,238,0.35)" : "rgba(220,38,38,0.25)",
              maskImage:
                "linear-gradient(to bottom, transparent, black 25%, black 65%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 25%, black 65%, transparent)",
            }}
            animate={reduceMotion ? undefined : { y: ["-30%", "130%"] }}
            transition={{
              duration: col.duration,
              repeat: Infinity,
              delay: col.delay,
              ease: "linear",
            }}
          >
            {col.tokens.map((t, j) => (
              <span key={j}>{t}</span>
            ))}
          </motion.div>
        ))}
      </div>

      {/* idea-spark dust */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {PULSES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300"
            style={{ top: p.top, left: p.left }}
            animate={reduceMotion ? undefined : { opacity: [0.1, 0.7, 0.1] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <section className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-24 text-center">
        {/* ===== flickering core, scaled up from the modal ===== */}
        <div className="relative mx-auto mb-10 flex h-32 w-32 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border border-dashed border-cyan-400/35"
            animate={spin()}
            transition={spinTransition(14)}
          />
          <motion.div
            className="absolute inset-3 rounded-full border border-cyan-600/40"
            animate={spin(true)}
            transition={spinTransition(9)}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-300/30"
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }
            }
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <motion.div
            className="absolute h-16 w-16 rounded-full bg-cyan-300 blur-2xl"
            animate={reduceMotion ? undefined : flicker}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/50 bg-gradient-to-br from-cyan-700 to-cyan-500 shadow-[0_0_45px_-6px_rgba(34,211,238,0.9)]">
            <Languages className="h-9 w-9 text-[#04070a]" />
          </div>
        </div>

        <p className="text-sm font-medium tracking-wide text-cyan-400">
          AI English practice
        </p>
        <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-5xl leading-[1.1] text-stone-50 md:text-6xl">
          Talk about anything. In English.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-400">
          Pick a topic — or don&rsquo;t — and get a complete speaking lesson in
          seconds: a short story, comprehension and multiple choice, the words
          worth learning, fifty questions to keep the conversation going, and a
          word-by-word grammar breakdown. Add a cover image and a short brief,
          or skip the lesson entirely and generate fifty debate questions on any
          topic you like.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {isSignedIn ? (
            <Button
              size="lg"
              className="border border-cyan-400/40 bg-cyan-500 px-8 py-6 text-base text-[#04070a] shadow-[0_0_30px_-6px_rgba(34,211,238,0.6)] hover:bg-cyan-400"
              onClick={() => router.push("/free-talking")}
            >
              Generate a lesson
            </Button>
          ) : (
            <>
              <SignInButton mode="modal" forceRedirectUrl="/free-talking">
                <Button
                  size="lg"
                  className="border border-cyan-400/40 bg-cyan-500 px-8 py-6 text-base text-[#04070a] shadow-[0_0_30px_-6px_rgba(34,211,238,0.6)] hover:bg-cyan-400"
                >
                  Sign in to start
                </Button>
              </SignInButton>
              <Link href="/sign-up">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-cyan-400/25 px-8 py-6 text-base text-stone-300 hover:bg-cyan-400/10"
                >
                  Create account
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ===== feature rows, styled like the modal's step list ===== */}
      <section className="relative mx-auto max-w-2xl px-6 py-16">
        <div className="flex flex-col gap-4">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="relative flex items-center gap-4 rounded-xl border border-cyan-400/20 bg-[#060b0f]/80 p-5 shadow-[0_0_35px_-10px_rgba(34,211,238,0.45)] backdrop-blur-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/5">
                <feature.icon className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-stone-100">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm text-stone-400">
                  {feature.description}
                </p>
              </div>
              <span className="ml-auto flex shrink-0 items-center">
                <motion.span
                  className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_3px_rgba(34,211,238,0.6)]"
                  animate={
                    reduceMotion ? undefined : { opacity: [0.4, 1, 0.4] }
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                />
              </span>
            </div>
          ))}
        </div>
        {/* progress-bar echo from the bottom of the modal */}
        <div className="mt-8 h-px w-full overflow-hidden rounded-full bg-cyan-400/10">
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
            animate={reduceMotion ? undefined : { x: ["-100%", "300%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </section>

      <section className="relative mx-auto max-w-2xl px-6 pb-24 text-center">
        <h2 className="text-2xl font-semibold text-stone-100">
          Ready to practice?
        </h2>
        <div className="mt-5 flex justify-center">
          <Link href={isSignedIn ? "/free-talking" : "/sign-up"}>
            <Button
              size="lg"
              className="border border-cyan-400/40 bg-cyan-500 px-8 py-6 text-base text-[#04070a] shadow-[0_0_30px_-6px_rgba(34,211,238,0.6)] hover:bg-cyan-400"
            >
              Start talking
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

// app/components/PictureDeck.tsx
// Full-screen picture player, shared by the owner page, the public page and
// the view-only /pictures/show page.
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { HudPanel } from "@/app/components/HudPanel";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { useColorTheme } from "@/app/context/ColorThemeContext";

export type DeckPicture = {
  _id: string;
  title: string;
  number: number;
  image: { url: string };
};

// Cloudinary delivers a resized, auto-format copy when a transformation
// segment is added after /upload/.
export function withTransform(url: string, transform: string) {
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/${transform}/`)
    : url;
}
export const bigUrl = (url: string) =>
  withTransform(url, "f_auto,q_auto,w_2000,c_limit");

/** Current picture index + slide direction, kept inside the deck. */
export function useDeck(count: number) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const safeIndex = Math.min(index, Math.max(count - 1, 0));

  const goTo = useCallback(
    (target: number, dir: number) => {
      if (count === 0) return;
      setDirection(dir);
      setIndex(((target % count) + count) % count); // wraps around
    },
    [count],
  );
  const open = useCallback((i: number) => {
    setDirection(1);
    setIndex(i);
  }, []);

  return { index: safeIndex, direction, goTo, open };
}

export function PictureDeck({
  pictures,
  index,
  direction,
  onGo,
  header,
  empty,
  centerHeader = false,
}: {
  pictures: DeckPicture[];
  index: number;
  direction: number;
  onGo: (target: number, dir: number) => void;
  /** Left side of the slim top bar (title, tabs...). */
  header: ReactNode;
  /** Shown instead of the player when there are no pictures. */
  empty: ReactNode;
  /** Center the header in the top bar (search stays on the right). */
  centerHeader?: boolean;
}) {
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);

  const n = pictures.length;
  const current = pictures[index];

  const next = useCallback(() => onGo(index + 1, 1), [onGo, index]);
  const prev = useCallback(() => onGo(index - 1, -1), [onGo, index]);

  // Search by number ("7") or by any part of the title ("dog").
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pictures
      .map((p, i) => ({ p, i }))
      .filter(
        ({ p }) => String(p.number) === q || p.title.toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          Number(String(b.p.number) === q) - Number(String(a.p.number) === q),
      )
      .slice(0, 6);
  }, [query, pictures]);

  const jumpTo = (i: number) => {
    onGo(i, i >= index ? 1 : -1);
    setQuery("");
  };

  // Left / right arrow keys (ignored while typing in the search box).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Warm the cache for the neighbouring pictures so "Next" feels instant.
  useEffect(() => {
    if (n < 2) return;
    for (const offset of [1, -1]) {
      const p = pictures[(index + offset + n) % n];
      if (p) new Image().src = bigUrl(p.image.url);
    }
  }, [index, n, pictures]);

  // Drop-shadow follows the painted picture, so the glow hugs its real edges.
  const glowOn = `drop-shadow(0 0 8px ${hex400}) drop-shadow(0 0 24px ${hex400}cc) drop-shadow(0 0 48px ${hex400}66)`;
  const glowOff = `drop-shadow(0 0 0px ${hex400}00) drop-shadow(0 0 0px ${hex400}00) drop-shadow(0 0 0px ${hex400}00)`;

  const variants: Variants = reduceMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        enter: (dir: number) => ({
          x: dir > 0 ? 140 : -140,
          opacity: 0,
          scale: 0.9,
          rotate: dir > 0 ? 3 : -3,
        }),
        center: {
          x: 0,
          opacity: 1,
          scale: 1,
          rotate: 0,
          transition: { type: "spring", stiffness: 260, damping: 26 },
        },
        exit: (dir: number) => ({
          x: dir > 0 ? -140 : 140,
          opacity: 0,
          scale: 0.9,
          transition: { duration: 0.18 },
        }),
      };

  return (
    <div className="relative h-dvh overflow-hidden">
      <MatrixBackground />
      <div className="relative z-10 flex h-full flex-col p-2 sm:p-3">
        {n === 0 || !current ? (
          <>
            <div
              className={`mb-2 flex items-center ${centerHeader ? "justify-center" : ""}`}
            >
              {header}
            </div>
            {empty}
          </>
        ) : (
          <>
            {/* Slim top bar: header on the left, small search on the right */}
            <div
              className={
                centerHeader
                  ? "mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3"
                  : "mb-2 flex items-center justify-between gap-3"
              }
            >
              {centerHeader && <div />}
              {header}

              <form
                className={`relative w-44 sm:w-60 ${centerHeader ? "justify-self-end" : ""}`}
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  if (matches[0]) jumpTo(matches[0].i);
                }}
              >
                <label htmlFor="picture-search" className="sr-only">
                  Search by number or title
                </label>
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                  style={{ color: `${shades[300]}80` }}
                />
                <input
                  id="picture-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Number or title..."
                  autoComplete="off"
                  className="w-full rounded-lg bg-[#0a1219] py-1.5 pl-8 pr-3 text-sm text-stone-50 outline-none transition"
                  style={{
                    border: `1px solid ${searchFocused ? hex400 : `${hex400}33`}`,
                    boxShadow: searchFocused
                      ? `0 0 0 2px ${hex400}33`
                      : undefined,
                  }}
                />
                {query.trim() && (
                  <ul
                    className="absolute right-0 z-30 mt-1.5 w-72 max-w-[85vw] overflow-hidden rounded-lg bg-[#0a1219] shadow-xl"
                    style={{ border: `1px solid ${hex400}33` }}
                  >
                    {matches.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-stone-400">
                        No picture matches &ldquo;{query.trim()}&rdquo;
                      </li>
                    ) : (
                      matches.map(({ p, i }) => (
                        <li key={p._id}>
                          <button
                            type="button"
                            onClick={() => jumpTo(i)}
                            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-stone-50 transition hover:bg-white/5"
                          >
                            <span
                              className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-2 text-xs font-bold text-[#04070a]"
                              style={{ backgroundColor: shades[500] }}
                            >
                              {p.number}
                            </span>
                            {p.title}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </form>
            </div>

            {/* The picture: takes all remaining space */}
            <div className="min-h-0 flex-1">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={current._id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <HudPanel className="p-1.5 sm:p-2">
                    <div
                      className="relative"
                      onMouseEnter={() => setImageHovered(true)}
                      onMouseLeave={() => setImageHovered(false)}
                    >
                      <motion.span
                        className="absolute left-3 top-3 z-10 inline-flex h-14 min-w-[3.5rem] items-center justify-center rounded-2xl px-3 text-2xl font-extrabold text-[#04070a]"
                        style={{
                          backgroundColor: shades[500],
                          boxShadow: `0 0 24px -6px ${hex400}99`,
                        }}
                        initial={
                          reduceMotion ? false : { scale: 0, rotate: -25 }
                        }
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 14,
                          delay: 0.15,
                        }}
                      >
                        {current.number}
                      </motion.span>

                      {/* 100dvh minus top bar, bottom bar and paddings */}
                      <img
                        src={bigUrl(current.image.url)}
                        alt={current.title}
                        draggable={false}
                        className="block h-[calc(100dvh-9.5rem)] min-h-[16rem] w-full object-contain"
                        style={{
                          filter: imageHovered ? glowOn : glowOff,
                          transition: "filter 300ms ease",
                        }}
                      />

                      <motion.h2
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 pb-4 pt-14 text-center text-3xl font-extrabold text-white sm:text-5xl"
                        initial={reduceMotion ? false : { y: 14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                      >
                        {current.title}
                      </motion.h2>
                    </div>
                  </HudPanel>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Back / counter / Next */}
            <div className="mt-2 flex items-center justify-between gap-3">
              <motion.button
                type="button"
                onClick={prev}
                disabled={n < 2}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.94 }}
                aria-label="Previous picture"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-base font-semibold transition disabled:opacity-40"
                style={{
                  borderColor: `${hex400}4d`,
                  backgroundColor: `${hex400}1a`,
                  color: shades[300],
                }}
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </motion.button>

              <span
                className="text-base font-semibold tabular-nums"
                style={{ color: `${shades[300]}b3` }}
              >
                {index + 1} / {n}
              </span>

              <motion.button
                type="button"
                onClick={next}
                disabled={n < 2}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.94 }}
                aria-label="Next picture"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-2 text-lg font-bold text-[#04070a] transition disabled:opacity-40"
                style={{
                  backgroundColor: shades[500],
                  boxShadow: `0 0 24px -6px ${hex400}80`,
                }}
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

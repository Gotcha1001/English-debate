// "use client";

// // app/pictures/page.tsx
// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
//   type FormEvent,
// } from "react";
// import { useAction, useQuery } from "convex/react";
// import {
//   AnimatePresence,
//   motion,
//   useReducedMotion,
//   type Variants,
// } from "framer-motion";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ImagePlus,
//   Images,
//   Loader2,
//   Search,
// } from "lucide-react";
// import { toast } from "sonner";
// import { api } from "@/convex/_generated/api";
// import type { Doc } from "@/convex/_generated/dataModel";
// import { useDeleteSetAction } from "@/hooks/useDeleteSet";
// import { HudPanel } from "@/app/components/HudPanel";
// import { DeleteButton } from "@/app/components/DeleteButton";
// import { MatrixBackground } from "@/app/components/MatrixBackground";
// import { useColorTheme } from "@/app/context/ColorThemeContext";

// type Picture = Doc<"pictureCards">;
// type Mode = "present" | "manage";

// // --- helpers ---------------------------------------------------------------

// // Cloudinary delivers a resized, auto-format copy when a transformation
// // segment is added after /upload/.
// function withTransform(url: string, transform: string) {
//   return url.includes("/upload/")
//     ? url.replace("/upload/", `/upload/${transform}/`)
//     : url;
// }
// const bigUrl = (url: string) =>
//   withTransform(url, "f_auto,q_auto,w_2000,c_limit");
// const thumbUrl = (url: string) =>
//   withTransform(url, "f_auto,q_auto,w_400,h_400,c_fill");

// // Shrinks the photo in the browser before upload: phone photos can be 5-10 MB,
// // and Convex action arguments are capped at 8 MiB.
// async function fileToResizedDataUri(
//   file: File,
//   maxSide = 1600,
//   quality = 0.85,
// ): Promise<string> {
//   const objectUrl = URL.createObjectURL(file);
//   try {
//     const img = await new Promise<HTMLImageElement>((resolve, reject) => {
//       const el = new Image();
//       el.onload = () => resolve(el);
//       el.onerror = () => reject(new Error("Couldn't read that image."));
//       el.src = objectUrl;
//     });
//     const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
//     const width = Math.round(img.width * scale);
//     const height = Math.round(img.height * scale);
//     const canvas = document.createElement("canvas");
//     canvas.width = width;
//     canvas.height = height;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) throw new Error("Couldn't process that image.");
//     ctx.fillStyle = "#ffffff"; // JPEG has no transparency
//     ctx.fillRect(0, 0, width, height);
//     ctx.drawImage(img, 0, 0, width, height);
//     return canvas.toDataURL("image/jpeg", quality);
//   } finally {
//     URL.revokeObjectURL(objectUrl);
//   }
// }

// // --- page ------------------------------------------------------------------

// export default function PicturesPage() {
//   const [mode, setMode] = useState<Mode>("present");
//   const [index, setIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const pictures = useQuery(api.picturesData.listMyPictures);
//   const { theme } = useColorTheme();
//   const { hex400, shades } = theme;

//   const count = pictures?.length ?? 0;
//   // If pictures were deleted, keep the index inside the deck.
//   const safeIndex = Math.min(index, Math.max(count - 1, 0));

//   const goTo = useCallback(
//     (target: number, dir: number) => {
//       if (count === 0) return;
//       setDirection(dir);
//       setIndex(((target % count) + count) % count); // wraps around
//     },
//     [count],
//   );

//   const tabs: { id: Mode; label: string; icon: typeof Images }[] = [
//     { id: "present", label: "Show pictures", icon: Images },
//     { id: "manage", label: "Add & manage", icon: ImagePlus },
//   ];

//   return (
//     <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
//       <MatrixBackground />
//       <div
//         className={`relative z-10 mx-auto ${
//           mode === "present" ? "max-w-6xl" : "max-w-4xl"
//         }`}
//       >
//         <header className={mode === "present" ? "mb-3" : "mb-6"}>
//           <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
//             Picture Talk
//           </h1>
//           {mode !== "present" && (
//             <p className="mt-2 max-w-xl text-slate-600 dark:text-stone-400">
//               Add pictures with a title, then show them one at a time, nice and
//               big &mdash; &ldquo;Have you ever tried this?&rdquo;
//             </p>
//           )}
//         </header>

//         <div
//           className={`${
//             mode === "present" ? "mb-3" : "mb-6"
//           } inline-flex rounded-lg bg-[#0a1219] p-1`}
//           style={{ border: `1px solid ${hex400}33` }}
//         >
//           {tabs.map(({ id, label, icon: Icon }) => (
//             <button
//               key={id}
//               type="button"
//               onClick={() => setMode(id)}
//               className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition"
//               style={{
//                 backgroundColor: mode === id ? `${hex400}26` : undefined,
//                 color: mode === id ? "#fafaf9" : `${shades[300]}80`,
//               }}
//             >
//               <Icon className="h-4 w-4" />
//               {label}
//             </button>
//           ))}
//         </div>

//         {pictures === undefined ? (
//           <p className="text-sm text-slate-500 dark:text-stone-500">
//             Loading...
//           </p>
//         ) : mode === "present" ? (
//           <PresentView
//             pictures={pictures}
//             index={safeIndex}
//             direction={direction}
//             onGo={goTo}
//             onManage={() => setMode("manage")}
//           />
//         ) : (
//           <ManageView
//             pictures={pictures}
//             onOpen={(i) => {
//               setDirection(1);
//               setIndex(i);
//               setMode("present");
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// // --- present mode ----------------------------------------------------------

// function PresentView({
//   pictures,
//   index,
//   direction,
//   onGo,
//   onManage,
// }: {
//   pictures: Picture[];
//   index: number;
//   direction: number;
//   onGo: (target: number, dir: number) => void;
//   onManage: () => void;
// }) {
//   const { theme } = useColorTheme();
//   const { hex400, shades } = theme;
//   const reduceMotion = useReducedMotion();
//   const [query, setQuery] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [imageHovered, setImageHovered] = useState(false);
//   // Aspect ratio (width / height) per picture id, learned as images load.
//   const [ratios, setRatios] = useState<Record<string, number>>({});

//   const n = pictures.length;
//   const current = pictures[index];

//   const next = useCallback(() => onGo(index + 1, 1), [onGo, index]);
//   const prev = useCallback(() => onGo(index - 1, -1), [onGo, index]);

//   // Search by number ("7") or by any part of the title ("dog").
//   const matches = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return [];
//     return pictures
//       .map((p, i) => ({ p, i }))
//       .filter(
//         ({ p }) => String(p.number) === q || p.title.toLowerCase().includes(q),
//       )
//       .sort(
//         (a, b) =>
//           Number(String(b.p.number) === q) - Number(String(a.p.number) === q),
//       )
//       .slice(0, 6);
//   }, [query, pictures]);

//   const jumpTo = (i: number) => {
//     onGo(i, i >= index ? 1 : -1);
//     setQuery("");
//   };

//   // Left / right arrow keys (ignored while typing in the search box).
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       const el = e.target as HTMLElement | null;
//       if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
//       if (e.key === "ArrowRight") next();
//       else if (e.key === "ArrowLeft") prev();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [next, prev]);

//   // Warm the cache for the neighbouring pictures so "Next" feels instant.
//   useEffect(() => {
//     if (n < 2) return;
//     for (const offset of [1, -1]) {
//       const p = pictures[(index + offset + n) % n];
//       if (!p) continue;
//       const img = new Image();
//       img.onload = () => {
//         if (!img.naturalWidth || !img.naturalHeight) return;
//         setRatios((r) =>
//           r[p._id]
//             ? r
//             : { ...r, [p._id]: img.naturalWidth / img.naturalHeight },
//         );
//       };
//       img.src = bigUrl(p.image.url);
//     }
//   }, [index, n, pictures]);

//   if (n === 0 || !current) {
//     return (
//       <HudPanel className="p-8 text-center">
//         <p className="text-stone-300">No pictures yet.</p>
//         <button
//           type="button"
//           onClick={onManage}
//           className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-[#04070a] transition"
//           style={{ backgroundColor: shades[500] }}
//         >
//           <ImagePlus className="h-4 w-4" />
//           Add your first picture
//         </button>
//       </HudPanel>
//     );
//   }

//   // Same number of shadows on/off so the CSS transition can interpolate.
//   const glowOn = `0 0 8px ${hex400}, 0 0 24px ${hex400}cc, 0 0 48px ${hex400}66`;
//   const glowOff = `0 0 0px ${hex400}00, 0 0 0px ${hex400}00, 0 0 0px ${hex400}00`;

//   // The picture box takes the picture's own shape and grows until it hits the
//   // stage height or the panel width, whichever comes first.
//   const ratio: number | undefined = ratios[current._id];
//   const boxRatio = ratio ?? 4 / 3;
//   const stageHeight = "max(20rem, calc(100vh - 24rem))";

//   const variants: Variants = reduceMotion
//     ? {
//         enter: { opacity: 0 },
//         center: { opacity: 1, transition: { duration: 0.15 } },
//         exit: { opacity: 0, transition: { duration: 0.1 } },
//       }
//     : {
//         enter: (dir: number) => ({
//           x: dir > 0 ? 140 : -140,
//           opacity: 0,
//           scale: 0.9,
//           rotate: dir > 0 ? 3 : -3,
//         }),
//         center: {
//           x: 0,
//           opacity: 1,
//           scale: 1,
//           rotate: 0,
//           transition: { type: "spring", stiffness: 260, damping: 26 },
//         },
//         exit: (dir: number) => ({
//           x: dir > 0 ? -140 : 140,
//           opacity: 0,
//           scale: 0.9,
//           transition: { duration: 0.18 },
//         }),
//       };

//   return (
//     <div>
//       <form
//         className="relative mb-3"
//         onSubmit={(e: FormEvent) => {
//           e.preventDefault();
//           if (matches[0]) jumpTo(matches[0].i);
//         }}
//       >
//         <label htmlFor="picture-search" className="sr-only">
//           Search by number or title
//         </label>
//         <Search
//           className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
//           style={{ color: `${shades[300]}80` }}
//         />
//         <input
//           id="picture-search"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           onFocus={() => setSearchFocused(true)}
//           onBlur={() => setSearchFocused(false)}
//           placeholder="Search by number or title..."
//           autoComplete="off"
//           className="w-full rounded-lg bg-[#0a1219] py-2.5 pl-10 pr-4 text-stone-50 outline-none transition"
//           style={{
//             border: `1px solid ${searchFocused ? hex400 : `${hex400}33`}`,
//             boxShadow: searchFocused ? `0 0 0 2px ${hex400}33` : undefined,
//           }}
//         />
//         {query.trim() && (
//           <ul
//             className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg bg-[#0a1219] shadow-xl"
//             style={{ border: `1px solid ${hex400}33` }}
//           >
//             {matches.length === 0 ? (
//               <li className="px-4 py-3 text-sm text-stone-400">
//                 No picture matches &ldquo;{query.trim()}&rdquo;
//               </li>
//             ) : (
//               matches.map(({ p, i }) => (
//                 <li key={p._id}>
//                   <button
//                     type="button"
//                     onClick={() => jumpTo(i)}
//                     className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-stone-50 transition hover:bg-white/5"
//                   >
//                     <span
//                       className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-2 text-xs font-bold text-[#04070a]"
//                       style={{ backgroundColor: shades[500] }}
//                     >
//                       {p.number}
//                     </span>
//                     {p.title}
//                   </button>
//                 </li>
//               ))
//             )}
//           </ul>
//         )}
//       </form>

//       <AnimatePresence mode="wait" custom={direction} initial={false}>
//         <motion.div
//           key={current._id}
//           custom={direction}
//           variants={variants}
//           initial="enter"
//           animate="center"
//           exit="exit"
//         >
//           <HudPanel className="p-3 sm:p-5">
//             {/* Fixed-height stage: Back/Next stay put whatever the picture's shape. */}
//             <div
//               className="flex items-center justify-center"
//               style={{ height: stageHeight }}
//             >
//               {/* Sized to the picture itself, so the rounded corners, glow,
//                   number badge and caption all sit on the picture's real edges. */}
//               <div
//                 className="relative flex-none rounded-2xl"
//                 style={{
//                   aspectRatio: boxRatio,
//                   width: `min(100%, calc(${stageHeight} * ${boxRatio}))`,
//                   opacity: ratio ? 1 : 0,
//                   boxShadow: imageHovered ? glowOn : glowOff,
//                   transition: "box-shadow 300ms ease, opacity 200ms ease",
//                 }}
//                 onMouseEnter={() => setImageHovered(true)}
//                 onMouseLeave={() => setImageHovered(false)}
//               >
//                 <motion.span
//                   className="absolute left-3 top-3 z-10 inline-flex h-14 min-w-[3.5rem] items-center justify-center rounded-2xl px-3 text-2xl font-extrabold text-[#04070a]"
//                   style={{
//                     backgroundColor: shades[500],
//                     boxShadow: `0 0 24px -6px ${hex400}99`,
//                   }}
//                   initial={reduceMotion ? false : { scale: 0, rotate: -25 }}
//                   animate={{ scale: 1, rotate: 0 }}
//                   transition={{
//                     type: "spring",
//                     stiffness: 400,
//                     damping: 14,
//                     delay: 0.15,
//                   }}
//                 >
//                   {current.number}
//                 </motion.span>
//                 <img
//                   src={bigUrl(current.image.url)}
//                   alt={current.title}
//                   draggable={false}
//                   onLoad={(e) => {
//                     const { naturalWidth: w, naturalHeight: h } =
//                       e.currentTarget;
//                     if (!w || !h) return;
//                     setRatios((r) =>
//                       r[current._id] ? r : { ...r, [current._id]: w / h },
//                     );
//                   }}
//                   onError={() =>
//                     // Broken image: still reveal the box instead of leaving it invisible.
//                     setRatios((r) =>
//                       r[current._id] ? r : { ...r, [current._id]: 4 / 3 },
//                     )
//                   }
//                   className="block h-full w-full rounded-2xl object-cover"
//                 />
//                 <motion.h2
//                   className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 pb-4 pt-14 text-center text-3xl font-extrabold text-white sm:text-5xl"
//                   initial={reduceMotion ? false : { y: 14, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ delay: 0.1, duration: 0.3 }}
//                 >
//                   {current.title}
//                 </motion.h2>
//               </div>
//             </div>
//           </HudPanel>
//         </motion.div>
//       </AnimatePresence>

//       <div className="mt-4 flex items-center justify-between gap-3">
//         <motion.button
//           type="button"
//           onClick={prev}
//           disabled={n < 2}
//           whileHover={{ scale: 1.03 }}
//           whileTap={{ scale: 0.94 }}
//           aria-label="Previous picture"
//           className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-lg font-semibold transition disabled:opacity-40"
//           style={{
//             borderColor: `${hex400}4d`,
//             backgroundColor: `${hex400}1a`,
//             color: shades[300],
//           }}
//         >
//           <ChevronLeft className="h-6 w-6" />
//           Back
//         </motion.button>

//         <span
//           className="text-lg font-semibold tabular-nums"
//           style={{ color: `${shades[300]}b3` }}
//         >
//           {index + 1} / {n}
//         </span>

//         <motion.button
//           type="button"
//           onClick={next}
//           disabled={n < 2}
//           whileHover={{ scale: 1.03 }}
//           whileTap={{ scale: 0.94 }}
//           aria-label="Next picture"
//           className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-xl font-bold text-[#04070a] transition disabled:opacity-40"
//           style={{
//             backgroundColor: shades[500],
//             boxShadow: `0 0 24px -6px ${hex400}80`,
//           }}
//         >
//           Next
//           <ChevronRight className="h-6 w-6" />
//         </motion.button>
//       </div>
//     </div>
//   );
// }

// // --- add & manage mode -----------------------------------------------------

// function ManageView({
//   pictures,
//   onOpen,
// }: {
//   pictures: Picture[];
//   onOpen: (index: number) => void;
// }) {
//   const { theme } = useColorTheme();
//   const { hex400, shades } = theme;
//   const addPicture = useAction(api.picturesActions.addPicture);
//   const { deleteItem, deletingId } = useDeleteSetAction(
//     api.picturesActions.deletePicture,
//     "picture",
//   );

//   const [file, setFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [title, setTitle] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [inputKey, setInputKey] = useState(0); // remounts the file input to clear it
//   const [titleFocused, setTitleFocused] = useState(false);

//   const handleFile = (f: File | null) => {
//     setError(null);
//     if (f && !f.type.startsWith("image/")) {
//       setError("Please choose an image file.");
//       return;
//     }
//     if (previewUrl) URL.revokeObjectURL(previewUrl);
//     setFile(f);
//     setPreviewUrl(f ? URL.createObjectURL(f) : null);
//     // Pre-fill the title from the file name ("big-red-dog.jpg" -> "big red dog").
//     if (f && !title.trim()) {
//       setTitle(
//         f.name
//           .replace(/\.[^.]+$/, "")
//           .replace(/[-_]+/g, " ")
//           .trim(),
//       );
//     }
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!file || !title.trim() || isUploading) return;
//     setError(null);
//     setIsUploading(true);
//     try {
//       const imageDataUri = await fileToResizedDataUri(file);
//       const { number } = await addPicture({ title, imageDataUri });
//       toast.success(`Added as picture #${number}`);
//       handleFile(null);
//       setTitle("");
//       setInputKey((k) => k + 1);
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Couldn't add that picture.",
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div>
//       <HudPanel className="p-5">
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <label
//             htmlFor="picture-file"
//             className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl px-4 py-6 text-center text-sm transition"
//             style={{ border: `1px dashed ${hex400}4d`, color: shades[300] }}
//           >
//             {previewUrl ? (
//               <img
//                 src={previewUrl}
//                 alt="Preview of the chosen picture"
//                 className="max-h-64 rounded-lg object-contain"
//               />
//             ) : (
//               <>
//                 <ImagePlus className="h-8 w-8" />
//                 Tap to choose a picture
//               </>
//             )}
//           </label>
//           <input
//             id="picture-file"
//             key={inputKey}
//             type="file"
//             accept="image/*"
//             className="sr-only"
//             disabled={isUploading}
//             onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
//           />

//           <div>
//             <label
//               htmlFor="picture-title"
//               className="mb-2 block text-sm font-medium text-stone-200/80"
//             >
//               Title
//             </label>
//             <div className="flex flex-col gap-3 sm:flex-row">
//               <input
//                 id="picture-title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 onFocus={() => setTitleFocused(true)}
//                 onBlur={() => setTitleFocused(false)}
//                 maxLength={80}
//                 placeholder="e.g. Riding a bike"
//                 disabled={isUploading}
//                 className="flex-1 rounded-lg bg-[#0a1219] px-4 py-2.5 text-stone-50 outline-none transition"
//                 style={{
//                   border: `1px solid ${titleFocused ? hex400 : `${hex400}33`}`,
//                   boxShadow: titleFocused ? `0 0 0 2px ${hex400}33` : undefined,
//                 }}
//               />
//               <button
//                 type="submit"
//                 disabled={!file || !title.trim() || isUploading}
//                 className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-[#04070a] transition disabled:opacity-50"
//                 style={{ backgroundColor: shades[500] }}
//               >
//                 {isUploading ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     Uploading...
//                   </>
//                 ) : (
//                   <>
//                     <ImagePlus className="h-4 w-4" />
//                     Add as picture #{pictures.length + 1}
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//           {error && <p className="text-sm text-red-400">{error}</p>}
//         </form>
//       </HudPanel>

//       <section className="mt-10">
//         <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-stone-100">
//           Your pictures ({pictures.length})
//         </h2>
//         {pictures.length === 0 && (
//           <p className="text-sm text-slate-500 dark:text-stone-500">
//             No pictures yet &mdash; add your first one above.
//           </p>
//         )}
//         <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
//           {pictures.map((p, i) => (
//             <li
//               key={p._id}
//               className="overflow-hidden rounded-xl bg-[#0a1219]"
//               style={{ border: `1px solid ${hex400}1a` }}
//             >
//               <button
//                 type="button"
//                 onClick={() => onOpen(i)}
//                 aria-label={`Show picture ${p.number}: ${p.title}`}
//                 className="relative block w-full"
//               >
//                 <img
//                   src={thumbUrl(p.image.url)}
//                   alt=""
//                   className="aspect-square w-full object-cover"
//                 />
//                 <span
//                   className="absolute left-2 top-2 inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-bold text-[#04070a]"
//                   style={{ backgroundColor: shades[500] }}
//                 >
//                   {p.number}
//                 </span>
//               </button>
//               <div className="flex items-center justify-between gap-2 px-3 py-2">
//                 <span className="truncate text-sm font-medium text-stone-50">
//                   {p.title}
//                 </span>
//                 <DeleteButton
//                   label={`Delete ${p.title}`}
//                   isDeleting={deletingId === p._id}
//                   onDelete={() => deleteItem({ id: p._id })}
//                 />
//               </div>
//             </li>
//           ))}
//         </ul>
//       </section>
//     </div>
//   );
// }

"use client";

// app/pictures/page.tsx
// Rendered WITHOUT the sidebar/navbar (see app/components/AppShell.tsx).

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useAction, useQuery } from "convex/react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Images,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useDeleteSetAction } from "@/hooks/useDeleteSet";
import { HudPanel } from "@/app/components/HudPanel";
import { DeleteButton } from "@/app/components/DeleteButton";
import { MatrixBackground } from "@/app/components/MatrixBackground";
import { useColorTheme } from "@/app/context/ColorThemeContext";

type Picture = Doc<"pictureCards">;
type Mode = "present" | "manage";

// --- helpers ---------------------------------------------------------------

// Cloudinary delivers a resized, auto-format copy when a transformation
// segment is added after /upload/.
function withTransform(url: string, transform: string) {
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/${transform}/`)
    : url;
}

const bigUrl = (url: string) =>
  withTransform(url, "f_auto,q_auto,w_2000,c_limit");
const thumbUrl = (url: string) =>
  withTransform(url, "f_auto,q_auto,w_400,h_400,c_fill");

// Shrinks the photo in the browser before upload: phone photos can be 5-10 MB,
// and Convex action arguments are capped at 8 MiB.
async function fileToResizedDataUri(
  file: File,
  maxSide = 1600,
  quality = 0.85,
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't read that image."));
      el.src = objectUrl;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't process that image.");
    ctx.fillStyle = "#ffffff"; // JPEG has no transparency
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// --- page ------------------------------------------------------------------

export default function PicturesPage() {
  const [mode, setMode] = useState<Mode>("present");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const pictures = useQuery(api.picturesData.listMyPictures);
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  const count = pictures?.length ?? 0;
  // If pictures were deleted, keep the index inside the deck.
  const safeIndex = Math.min(index, Math.max(count - 1, 0));

  const goTo = useCallback(
    (target: number, dir: number) => {
      if (count === 0) return;
      setDirection(dir);
      setIndex(((target % count) + count) % count); // wraps around
    },
    [count],
  );

  const tabs: { id: Mode; label: string; icon: typeof Images }[] = [
    { id: "present", label: "Show pictures", icon: Images },
    { id: "manage", label: "Add & manage", icon: ImagePlus },
  ];

  const tabSwitcher = (
    <div
      className="inline-flex rounded-lg bg-[#0a1219] p-0.5"
      style={{ border: `1px solid ${hex400}33` }}
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setMode(id)}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition sm:text-sm"
          style={{
            backgroundColor: mode === id ? `${hex400}26` : undefined,
            color: mode === id ? "#fafaf9" : `${shades[300]}80`,
          }}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );

  // ---- Present mode: the picture takes the whole screen ----
  if (mode === "present") {
    return (
      <div className="relative h-dvh overflow-hidden">
        <MatrixBackground />
        <div className="relative z-10 flex h-full flex-col p-2 sm:p-3">
          {pictures === undefined ? (
            <>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 dark:text-stone-50">
                  Picture Talk
                </h1>
                {tabSwitcher}
              </div>
              <p className="text-sm text-slate-500 dark:text-stone-500">
                Loading...
              </p>
            </>
          ) : (
            <PresentView
              pictures={pictures}
              index={safeIndex}
              direction={direction}
              onGo={goTo}
              onManage={() => setMode("manage")}
              header={
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-stone-50">
                    Picture Talk
                  </h1>
                  {tabSwitcher}
                </div>
              }
            />
          )}
        </div>
      </div>
    );
  }

  // ---- Manage mode: normal scrolling page ----
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <MatrixBackground />
      <div className="relative z-10 mx-auto max-w-4xl p-4 lg:p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-stone-50">
            Picture Talk
          </h1>
          <p className="mt-2 max-w-xl text-slate-600 dark:text-stone-400">
            Add pictures with a title, then show them one at a time, nice and
            big &mdash; &ldquo;Have you ever tried this?&rdquo;
          </p>
        </header>
        <div className="mb-6">{tabSwitcher}</div>
        {pictures === undefined ? (
          <p className="text-sm text-slate-500 dark:text-stone-500">
            Loading...
          </p>
        ) : (
          <ManageView
            pictures={pictures}
            onOpen={(i) => {
              setDirection(1);
              setIndex(i);
              setMode("present");
            }}
          />
        )}
      </div>
    </div>
  );
}

// --- present mode ----------------------------------------------------------

function PresentView({
  pictures,
  index,
  direction,
  onGo,
  onManage,
  header,
}: {
  pictures: Picture[];
  index: number;
  direction: number;
  onGo: (target: number, dir: number) => void;
  onManage: () => void;
  header: ReactNode;
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

  if (n === 0 || !current) {
    return (
      <>
        <div className="mb-2">{header}</div>
        <HudPanel className="p-8 text-center">
          <p className="text-stone-300">No pictures yet.</p>
          <button
            type="button"
            onClick={onManage}
            className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-[#04070a] transition"
            style={{ backgroundColor: shades[500] }}
          >
            <ImagePlus className="h-4 w-4" />
            Add your first picture
          </button>
        </HudPanel>
      </>
    );
  }

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
    <>
      {/* Slim top bar: title + tabs on the left, small search on the right */}
      <div className="mb-2 flex items-center justify-between gap-3">
        {header}

        <form
          className="relative w-44 sm:w-60"
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
              boxShadow: searchFocused ? `0 0 0 2px ${hex400}33` : undefined,
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
                  initial={reduceMotion ? false : { scale: 0, rotate: -25 }}
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
  );
}

// --- add & manage mode -----------------------------------------------------

function ManageView({
  pictures,
  onOpen,
}: {
  pictures: Picture[];
  onOpen: (index: number) => void;
}) {
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;
  const addPicture = useAction(api.picturesActions.addPicture);
  const { deleteItem, deletingId } = useDeleteSetAction(
    api.picturesActions.deletePicture,
    "picture",
  );

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0); // remounts the file input to clear it
  const [titleFocused, setTitleFocused] = useState(false);

  const handleFile = (f: File | null) => {
    setError(null);
    if (f && !f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
    // Pre-fill the title from the file name ("big-red-dog.jpg" -> "big red dog").
    if (f && !title.trim()) {
      setTitle(
        f.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim(),
      );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || isUploading) return;
    setError(null);
    setIsUploading(true);
    try {
      const imageDataUri = await fileToResizedDataUri(file);
      const { number } = await addPicture({ title, imageDataUri });
      toast.success(`Added as picture #${number}`);
      handleFile(null);
      setTitle("");
      setInputKey((k) => k + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't add that picture.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <HudPanel className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label
            htmlFor="picture-file"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl px-4 py-6 text-center text-sm transition"
            style={{ border: `1px dashed ${hex400}4d`, color: shades[300] }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview of the chosen picture"
                className="max-h-64 rounded-lg object-contain"
              />
            ) : (
              <>
                <ImagePlus className="h-8 w-8" />
                Tap to choose a picture
              </>
            )}
          </label>
          <input
            id="picture-file"
            key={inputKey}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={isUploading}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          <div>
            <label
              htmlFor="picture-title"
              className="mb-2 block text-sm font-medium text-stone-200/80"
            >
              Title
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="picture-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                maxLength={80}
                placeholder="e.g. Riding a bike"
                disabled={isUploading}
                className="flex-1 rounded-lg bg-[#0a1219] px-4 py-2.5 text-stone-50 outline-none transition"
                style={{
                  border: `1px solid ${titleFocused ? hex400 : `${hex400}33`}`,
                  boxShadow: titleFocused ? `0 0 0 2px ${hex400}33` : undefined,
                }}
              />
              <button
                type="submit"
                disabled={!file || !title.trim() || isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-[#04070a] transition disabled:opacity-50"
                style={{ backgroundColor: shades[500] }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" />
                    Add as picture #{pictures.length + 1}
                  </>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </HudPanel>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-stone-100">
          Your pictures ({pictures.length})
        </h2>
        {pictures.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-stone-500">
            No pictures yet &mdash; add your first one above.
          </p>
        )}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {pictures.map((p, i) => (
            <li
              key={p._id}
              className="overflow-hidden rounded-xl bg-[#0a1219]"
              style={{ border: `1px solid ${hex400}1a` }}
            >
              <button
                type="button"
                onClick={() => onOpen(i)}
                aria-label={`Show picture ${p.number}: ${p.title}`}
                className="relative block w-full"
              >
                <img
                  src={thumbUrl(p.image.url)}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <span
                  className="absolute left-2 top-2 inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-bold text-[#04070a]"
                  style={{ backgroundColor: shades[500] }}
                >
                  {p.number}
                </span>
              </button>
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate text-sm font-medium text-stone-50">
                  {p.title}
                </span>
                <DeleteButton
                  label={`Delete ${p.title}`}
                  isDeleting={deletingId === p._id}
                  onDelete={() => deleteItem({ id: p._id })}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { ImagePlus, Pencil, Trash2, Loader2, Check, X } from "lucide-react";
import { HudPanel } from "@/app/components/HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

// Deliberately Convex-agnostic: this component only knows about files and
// strings. The page that uses it wires onUploadImage/onSaveObjective up to
// the actual Convex actions/mutations (see app/quick-questions/[id]/page.tsx
// for the wiring). That keeps this reusable for lessons, debate sets, life
// situations, etc. -- anywhere a "header" is needed, without a preset name
// tying it to one content type.
//
// Styling: built on <HudPanel> and the shared color-theme context, so it
// matches every other panel in the app and recolors when the theme changes.
// Colors below use hex + alpha suffixes (33 = 20%, 66 = 40%, 99 = 60%), the
// same convention HudPanel and the list page use.

export interface LessonHeaderProps {
  title: string;
  learningObjective?: string;
  imageUrl?: string;
  /** Disables editing (image + paragraph) -- e.g. while viewing someone else's set. */
  editable?: boolean;
  isUploadingImage?: boolean;
  isSavingObjective?: boolean;
  onUploadImage: (file: File) => void | Promise<void>;
  onRemoveImage?: () => void | Promise<void>;
  onSaveObjective: (text: string) => void | Promise<void>;
}

export function LessonHeader({
  title,
  learningObjective,
  imageUrl,
  editable = true,
  isUploadingImage = false,
  isSavingObjective = false,
  onUploadImage,
  onRemoveImage,
  onSaveObjective,
}: LessonHeaderProps) {
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [draftObjective, setDraftObjective] = useState(learningObjective ?? "");

  function handlePickImage() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUploadImage(file);
    e.target.value = "";
  }

  function startEditingObjective() {
    setDraftObjective(learningObjective ?? "");
    setIsEditingObjective(true);
  }

  async function saveObjective() {
    try {
      await onSaveObjective(draftObjective.trim());
      setIsEditingObjective(false);
    } catch {
      // The parent already showed the error. Stay in edit mode so the
      // teacher's draft isn't thrown away.
    }
  }

  return (
    <HudPanel>
      <header>
        {/* Hidden picker lives at the top level so the "Add header" button can
            open it even when no banner is on screen yet. */}
        {editable && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        )}

        {/* Image banner: only rendered once there is an image, or while the
            first one is uploading (so there is somewhere to show the spinner). */}
        {(imageUrl || isUploadingImage) && (
          <div
            className="group relative aspect-[21/9] w-full bg-[#0a1219]"
            style={{ borderBottom: `1px solid ${hex400}40` }}
          >
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {/* Fade the photo into the panel so the title sits on the
                    same dark surface as the rest of the card. */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#04070a]/80 to-transparent" />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2
                  className="h-6 w-6 animate-spin"
                  style={{ color: hex400 }}
                />
              </div>
            )}

            {editable && imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={handlePickImage}
                  disabled={isUploadingImage}
                  className="rounded-full bg-white/90 p-2 text-neutral-800 hover:bg-white"
                  aria-label="Replace image"
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                </button>
                {onRemoveImage && (
                  <button
                    type="button"
                    onClick={() => onRemoveImage()}
                    className="rounded-full bg-white/90 p-2 text-red-600 hover:bg-white"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          {/* Title + "Add header" */}
          <div className="flex items-start justify-between gap-4">
            <h1
              className="text-3xl font-bold tracking-tight text-stone-50"
              style={{ filter: `drop-shadow(0 0 20px ${hex400}59)` }}
            >
              {title}
            </h1>
            {editable && !imageUrl && !isUploadingImage && (
              <button
                type="button"
                onClick={handlePickImage}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition"
                style={{
                  borderColor: `${hex400}66`,
                  color: shades[300],
                  backgroundColor: `${hex400}14`,
                  boxShadow: `0 0 18px -8px ${hex400}99`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${hex400}2e`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${hex400}14`;
                }}
              >
                <ImagePlus className="h-4 w-4" />
                Add header
              </button>
            )}
          </div>

          {/* What you'll learn today */}
          <div
            className="mt-5 border-l-2 pl-4"
            style={{ borderColor: `${hex400}99` }}
          >
            <p
              className="mb-1.5 font-[family-name:var(--font-hud)] text-xs uppercase tracking-[0.2em]"
              style={{ color: `${shades[300]}b3` }}
            >
              What you&apos;ll learn today
            </p>

            {isEditingObjective ? (
              <div className="space-y-3">
                <textarea
                  value={draftObjective}
                  onChange={(e) => setDraftObjective(e.target.value)}
                  rows={3}
                  autoFocus
                  className="w-full resize-none rounded-lg border bg-[#0a1219] p-3 text-stone-50 outline-none transition-colors"
                  style={{ borderColor: `${hex400}33` }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = hex400;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${hex400}33`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = `${hex400}33`;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveObjective}
                    disabled={isSavingObjective}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#04070a] transition disabled:opacity-60"
                    style={{
                      backgroundColor: shades[500],
                      boxShadow: `0 0 20px -6px ${hex400}80`,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSavingObjective) {
                        e.currentTarget.style.backgroundColor = hex400;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = shades[500];
                    }}
                  >
                    {isSavingObjective ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingObjective(false)}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-stone-300 transition hover:bg-white/5"
                    style={{ borderColor: `${hex400}33` }}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group/objective flex items-start justify-between gap-3">
                <p className="leading-relaxed text-stone-200">
                  {learningObjective || (
                    <span className="italic text-stone-500">
                      No summary yet for what today&apos;s practice covers.
                    </span>
                  )}
                </p>
                {editable && (
                  <button
                    type="button"
                    onClick={startEditingObjective}
                    // Hidden until the row is hovered. Still reachable by keyboard (focus) and
                    // shown on touch screens, which have no hover.
                    className="shrink-0 rounded-md p-1.5 opacity-0 transition hover:bg-white/5 hover:opacity-100 focus-visible:opacity-100 group-hover/objective:opacity-100 [@media(hover:none)]:opacity-70"
                    style={{ color: shades[300] }}
                    aria-label="Edit summary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </HudPanel>
  );
}

// convex/topNewsActions.ts
//
// Actions (not mutations) because they talk to Cloudinary over the network.
// Every action checks ownership first via the public `getTopNewsLesson`
// query, which runs with the caller's Clerk identity and returns null for
// anyone else's lesson. Mirrors convex/lifeSituationsActions.ts.

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../lib/cloudinary";

const CLOUDINARY_FOLDER = "lesson-headers";

// The browser downsizes to ~1600px JPEG (a few hundred KB) before sending.
// This is only a backstop, and stays well under Convex's 8 MiB argument cap.
const MAX_DATA_URI_LENGTH = 6_000_000;

async function requireOwnedLesson(
  ctx: ActionCtx,
  id: Id<"topNewsLessons">,
): Promise<Doc<"topNewsLessons">> {
  const lesson = await ctx.runQuery(api.topNewsData.getTopNewsLesson, { id });
  if (!lesson) throw new Error("Top News lesson not found.");
  return lesson;
}

/**
 * Replace the header image. Used both for a teacher manually swapping the
 * image from the lesson page, and (indirectly, via uploadImageToCloudinary
 * directly) at generation time in convex/topNews.ts when Tavily found an
 * image alongside the article.
 */
export const uploadHeaderImage = action({
  args: { id: v.id("topNewsLessons"), imageDataUri: v.string() },
  handler: async (ctx, { id, imageDataUri }): Promise<{ url: string }> => {
    if (!imageDataUri.startsWith("data:image/")) {
      throw new Error("That file doesn't look like an image.");
    }
    if (imageDataUri.length > MAX_DATA_URI_LENGTH) {
      throw new Error("That image is too large. Try a smaller one.");
    }

    const lesson = await requireOwnedLesson(ctx, id);

    const uploaded = await uploadImageToCloudinary(
      imageDataUri,
      CLOUDINARY_FOLDER,
    );

    try {
      await ctx.runMutation(internal.topNewsData.setHeaderImage, {
        id,
        url: uploaded.url,
        publicId: uploaded.publicId,
      });
    } catch (err) {
      // DB write failed: don't leave an orphan behind in Cloudinary.
      await deleteImageFromCloudinary(uploaded.publicId).catch((e) =>
        console.error("Cleanup of orphaned upload failed", e),
      );
      throw err;
    }

    // Replacing? Remove the previous asset only now that the row points at
    // the new one (a failure here just leaves one stray file, so it's
    // logged rather than failing an upload the teacher can already see
    // working -- e.g. replacing the article's auto-fetched image).
    if (lesson.headerImage) {
      await deleteImageFromCloudinary(lesson.headerImage.publicId).catch((e) =>
        console.error("Couldn't delete replaced header image", e),
      );
    }

    return { url: uploaded.url };
  },
});

/** Remove the header image (Cloudinary first, then the DB reference). */
export const removeHeaderImage = action({
  args: { id: v.id("topNewsLessons") },
  handler: async (ctx, { id }): Promise<null> => {
    const lesson = await requireOwnedLesson(ctx, id);
    if (!lesson.headerImage) return null;

    await deleteImageFromCloudinary(lesson.headerImage.publicId);
    await ctx.runMutation(internal.topNewsData.clearHeaderImage, { id });
    return null;
  },
});

/**
 * Delete the whole lesson AND its Cloudinary image (whether that image was
 * auto-fetched from the article at generation time, or replaced later by
 * the teacher). Use with
 * `useDeleteSetAction(api.topNewsActions.deleteTopNewsLesson, "news lesson")`.
 */
export const deleteTopNewsLesson = action({
  args: { id: v.id("topNewsLessons") },
  handler: async (ctx, { id }): Promise<null> => {
    const lesson = await requireOwnedLesson(ctx, id);
    if (lesson.headerImage) {
      await deleteImageFromCloudinary(lesson.headerImage.publicId);
    }
    await ctx.runMutation(internal.topNewsData.deleteRow, { id });
    return null;
  },
});

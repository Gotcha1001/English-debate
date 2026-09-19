"use node";

// Actions (not mutations) because they talk to Cloudinary over the network.
// Every action checks ownership first via the public `getGrammarSet` query,
// which runs with the caller's Clerk identity and returns null for anyone
// else's set. Mirrors convex/quickQuestionsActions.ts.

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

async function requireOwnedSet(
  ctx: ActionCtx,
  id: Id<"grammarSets">,
): Promise<Doc<"grammarSets">> {
  const set = await ctx.runQuery(api.grammarData.getGrammarSet, { id });
  if (!set) throw new Error("Grammar breakdown not found.");
  return set;
}

/** Upload (or replace) the header image. Returns the new delivery URL. */
export const uploadHeaderImage = action({
  args: { id: v.id("grammarSets"), imageDataUri: v.string() },
  handler: async (ctx, { id, imageDataUri }): Promise<{ url: string }> => {
    if (!imageDataUri.startsWith("data:image/")) {
      throw new Error("That file doesn't look like an image.");
    }
    if (imageDataUri.length > MAX_DATA_URI_LENGTH) {
      throw new Error("That image is too large. Try a smaller one.");
    }

    const set = await requireOwnedSet(ctx, id);

    const uploaded = await uploadImageToCloudinary(
      imageDataUri,
      CLOUDINARY_FOLDER,
    );

    try {
      await ctx.runMutation(internal.grammarData.setHeaderImage, {
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
    // the new one. A failure here just leaves one stray file, so we log it
    // rather than failing an upload the teacher can already see working.
    if (set.headerImage) {
      await deleteImageFromCloudinary(set.headerImage.publicId).catch((e) =>
        console.error("Couldn't delete replaced header image", e),
      );
    }

    return { url: uploaded.url };
  },
});

/** Remove the header image (Cloudinary first, then the DB reference). */
export const removeHeaderImage = action({
  args: { id: v.id("grammarSets") },
  handler: async (ctx, { id }): Promise<null> => {
    const set = await requireOwnedSet(ctx, id);
    if (!set.headerImage) return null;

    // Cloudinary first: if this throws, the row still points at the image
    // and the teacher can simply retry. deleteImageFromCloudinary treats
    // "not found" as success, so a retry after a half-finished attempt is safe.
    await deleteImageFromCloudinary(set.headerImage.publicId);
    await ctx.runMutation(internal.grammarData.clearHeaderImage, { id });
    return null;
  },
});

/**
 * Delete the whole set AND its Cloudinary image. Replaces the old
 * `grammarData.deleteGrammarSet` mutation, which couldn't reach Cloudinary.
 * Use it with
 * `useDeleteSetAction(api.grammarActions.deleteGrammarSet, "grammar breakdown")`.
 */
export const deleteGrammarSet = action({
  args: { id: v.id("grammarSets") },
  handler: async (ctx, { id }): Promise<null> => {
    const set = await requireOwnedSet(ctx, id);
    if (set.headerImage) {
      // If this fails we stop before deleting the row, so nothing is orphaned
      // and "Try again" in the toast works.
      await deleteImageFromCloudinary(set.headerImage.publicId);
    }
    await ctx.runMutation(internal.grammarData.deleteRow, { id });
    return null;
  },
});

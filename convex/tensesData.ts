import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";

const MAX_OBJECTIVE_LENGTH = 600;

async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
}

const tenseValidator = v.union(
  v.literal("Present Simple"),
  v.literal("Past Simple"),
  v.literal("Past Continuous"),
  v.literal("Present Perfect"),
  v.literal("Future Simple"),
);

const variantValidator = v.object({
  tense: tenseValidator,
  sentence: v.string(),
  options: v.array(v.string()),
  correctIndex: v.number(),
});

const sentenceValidator = v.object({
  sentence: v.string(),
  variants: v.array(variantValidator),
});

export const saveTenseSet = internalMutation({
  args: {
    topic: v.string(),
    sentences: v.array(sentenceValidator),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tenseSets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Tenses sets the signed-in user has generated, most recent first. */
export const listMyTenseSets = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("tenseSets")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

/**
 * CHANGED: now owner-only (returns null for anyone else's set or when signed
 * out), same as quickQuestionsData.get. The set page shows edit controls for
 * the header image, and tensesActions.ts uses this query as its ownership
 * check, so it must not hand out other people's sets.
 */
export const getTenseSet = query({
  args: { id: v.id("tenseSets") },
  handler: async (ctx, { id }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return null;
    const doc = await ctx.db.get(id);
    if (!doc || doc.createdBy !== me._id) return null;
    return doc;
  },
});

// NOTE: the old `deleteTenseSet` mutation is gone. A mutation can't reach
// Cloudinary, so deleting a set that has a header image would orphan the
// file. Use `api.tensesActions.deleteTenseSet` (an action) instead -- it
// removes the image first, then calls `deleteRow` below.

/** Rename -- rounds out CRUD alongside create/read/delete. */
export const renameTenseSet = mutation({
  args: { id: v.id("tenseSets"), topic: v.string() },
  handler: async (ctx, { id, topic }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("You must be signed in to rename a set.");
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Set not found.");
    if (existing.createdBy !== me._id) {
      throw new Error("You can only rename your own sets.");
    }
    if (!topic.trim()) throw new Error("Topic can't be empty.");
    await ctx.db.patch(id, { topic: topic.trim() });
  },
});

// Teacher edits the "What you'll learn today" paragraph on the set page.
export const updateLearningObjective = mutation({
  args: { id: v.id("tenseSets"), learningObjective: v.string() },
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.createdBy !== me._id) throw new Error("Not found");
    const text = args.learningObjective.trim();
    if (text.length > MAX_OBJECTIVE_LENGTH) {
      throw new Error(`Keep it under ${MAX_OBJECTIVE_LENGTH} characters.`);
    }
    await ctx.db.patch(args.id, { learningObjective: text });
  },
});

// --- internal (called only from tensesActions.ts) -----------------------

export const setHeaderImage = internalMutation({
  args: {
    id: v.id("tenseSets"),
    url: v.string(),
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      headerImage: { url: args.url, publicId: args.publicId },
    });
  },
});

export const clearHeaderImage = internalMutation({
  args: { id: v.id("tenseSets") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { headerImage: undefined });
  },
});

export const deleteRow = internalMutation({
  args: { id: v.id("tenseSets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

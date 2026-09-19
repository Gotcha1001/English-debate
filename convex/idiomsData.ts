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

const relatedExpressionValidator = v.object({
  phrase: v.string(),
  meaning: v.string(),
  example: v.string(),
});

const choicePairValidator = v.object({
  optionA: v.string(),
  optionB: v.string(),
});

export const saveIdiomSet = internalMutation({
  args: {
    topic: v.string(),
    idiom: v.string(),
    goal: v.string(),
    origin: v.string(),
    example: v.string(),
    relatedExpressions: v.array(relatedExpressionValidator),
    choicePrompt: v.string(),
    choicePairs: v.array(choicePairValidator),
    standScaleLabels: v.array(v.string()),
    standQuestions: v.array(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("idiomSets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Idiom sets the signed-in user has generated, most recent first. */
export const listMyIdiomSets = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("idiomSets")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

/**
 * CHANGED: now owner-only (returns null for anyone else's set or when signed
 * out), same as quickQuestionsData.get. The set page shows edit controls for
 * the header image, and idiomsActions.ts uses this query as its ownership
 * check, so it must not hand out other people's sets.
 */
export const getIdiomSet = query({
  args: { id: v.id("idiomSets") },
  handler: async (ctx, { id }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return null;
    const doc = await ctx.db.get(id);
    if (!doc || doc.createdBy !== me._id) return null;
    return doc;
  },
});

// NOTE: the old `deleteIdiomSet` mutation is gone. A mutation can't reach
// Cloudinary, so deleting a set that has a header image would orphan the
// file. Use `api.idiomsActions.deleteIdiomSet` (an action) instead -- it
// removes the image first, then calls `deleteRow` below.

/** Rename -- rounds out CRUD alongside create/read/delete. */
export const renameIdiomSet = mutation({
  args: { id: v.id("idiomSets"), topic: v.string() },
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
  args: { id: v.id("idiomSets"), learningObjective: v.string() },
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

// --- internal (called only from idiomsActions.ts) -----------------------

export const setHeaderImage = internalMutation({
  args: {
    id: v.id("idiomSets"),
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
  args: { id: v.id("idiomSets") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { headerImage: undefined });
  },
});

export const deleteRow = internalMutation({
  args: { id: v.id("idiomSets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

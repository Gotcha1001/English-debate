import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";

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

export const getIdiomSet = query({
  args: { id: v.id("idiomSets") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Delete -- only the owner can delete their own set. */
export const deleteIdiomSet = mutation({
  args: { id: v.id("idiomSets") },
  handler: async (ctx, { id }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("You must be signed in to delete a set.");
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Set not found.");
    if (existing.createdBy !== me._id) {
      throw new Error("You can only delete your own sets.");
    }
    await ctx.db.delete(id);
  },
});

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

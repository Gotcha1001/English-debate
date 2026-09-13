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

const groupValidator = v.object({
  concept: v.string(),
  spectrumLabel: v.string(),
  words: v.array(v.string()),
  connotationNote: v.string(),
  fillBlankSentence: v.string(),
  correctWordIndex: v.number(),
  debateQuestion: v.string(),
});

export const saveSynonymSet = internalMutation({
  args: {
    topic: v.string(),
    groups: v.array(groupValidator),
    discussionQuestions: v.array(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("synonymSets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Synonym sets the signed-in user has generated, most recent first. */
export const listMySynonymSets = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("synonymSets")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

export const getSynonymSet = query({
  args: { id: v.id("synonymSets") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Delete -- only the owner can delete their own set. */
export const deleteSynonymSet = mutation({
  args: { id: v.id("synonymSets") },
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
export const renameSynonymSet = mutation({
  args: { id: v.id("synonymSets"), topic: v.string() },
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

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

export const saveQuickQuestionSet = internalMutation({
  args: {
    topic: v.string(),
    questions: v.array(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // No category on creation = "general discussion" (nothing lit up).
    return await ctx.db.insert("quickQuestionSets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Quick question sets the signed-in user has generated, most recent first. */
export const listMyQuickQuestionSets = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("quickQuestionSets")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

export const getQuickQuestionSet = query({
  args: { id: v.id("quickQuestionSets") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Delete — only the owner can delete their own set. */
export const deleteQuickQuestionSet = mutation({
  args: { id: v.id("quickQuestionSets") },
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

/** Rename — rounds out CRUD alongside create/read/delete. */
export const renameQuickQuestionSet = mutation({
  args: { id: v.id("quickQuestionSets"), topic: v.string() },
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

/**
 * Tag a set as "frequent" (star) or "deep" (serious topic), or pass null to
 * clear the tag and put it back to general discussion.
 */
export const setQuickQuestionCategory = mutation({
  args: {
    id: v.id("quickQuestionSets"),
    category: v.union(v.literal("frequent"), v.literal("deep"), v.null()),
  },
  handler: async (ctx, { id, category }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("You must be signed in to tag a set.");
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Set not found.");
    if (existing.createdBy !== me._id) {
      throw new Error("You can only tag your own sets.");
    }
    // Patching a field to undefined removes it in Convex.
    await ctx.db.patch(id, { category: category ?? undefined });
  },
});

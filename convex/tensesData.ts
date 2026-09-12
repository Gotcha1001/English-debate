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

export const getTenseSet = query({
  args: { id: v.id("tenseSets") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Delete -- only the owner can delete their own set. */
export const deleteTenseSet = mutation({
  args: { id: v.id("tenseSets") },
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

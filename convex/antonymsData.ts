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

const pairValidator = v.object({
  word: v.string(),
  antonym: v.string(),
  exampleSentence: v.string(),
});

const analogyValidator = v.object({
  pairIndexA: v.number(),
  pairIndexB: v.number(),
  options: v.array(v.string()),
  correctIndex: v.number(),
});

export const saveAntonymSet = internalMutation({
  args: {
    topic: v.string(),
    pairs: v.array(pairValidator),
    analogies: v.array(analogyValidator),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("antonymSets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Antonym sets the signed-in user has generated, most recent first. */
export const listMyAntonymSets = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("antonymSets")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

export const getAntonymSet = query({
  args: { id: v.id("antonymSets") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Delete -- only the owner can delete their own set. */
export const deleteAntonymSet = mutation({
  args: { id: v.id("antonymSets") },
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
export const renameAntonymSet = mutation({
  args: { id: v.id("antonymSets"), topic: v.string() },
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

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

export const saveLifeSituationSet = internalMutation({
  args: {
    topic: v.string(),
    situations: v.array(
      v.object({ scenario: v.string(), options: v.array(v.string()) }),
    ),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lifeSituationSets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listMyLifeSituationSets = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("lifeSituationSets")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

export const getLifeSituationSet = query({
  args: { id: v.id("lifeSituationSets") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const deleteLifeSituationSet = mutation({
  args: { id: v.id("lifeSituationSets") },
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

export const renameLifeSituationSet = mutation({
  args: { id: v.id("lifeSituationSets"), topic: v.string() },
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

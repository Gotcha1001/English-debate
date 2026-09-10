// convex/debateData.ts
import { v } from "convex/values";
import { internalMutation, query, type QueryCtx } from "./_generated/server";

async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
}

export const saveDebateSet = internalMutation({
  args: {
    topic: v.string(),
    questions: v.array(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("debateSets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Debate sets the signed-in user has generated, most recent first. */
export const listMyDebateSets = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("debateSets")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

/** A single debate set by id, for the display page. */
export const getDebateSet = query({
  args: { id: v.id("debateSets") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

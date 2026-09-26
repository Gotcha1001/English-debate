// convex/topNewsData.ts

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

export const saveTopNewsLesson = internalMutation({
  args: {
    headline: v.string(),
    story: v.string(),
    comprehensionQuestions: v.array(
      v.object({ question: v.string(), answer: v.string() }),
    ),
    vocabulary: v.array(v.object({ word: v.string(), meaning: v.string() })),
    discussionQuestions: v.array(v.string()),
    sourceName: v.string(),
    sourceUrl: v.string(),
    publishedDate: v.optional(v.string()),
    headerImage: v.optional(
      v.object({ url: v.string(), publicId: v.string() }),
    ),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("topNewsLessons", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listMyTopNewsLessons = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("topNewsLessons")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

/**
 * Owner-only (returns null for anyone else's lesson or when signed out),
 * same as lifeSituationsData.getLifeSituationSet. Doubles as the ownership
 * check used by topNewsActions.ts.
 */
export const getTopNewsLesson = query({
  args: { id: v.id("topNewsLessons") },
  handler: async (ctx, { id }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return null;
    const doc = await ctx.db.get(id);
    if (!doc || doc.createdBy !== me._id) return null;
    return doc;
  },
});

// Teacher edits the "What you'll learn today" paragraph on the lesson page.
export const updateLearningObjective = mutation({
  args: { id: v.id("topNewsLessons"), learningObjective: v.string() },
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

// --- internal (called only from topNewsActions.ts and topNews.ts) -------

export const setHeaderImage = internalMutation({
  args: { id: v.id("topNewsLessons"), url: v.string(), publicId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      headerImage: { url: args.url, publicId: args.publicId },
    });
  },
});

export const clearHeaderImage = internalMutation({
  args: { id: v.id("topNewsLessons") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { headerImage: undefined });
  },
});

export const deleteRow = internalMutation({
  args: { id: v.id("topNewsLessons") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

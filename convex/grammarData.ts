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

const partOfSpeechValidator = v.union(
  v.literal("noun"),
  v.literal("pronoun"),
  v.literal("verb"),
  v.literal("adjective"),
  v.literal("adverb"),
  v.literal("article"),
  v.literal("preposition"),
  v.literal("conjunction"),
  v.literal("interjection"),
);

const sentenceValidator = v.object({
  sentence: v.string(),
  tokens: v.array(
    v.object({ word: v.string(), partOfSpeech: partOfSpeechValidator }),
  ),
  quiz: v.array(v.object({ question: v.string(), answer: v.string() })),
});

export const saveGrammarSet = internalMutation({
  args: {
    topic: v.string(),
    sentences: v.array(sentenceValidator),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("grammarSets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Grammar breakdown sets the signed-in user has generated, most recent first. */
export const listMyGrammarSets = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("grammarSets")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

export const getGrammarSet = query({
  args: { id: v.id("grammarSets") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Delete -- only the owner can delete their own set. */
export const deleteGrammarSet = mutation({
  args: { id: v.id("grammarSets") },
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
export const renameGrammarSet = mutation({
  args: { id: v.id("grammarSets"), topic: v.string() },
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

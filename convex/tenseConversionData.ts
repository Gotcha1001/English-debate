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

// Same union used in tensesData.ts -- pull this into one shared file
// (e.g. convex/lib/tenseValidator.ts) if you'd rather not repeat it twice.
const tenseValidator = v.union(
  v.literal("Present Simple"),
  v.literal("Past Simple"),
  v.literal("Past Continuous"),
  v.literal("Present Perfect"),
  v.literal("Future Simple"),
);

const sentenceValidator = v.object({
  sentence: v.string(),
  fromTense: tenseValidator,
  toTense: tenseValidator,
  answer: v.string(),
});

export const saveTenseConversionSet = internalMutation({
  args: {
    topic: v.string(),
    sentences: v.array(sentenceValidator),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tenseConversionSets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Tense conversion sets the signed-in user has generated, most recent first. */
export const listMyTenseConversionSets = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("tenseConversionSets")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

export const getTenseConversionSet = query({
  args: { id: v.id("tenseConversionSets") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Delete -- only the owner can delete their own set. */
export const deleteTenseConversionSet = mutation({
  args: { id: v.id("tenseConversionSets") },
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
export const renameTenseConversionSet = mutation({
  args: { id: v.id("tenseConversionSets"), topic: v.string() },
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

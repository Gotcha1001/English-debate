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

/**
 * CHANGED: now owner-only (returns null for anyone else's set or when signed
 * out), same as quickQuestionsData.get. The set page shows edit controls for
 * the header image, and tenseConversionActions.ts uses this query as its
 * ownership check, so it must not hand out other people's sets.
 */
export const getTenseConversionSet = query({
  args: { id: v.id("tenseConversionSets") },
  handler: async (ctx, { id }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return null;
    const doc = await ctx.db.get(id);
    if (!doc || doc.createdBy !== me._id) return null;
    return doc;
  },
});

// NOTE: the old `deleteTenseConversionSet` mutation is gone. A mutation can't
// reach Cloudinary, so deleting a set that has a header image would orphan
// the file. Use `api.tenseConversionActions.deleteTenseConversionSet` (an
// action) instead -- it removes the image first, then calls `deleteRow`.

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

// Teacher edits the "What you'll learn today" paragraph on the set page.
export const updateLearningObjective = mutation({
  args: { id: v.id("tenseConversionSets"), learningObjective: v.string() },
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

// --- internal (called only from tenseConversionActions.ts) --------------

export const setHeaderImage = internalMutation({
  args: {
    id: v.id("tenseConversionSets"),
    url: v.string(),
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      headerImage: { url: args.url, publicId: args.publicId },
    });
  },
});

export const clearHeaderImage = internalMutation({
  args: { id: v.id("tenseConversionSets") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { headerImage: undefined });
  },
});

export const deleteRow = internalMutation({
  args: { id: v.id("tenseConversionSets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

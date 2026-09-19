// convex/wordRelationsData.ts
//
// Full file. Your schema already spreads `...headerFields` into
// wordRelationSets (headerImage + learningObjective), so no schema change is
// needed.
//
// Deleting a set is NOT done here: a mutation can't reach Cloudinary. Use
// `api.wordRelationsActions.deleteWordRelationSet` (an action), which removes
// the image and then calls `deleteRow` below.
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

const MAX_OBJECTIVE_LENGTH = 600;

const groupValidator = v.object({
  word: v.string(),
  synonymOptions: v.array(v.string()), // exactly 4
  correctSynonymIndex: v.number(),
  antonymOptions: v.array(v.string()), // exactly 4
  correctAntonymIndex: v.number(),
  debateQuestion: v.string(),
});

// --- create / read -------------------------------------------------------

/** Called only from wordRelations.ts (generateWordRelationSet). */
export const saveWordRelationSet = internalMutation({
  args: {
    topic: v.string(),
    groups: v.array(groupValidator),
    discussionQuestions: v.array(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wordRelationSets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Word relation sets the signed-in user has generated, most recent first. */
export const listMyWordRelationSets = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("wordRelationSets")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

/**
 * Owner-only: returns null for anyone else's set or when signed out. The set
 * page shows edit controls for the header image, and wordRelationsActions.ts
 * uses this query as its ownership check, so it must not hand out other
 * people's sets.
 */
export const getWordRelationSet = query({
  args: { id: v.id("wordRelationSets") },
  handler: async (ctx, { id }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return null;
    const doc = await ctx.db.get(id);
    if (!doc || doc.createdBy !== me._id) return null;
    return doc;
  },
});

// --- header editing ------------------------------------------------------

// Teacher edits the "What you'll learn today" paragraph on the set page.
export const updateLearningObjective = mutation({
  args: { id: v.id("wordRelationSets"), learningObjective: v.string() },
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

// --- internal (called only from wordRelationsActions.ts) -----------------

export const setHeaderImage = internalMutation({
  args: {
    id: v.id("wordRelationSets"),
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
  args: { id: v.id("wordRelationSets") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { headerImage: undefined });
  },
});

export const deleteRow = internalMutation({
  args: { id: v.id("wordRelationSets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

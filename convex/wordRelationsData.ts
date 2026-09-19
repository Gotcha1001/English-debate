// convex/wordRelationsData.ts
//
// NOTE: your schema already spreads `...headerFields` into wordRelationSets
// (headerImage + learningObjective), so no schema change is needed.
//
// TWO changes below:
//   1. REPLACE the existing `getWordRelationSet` with the owner-scoped
//      version (it currently returns any set to anyone).
//   2. ADD `updateLearningObjective` + the three internal mutations.

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

// --- 1. REPLACE the existing getWordRelationSet with this ------------------
//
// Old version (remove it):
//   export const getWordRelationSet = query({
//     args: { id: v.id("wordRelationSets") },
//     handler: async (ctx, { id }) => {
//       return await ctx.db.get(id);
//     },
//   });
//
// New version: owner-only, same as getGrammarSet / getTenseSet elsewhere.
// The set page shows edit controls for the header image, and
// wordRelationsActions.ts uses this query as its ownership check, so it
// must not hand out other people's sets.
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

// --- 2. ADD these, alongside your existing exports --------------------------

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

// --- internal (called only from wordRelationsActions.ts) ------------------

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

// NOTE: your existing `deleteWordRelationSet` mutation (plain, owner-checked)
// can stay if the set has no header image, but once it does, a mutation
// can't reach Cloudinary. Swap the list/detail page's delete button over to
// `api.wordRelationsActions.deleteWordRelationSet` (see that file) so the
// Cloudinary asset gets cleaned up too, and remove this plain mutation to
// avoid two ways to delete a set:
//
//   export const deleteWordRelationSet = mutation({ ... });   // <- remove

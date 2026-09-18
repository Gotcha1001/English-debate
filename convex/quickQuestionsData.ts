import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

const MAX_OBJECTIVE_LENGTH = 600;

// --- auth helpers ------------------------------------------------------

async function getUserIdOrNull(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  return user?._id ?? null;
}

async function requireUserId(ctx: QueryCtx): Promise<Id<"users">> {
  const userId = await getUserIdOrNull(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

// --- public queries ----------------------------------------------------
// Queries return [] / null instead of throwing when signed out, so a page
// that renders a moment before Clerk finishes loading doesn't crash.

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserIdOrNull(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("quickQuestionSets")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("quickQuestionSets") },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrNull(ctx);
    if (!userId) return null;
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.createdBy !== userId) return null;
    return doc;
  },
});

// --- public mutations ----------------------------------------------------

// Teacher edits the AI-drafted "What you'll learn today" paragraph.
export const updateLearningObjective = mutation({
  args: { id: v.id("quickQuestionSets"), learningObjective: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.createdBy !== userId) throw new Error("Not found");
    const text = args.learningObjective.trim();
    if (text.length > MAX_OBJECTIVE_LENGTH) {
      throw new Error(`Keep it under ${MAX_OBJECTIVE_LENGTH} characters.`);
    }
    await ctx.db.patch(args.id, { learningObjective: text });
  },
});

// Star / brain tags on the list page (same behaviour as before, new name).
// Pass null to clear the tag back to "general discussion".
export const setCategory = mutation({
  args: {
    id: v.id("quickQuestionSets"),
    category: v.union(v.literal("frequent"), v.literal("deep"), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.createdBy !== userId) throw new Error("Not found");
    // Patching a field to undefined removes it in Convex.
    await ctx.db.patch(args.id, { category: args.category ?? undefined });
  },
});

// --- internal (called only from quickQuestions*.ts actions) --------------

export const getUserIdByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("No matching user record for this account");
    return user._id;
  },
});

export const saveGenerated = internalMutation({
  args: {
    topic: v.string(),
    questions: v.array(v.string()),
    learningObjective: v.string(),
    category: v.optional(v.union(v.literal("frequent"), v.literal("deep"))),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quickQuestionSets", {
      topic: args.topic,
      questions: args.questions,
      learningObjective: args.learningObjective,
      category: args.category,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
  },
});

export const setHeaderImage = internalMutation({
  args: {
    id: v.id("quickQuestionSets"),
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
  args: { id: v.id("quickQuestionSets") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { headerImage: undefined });
  },
});

export const deleteRow = internalMutation({
  args: { id: v.id("quickQuestionSets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// import { v } from "convex/values";
// import {
//   internalMutation,
//   mutation,
//   query,
//   type QueryCtx,
// } from "./_generated/server"; // merge with existing import if lessonData.ts already imports `query` etc.

// async function getCurrentUser(ctx: QueryCtx) {
//   const identity = await ctx.auth.getUserIdentity();
//   if (!identity) return null;
//   return await ctx.db
//     .query("users")
//     .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//     .first();
// }

// /** A single lesson by id, for the display page. */
// export const getLesson = query({
//   args: { id: v.id("lessons") },
//   handler: async (ctx, { id }) => {
//     return await ctx.db.get(id);
//   },
// });

// export const listMyLessons = query({
//   args: {},
//   handler: async (ctx) => {
//     const me = await getCurrentUser(ctx);
//     if (!me) return [];
//     return await ctx.db
//       .query("lessons")
//       .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
//       .order("desc")
//       .collect();
//   },
// });

// export const deleteLesson = mutation({
//   args: { id: v.id("lessons") },
//   handler: async (ctx, { id }) => {
//     const me = await getCurrentUser(ctx);
//     if (!me) throw new Error("You must be signed in to delete a lesson.");
//     const existing = await ctx.db.get(id);
//     if (!existing) throw new Error("Lesson not found.");
//     if (existing.createdBy !== me._id) {
//       throw new Error("You can only delete your own lessons.");
//     }
//     await ctx.db.delete(id);
//   },
// });

// export const renameLesson = mutation({
//   args: { id: v.id("lessons"), topic: v.string() },
//   handler: async (ctx, { id, topic }) => {
//     const me = await getCurrentUser(ctx);
//     if (!me) throw new Error("You must be signed in to rename a lesson.");
//     const existing = await ctx.db.get(id);
//     if (!existing) throw new Error("Lesson not found.");
//     if (existing.createdBy !== me._id) {
//       throw new Error("You can only rename your own lessons.");
//     }
//     if (!topic.trim()) throw new Error("Topic can't be empty.");
//     await ctx.db.patch(id, { topic: topic.trim() });
//   },
// });

// export const saveLesson = internalMutation({
//   args: {
//     topic: v.string(),
//     story: v.string(),
//     comprehensionQuestions: v.array(
//       v.object({ question: v.string(), answer: v.string() }),
//     ),
//     multipleChoice: v.array(
//       v.object({
//         question: v.string(),
//         options: v.array(v.string()),
//         correctIndex: v.number(),
//       }),
//     ),
//     vocabulary: v.array(v.object({ word: v.string(), meaning: v.string() })),
//     discussionQuestions: v.array(v.string()),
//     sentenceAnalysis: v.array(
//       v.object({
//         sentence: v.string(),
//         subject: v.string(),
//         verb: v.string(),
//         adverb: v.optional(v.string()),
//       }),
//     ),
//     createdBy: v.id("users"),
//   },
//   handler: async (ctx, args) => {
//     return await ctx.db.insert("lessons", {
//       ...args,
//       createdAt: Date.now(),
//     });
//   },
// });

import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server"; // merge with existing import if lessonData.ts already imports `query` etc.

const MAX_OBJECTIVE_LENGTH = 600;

async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
}

/**
 * A single lesson by id, for the display page.
 *
 * CHANGED: now owner-only (returns null for anyone else's lesson or when
 * signed out), same as quickQuestionsData.get. The lesson page shows edit
 * controls for the header image, and lessonsActions.ts uses this query as
 * its ownership check, so it must not hand out other people's lessons.
 */
export const getLesson = query({
  args: { id: v.id("lessons") },
  handler: async (ctx, { id }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return null;
    const doc = await ctx.db.get(id);
    if (!doc || doc.createdBy !== me._id) return null;
    return doc;
  },
});

export const listMyLessons = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await ctx.db
      .query("lessons")
      .withIndex("by_creator", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .collect();
  },
});

// NOTE: the old `deleteLesson` mutation is gone. A mutation can't reach
// Cloudinary, so deleting a lesson that has a header image would orphan the
// file. Use `api.lessonsActions.deleteLesson` (an action) instead -- it
// removes the image first, then calls `deleteRow` below.

export const renameLesson = mutation({
  args: { id: v.id("lessons"), topic: v.string() },
  handler: async (ctx, { id, topic }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("You must be signed in to rename a lesson.");
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Lesson not found.");
    if (existing.createdBy !== me._id) {
      throw new Error("You can only rename your own lessons.");
    }
    if (!topic.trim()) throw new Error("Topic can't be empty.");
    await ctx.db.patch(id, { topic: topic.trim() });
  },
});

// Teacher edits the "What you'll learn today" paragraph on the lesson page.
export const updateLearningObjective = mutation({
  args: { id: v.id("lessons"), learningObjective: v.string() },
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

export const saveLesson = internalMutation({
  args: {
    topic: v.string(),
    story: v.string(),
    comprehensionQuestions: v.array(
      v.object({ question: v.string(), answer: v.string() }),
    ),
    multipleChoice: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctIndex: v.number(),
      }),
    ),
    vocabulary: v.array(v.object({ word: v.string(), meaning: v.string() })),
    discussionQuestions: v.array(v.string()),
    sentenceAnalysis: v.array(
      v.object({
        sentence: v.string(),
        subject: v.string(),
        verb: v.string(),
        adverb: v.optional(v.string()),
      }),
    ),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lessons", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// --- internal (called only from lessonsActions.ts) ----------------------

export const setHeaderImage = internalMutation({
  args: {
    id: v.id("lessons"),
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
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { headerImage: undefined });
  },
});

export const deleteRow = internalMutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

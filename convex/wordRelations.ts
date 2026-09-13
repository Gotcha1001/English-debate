"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildWordRelationsPrompt } from "../lib/prompts";
import { assertGeneratedWordRelationSet } from "../types/lessons";

interface GenerateWordRelationSetResult {
  id: Id<"wordRelationSets">;
  usedFallback: boolean;
}

/**
 * Generates 6 word-relation groups (choose-the-synonym + choose-the-antonym
 * + a debate question comparing them) plus 15 general discussion questions
 * (the "Word Relations" page).
 */
export const generateWordRelationSet = action({
  args: { topic: v.optional(v.string()) },
  handler: async (ctx, { topic }): Promise<GenerateWordRelationSetResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate a word relation set.");
    }
    const prompt = buildWordRelationsPrompt(
      topic?.trim() ? topic.trim() : undefined,
      me.preferences?.defaultDifficulty,
    );
    const { data, usedFallback } = await generateJson(prompt);
    const set = assertGeneratedWordRelationSet(data);
    const id: Id<"wordRelationSets"> = await ctx.runMutation(
      internal.wordRelationsData.saveWordRelationSet,
      {
        topic: set.topic,
        groups: set.groups,
        discussionQuestions: set.discussionQuestions,
        createdBy: me._id,
      },
    );
    return { id, usedFallback };
  },
});

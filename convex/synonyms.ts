"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildSynonymsPrompt } from "../lib/prompts";
import { assertGeneratedSynonymSet } from "../types/lessons";

interface GenerateSynonymSetResult {
  id: Id<"synonymSets">;
  usedFallback: boolean;
}

/**
 * Generates 5 synonym-spectrum groups (ordering exercise + fill-blank +
 * debate question each) plus 15 general discussion questions (the
 * "Synonym Spectrum" page).
 */
export const generateSynonymSet = action({
  args: { topic: v.optional(v.string()) },
  handler: async (ctx, { topic }): Promise<GenerateSynonymSetResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate a synonym set.");
    }
    const prompt = buildSynonymsPrompt(
      topic?.trim() ? topic.trim() : undefined,
      me.preferences?.defaultDifficulty,
    );
    const { data, usedFallback } = await generateJson(prompt);
    const set = assertGeneratedSynonymSet(data);
    const id: Id<"synonymSets"> = await ctx.runMutation(
      internal.synonymsData.saveSynonymSet,
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

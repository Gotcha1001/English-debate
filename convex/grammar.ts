"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildGrammarBreakdownPrompt } from "../lib/prompts";
import { assertGeneratedGrammarSet } from "../types/lessons";

interface GenerateGrammarSetResult {
  id: Id<"grammarSets">;
  usedFallback: boolean;
}

/**
 * Generates 5 sentences on a topic with a full word-by-word part-of-speech
 * breakdown and a 5-question reveal-the-answer quiz per sentence (the
 * "Grammar Breakdown" page).
 */
export const generateGrammarSet = action({
  args: { topic: v.optional(v.string()) },
  handler: async (ctx, { topic }): Promise<GenerateGrammarSetResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate a grammar breakdown.");
    }

    const prompt = buildGrammarBreakdownPrompt(
      topic?.trim() ? topic.trim() : undefined,
      me.preferences?.defaultDifficulty,
    );
    const { data, usedFallback } = await generateJson(prompt);
    const set = assertGeneratedGrammarSet(data);

    const id: Id<"grammarSets"> = await ctx.runMutation(
      internal.grammarData.saveGrammarSet,
      { topic: set.topic, sentences: set.sentences, createdBy: me._id },
    );

    return { id, usedFallback };
  },
});

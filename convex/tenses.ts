"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildTensesPrompt } from "../lib/prompts";
import { assertGeneratedTenseSet } from "../types/lessons";

interface GenerateTenseSetResult {
  id: Id<"tenseSets">;
  usedFallback: boolean;
}

/**
 * Generates a 5-sentence paragraph on a topic, rewrites every sentence
 * across 5 tenses, and pairs each rewrite with a "name the tense"
 * multiple-choice question (the "Tenses" page).
 */
export const generateTenseSet = action({
  args: { topic: v.optional(v.string()) },
  handler: async (ctx, { topic }): Promise<GenerateTenseSetResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate a tenses set.");
    }
    const prompt = buildTensesPrompt(
      topic?.trim() ? topic.trim() : undefined,
      me.preferences?.defaultDifficulty,
    );
    const { data, usedFallback } = await generateJson(prompt);
    const set = assertGeneratedTenseSet(data);
    const id: Id<"tenseSets"> = await ctx.runMutation(
      internal.tensesData.saveTenseSet,
      { topic: set.topic, sentences: set.sentences, createdBy: me._id },
    );
    return { id, usedFallback };
  },
});

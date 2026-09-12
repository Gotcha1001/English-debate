"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildTenseConversionPrompt } from "../lib/prompts";
import { assertGeneratedTenseConversionSet } from "../types/lessons";

interface GenerateTenseConversionSetResult {
  id: Id<"tenseConversionSets">;
  usedFallback: boolean;
}

/**
 * Generates 5 sentences, each tagged with its current tense and a target
 * tense to convert it into, plus the correct rewrite (the "Transform the
 * Tense" activity on the Tenses page).
 */
export const generateTenseConversionSet = action({
  args: { topic: v.optional(v.string()) },
  handler: async (
    ctx,
    { topic },
  ): Promise<GenerateTenseConversionSetResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error(
        "You must be signed in to generate a tense conversion set.",
      );
    }
    const prompt = buildTenseConversionPrompt(
      topic?.trim() ? topic.trim() : undefined,
      me.preferences?.defaultDifficulty,
    );
    const { data, usedFallback } = await generateJson(prompt);
    const set = assertGeneratedTenseConversionSet(data);
    const id: Id<"tenseConversionSets"> = await ctx.runMutation(
      internal.tenseConversionData.saveTenseConversionSet,
      { topic: set.topic, sentences: set.sentences, createdBy: me._id },
    );
    return { id, usedFallback };
  },
});

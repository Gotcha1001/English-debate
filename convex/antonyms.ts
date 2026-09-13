"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildAntonymsPrompt } from "../lib/prompts";
import { assertGeneratedAntonymSet } from "../types/lessons";

interface GenerateAntonymSetResult {
  id: Id<"antonymSets">;
  usedFallback: boolean;
}

/**
 * Generates 8 antonym pairs (for a tap-to-match game) plus 5 analogy
 * questions built from those pairs (the "Antonym Match" page).
 */
export const generateAntonymSet = action({
  args: { topic: v.optional(v.string()) },
  handler: async (ctx, { topic }): Promise<GenerateAntonymSetResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate an antonym set.");
    }
    const prompt = buildAntonymsPrompt(
      topic?.trim() ? topic.trim() : undefined,
      me.preferences?.defaultDifficulty,
    );
    const { data, usedFallback } = await generateJson(prompt);
    const set = assertGeneratedAntonymSet(data);
    const id: Id<"antonymSets"> = await ctx.runMutation(
      internal.antonymsData.saveAntonymSet,
      {
        topic: set.topic,
        pairs: set.pairs,
        analogies: set.analogies,
        createdBy: me._id,
      },
    );
    return { id, usedFallback };
  },
});

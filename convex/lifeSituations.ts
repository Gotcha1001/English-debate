"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildLifeSituationsPrompt } from "../lib/prompts";
import { assertGeneratedLifeSituationsSet } from "../types/lessons";

interface GenerateLifeSituationsResult {
  id: Id<"lifeSituationSets">;
  usedFallback: boolean;
}

/** Generates 12 "which option would you take and why" scenarios. */
export const generateLifeSituationSet = action({
  args: { topic: v.optional(v.string()) },
  handler: async (ctx, { topic }): Promise<GenerateLifeSituationsResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate life situations.");
    }
    const prompt = buildLifeSituationsPrompt(
      topic,
      me.preferences?.defaultDifficulty,
    );
    const { data, usedFallback } = await generateJson(prompt);
    const set = assertGeneratedLifeSituationsSet(data);
    const id: Id<"lifeSituationSets"> = await ctx.runMutation(
      internal.lifeSituationsData.saveLifeSituationSet,
      { topic: set.topic, situations: set.situations, createdBy: me._id },
    );
    return { id, usedFallback };
  },
});

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildPunsPrompt } from "../lib/prompts";
import { assertGeneratedPunSet } from "../types/lessons";

interface GeneratePunSetResult {
  id: Id<"punSets">;
  usedFallback: boolean;
}

/**
 * Generates 10 puns on a topic (setup + reveal-on-tap punchline +
 * wordplay explanation + a fun "groan rating") plus 15 general
 * discussion questions about humor and language (the "Pun Lab" page).
 */
export const generatePunSet = action({
  args: { topic: v.optional(v.string()) },
  handler: async (ctx, { topic }): Promise<GeneratePunSetResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate puns.");
    }
    const prompt = buildPunsPrompt(
      topic?.trim() ? topic.trim() : undefined,
      me.preferences?.defaultDifficulty,
    );
    const { data, usedFallback } = await generateJson(prompt);
    const set = assertGeneratedPunSet(data);
    const id: Id<"punSets"> = await ctx.runMutation(
      internal.punsData.savePunSet,
      {
        topic: set.topic,
        puns: set.puns,
        discussionQuestions: set.discussionQuestions,
        createdBy: me._id,
      },
    );
    return { id, usedFallback };
  },
});

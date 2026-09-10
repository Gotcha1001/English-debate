// convex/debate.ts
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildDebatePrompt } from "../lib/prompts";
import { assertGeneratedDebateSet } from "../types/lessons";

/**
 * Generates exactly 50 discussion/debate-only questions for a topic
 * (no story, no comprehension) and saves them. Returns the new debate
 * set's id so the client can navigate to /debate/[id].
 *
 * Queries and mutations for debate sets live in convex/debateData.ts —
 * a "use node" file may only export actions.
 */
export const generateDebateSet = action({
  args: { topic: v.string() },
  handler: async (ctx, { topic }): Promise<Id<"debateSets">> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate a debate set.");
    }
    if (!topic.trim()) {
      throw new Error("A topic is required for the debate generator.");
    }
    const prompt = buildDebatePrompt(
      topic.trim(),
      me.preferences?.defaultDifficulty,
    );
    const raw = await generateJson(prompt);
    const debateSet = assertGeneratedDebateSet(raw);
    const debateSetId: Id<"debateSets"> = await ctx.runMutation(
      internal.debateData.saveDebateSet,
      {
        topic: debateSet.topic,
        questions: debateSet.questions,
        createdBy: me._id,
      },
    );
    return debateSetId;
  },
});

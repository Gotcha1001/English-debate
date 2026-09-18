"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildQuickQuestionsPrompt } from "../lib/prompts";
import { assertGeneratedQuickQuestionsSet } from "../types/lessons";

interface GenerateQuickQuestionsResult {
  id: Id<"quickQuestionSets">;
  usedFallback: boolean;
}

/**
 * Generates exactly 40 quick, easy free-talk questions for a topic (the
 * "40 Questions" page --- no story, lighter tone than the Debate generator).
 */
export const generateQuickQuestionSet = action({
  args: { topic: v.string() },
  handler: async (ctx, { topic }): Promise<GenerateQuickQuestionsResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate questions.");
    }
    if (!topic.trim()) {
      throw new Error("A topic is required for the 40 Questions generator.");
    }
    const prompt = buildQuickQuestionsPrompt(
      topic.trim(),
      me.preferences?.defaultDifficulty,
    );
    const { data, usedFallback } = await generateJson(prompt);
    const set = assertGeneratedQuickQuestionsSet(data);
    const id: Id<"quickQuestionSets"> = await ctx.runMutation(
      internal.quickQuestionsData.saveGenerated,
      {
        topic: set.topic,
        questions: set.questions,
        learningObjective: set.learningObjective,
        createdBy: me._id,
      },
    );
    return { id, usedFallback };
  },
});

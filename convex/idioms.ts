"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildIdiomsPrompt } from "../lib/prompts";
import { assertGeneratedIdiomSet } from "../types/lessons";

interface GenerateIdiomSetResult {
  id: Id<"idiomSets">;
  usedFallback: boolean;
}

/**
 * Generates one idiom mini-lesson: the idiom + origin + related
 * expressions, a "Make a Choice" set of 3 A-vs-B pairs, and a
 * "Where Do You Stand?" 5-point scale + discussion questions.
 */
export const generateIdiomSet = action({
  args: { topic: v.optional(v.string()) },
  handler: async (ctx, { topic }): Promise<GenerateIdiomSetResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate an idiom lesson.");
    }
    const prompt = buildIdiomsPrompt(
      topic?.trim() ? topic.trim() : undefined,
      me.preferences?.defaultDifficulty,
    );
    const { data, usedFallback } = await generateJson(prompt);
    const set = assertGeneratedIdiomSet(data);
    const id: Id<"idiomSets"> = await ctx.runMutation(
      internal.idiomsData.saveIdiomSet,
      {
        topic: set.topic,
        idiom: set.idiom,
        goal: set.goal,
        origin: set.origin,
        example: set.example,
        relatedExpressions: set.relatedExpressions,
        choicePrompt: set.choicePrompt,
        choicePairs: set.choicePairs,
        standScaleLabels: set.standScaleLabels,
        standQuestions: set.standQuestions,
        createdBy: me._id,
      },
    );
    return { id, usedFallback };
  },
});

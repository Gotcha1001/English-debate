"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildLessonPrompt } from "../lib/prompts";
import { assertGeneratedLesson } from "../types/lessons";

interface GenerateLessonResult {
  id: Id<"lessons">;
  usedFallback: boolean;
}

export const generateLesson = action({
  args: { topic: v.optional(v.string()) },
  handler: async (ctx, { topic }): Promise<GenerateLessonResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate a lesson.");
    }
    const prompt = buildLessonPrompt(topic, me.preferences?.defaultDifficulty);
    const { data, usedFallback } = await generateJson(prompt);
    const lesson = assertGeneratedLesson(data);
    const lessonId: Id<"lessons"> = await ctx.runMutation(
      internal.lessonData.saveLesson,
      {
        topic: lesson.topic,
        story: lesson.story,
        comprehensionQuestions: lesson.comprehensionQuestions,
        multipleChoice: lesson.multipleChoice,
        vocabulary: lesson.vocabulary,
        discussionQuestions: lesson.discussionQuestions,
        sentenceAnalysis: lesson.sentenceAnalysis.map((entry) => ({
          sentence: entry.sentence,
          subject: entry.subject,
          verb: entry.verb,
          adverb: entry.adverb ?? undefined,
        })),
        createdBy: me._id,
      },
    );
    return { id: lessonId, usedFallback };
  },
});

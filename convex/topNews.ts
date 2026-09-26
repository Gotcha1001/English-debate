// convex/topNews.ts

"use node";

import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { generateJson } from "../lib/openrouter";
import { buildTopNewsPrompt } from "../lib/prompts";
import { assertGeneratedTopNewsLesson } from "../types/lessons";
import { fetchTopNewsArticle } from "../lib/tavily";
import { uploadImageToCloudinary } from "../lib/cloudinary";

interface GenerateTopNewsResult {
  id: Id<"topNewsLessons">;
  usedFallback: boolean;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

/**
 * Pulls today's top news story from Tavily, turns it into a 5-question
 * comprehension + 6-word vocabulary + 10-question discussion lesson via
 * OpenRouter, and saves it. If Tavily found an image alongside the story,
 * it's mirrored to Cloudinary as the lesson's header image -- same asset
 * shape ({url, publicId}) as every other lesson type, so the existing
 * header edit/replace/delete UI (LessonHeader + topNewsActions.ts) just
 * works without any extra code.
 */
export const generateTopNewsLesson = action({
  args: {},
  handler: async (ctx): Promise<GenerateTopNewsResult> => {
    const me = await ctx.runQuery(api.user.getMe);
    if (!me) {
      throw new Error("You must be signed in to generate a Top News lesson.");
    }

    const article = await fetchTopNewsArticle();

    const prompt = buildTopNewsPrompt(
      article.title,
      article.content,
      me.preferences?.defaultDifficulty,
    );
    const { data, usedFallback } = await generateJson(prompt);
    const lesson = assertGeneratedTopNewsLesson(data);

    // A missing or broken image shouldn't fail the whole generation -- the
    // teacher can always add a header image manually afterward either way.
    let headerImage: { url: string; publicId: string } | undefined;
    if (article.imageUrl) {
      try {
        headerImage = await uploadImageToCloudinary(
          article.imageUrl,
          "lesson-headers",
        );
      } catch (err) {
        console.error("Couldn't mirror the article image to Cloudinary", err);
      }
    }

    const id: Id<"topNewsLessons"> = await ctx.runMutation(
      internal.topNewsData.saveTopNewsLesson,
      {
        headline: lesson.headline,
        story: lesson.story,
        comprehensionQuestions: lesson.comprehensionQuestions,
        vocabulary: lesson.vocabulary,
        discussionQuestions: lesson.discussionQuestions,
        sourceName: hostnameOf(article.url),
        sourceUrl: article.url,
        publishedDate: article.publishedDate,
        headerImage,
        createdBy: me._id,
      },
    );

    return { id, usedFallback };
  },
});

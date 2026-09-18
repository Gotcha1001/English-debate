import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    colorTheme: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        defaultDifficulty: v.optional(
          v.union(
            v.literal("beginner"),
            v.literal("intermediate"),
            v.literal("advanced"),
          ),
        ),
      }),
    ),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  lessons: defineTable({
    topic: v.string(),
    story: v.string(),
    comprehensionQuestions: v.array(
      v.object({ question: v.string(), answer: v.string() }),
    ),
    multipleChoice: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctIndex: v.number(),
      }),
    ),
    vocabulary: v.array(v.object({ word: v.string(), meaning: v.string() })),
    discussionQuestions: v.array(v.string()),
    sentenceAnalysis: v.array(
      v.object({
        sentence: v.string(),
        subject: v.string(),
        verb: v.string(),
        adverb: v.optional(v.string()),
      }),
    ),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  debateSets: defineTable({
    topic: v.string(),
    questions: v.array(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  // NEW: dedicated "40 Questions" page — a lighter, faster sibling of
  // debateSets. Same shape, different prompt/tone and count (40 instead
  // of 50), used when the learner just wants quick free-talk questions
  // with no story attached.
  quickQuestionSets: defineTable({
    topic: v.string(),
    questions: v.array(v.string()), // exactly 40
    createdBy: v.id("users"),
    createdAt: v.number(),
    category: v.optional(v.union(v.literal("frequent"), v.literal("deep"))),
  }).index("by_creator", ["createdBy"]),

  // NEW: "Life Situations" — scenario + multiple options, e.g. "If you
  // got lost in a new country, what would you do?" The learner picks an
  // option out loud and explains why; there's no "correct" answer, so
  // no correctIndex field (unlike multipleChoice in lessons).
  lifeSituationSets: defineTable({
    topic: v.string(), // e.g. "Travel mishaps", or "General" if none given
    situations: v.array(
      v.object({
        scenario: v.string(),
        options: v.array(v.string()), // 3-4 choices
      }),
    ),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  grammarSets: defineTable({
    topic: v.string(),
    sentences: v.array(
      v.object({
        sentence: v.string(), // the full sentence, verbatim
        tokens: v.array(
          v.object({
            word: v.string(), // word exactly as it appears in the sentence
            partOfSpeech: v.union(
              v.literal("noun"),
              v.literal("pronoun"),
              v.literal("verb"),
              v.literal("adjective"),
              v.literal("adverb"),
              v.literal("article"),
              v.literal("preposition"),
              v.literal("conjunction"),
              v.literal("interjection"),
            ),
          }),
        ),
        quiz: v.array(v.object({ question: v.string(), answer: v.string() })), // exactly 5 per sentence
      }),
    ), // exactly 5 sentences
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  tenseSets: defineTable({
    topic: v.string(),
    sentences: v.array(
      v.object({
        sentence: v.string(), // the base sentence, verbatim, written in Present Simple
        variants: v.array(
          v.object({
            tense: v.union(
              v.literal("Present Simple"),
              v.literal("Past Simple"),
              v.literal("Past Continuous"),
              v.literal("Present Perfect"),
              v.literal("Future Simple"),
            ),
            sentence: v.string(), // the base sentence rewritten in `tense`
            options: v.array(v.string()), // the 5 tense names, shuffled
            correctIndex: v.number(), // index into options that matches `tense`
          }),
        ), // exactly 5 --- one per tense, order shuffled per question
      }),
    ), // exactly 5 sentences
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  // ADD to convex/schema.ts, alongside tenseSets. Re-uses the same 5-tense
  // union (add a shared validator if you'd rather not repeat it -- see the
  // note at the bottom of tensesData.ts below).
  tenseConversionSets: defineTable({
    topic: v.string(),
    sentences: v.array(
      v.object({
        sentence: v.string(), // the sentence as given, written in `fromTense`
        fromTense: v.union(
          v.literal("Present Simple"),
          v.literal("Past Simple"),
          v.literal("Past Continuous"),
          v.literal("Present Perfect"),
          v.literal("Future Simple"),
        ),
        toTense: v.union(
          v.literal("Present Simple"),
          v.literal("Past Simple"),
          v.literal("Past Continuous"),
          v.literal("Present Perfect"),
          v.literal("Future Simple"),
        ),
        answer: v.string(), // the correct rewrite of `sentence` in `toTense`
      }),
    ), // exactly 5
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  // ADD to convex/schema.ts, alongside lifeSituationSets.
  idiomSets: defineTable({
    topic: v.string(),
    idiom: v.string(),
    goal: v.string(),
    origin: v.string(),
    example: v.string(),
    relatedExpressions: v.array(
      v.object({
        phrase: v.string(),
        meaning: v.string(),
        example: v.string(),
      }),
    ),
    choicePrompt: v.string(),
    choicePairs: v.array(
      v.object({ optionA: v.string(), optionB: v.string() }),
    ),
    standScaleLabels: v.array(v.string()), // exactly 5
    standQuestions: v.array(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  // ADD to convex/schema.ts, alongside idiomSets.
  synonymSets: defineTable({
    topic: v.string(),
    groups: v.array(
      v.object({
        concept: v.string(),
        spectrumLabel: v.string(),
        words: v.array(v.string()), // exactly 5, correct order
        connotationNote: v.string(),
        fillBlankSentence: v.string(),
        correctWordIndex: v.number(),
        debateQuestion: v.string(),
      }),
    ), // exactly 5
    discussionQuestions: v.array(v.string()), // exactly 15
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  // ADD to convex/schema.ts, alongside synonymSets.
  antonymSets: defineTable({
    topic: v.string(),
    pairs: v.array(
      v.object({
        word: v.string(),
        antonym: v.string(),
        exampleSentence: v.string(),
      }),
    ), // exactly 8
    analogies: v.array(
      v.object({
        pairIndexA: v.number(),
        pairIndexB: v.number(),
        options: v.array(v.string()), // exactly 4
        correctIndex: v.number(),
      }),
    ), // exactly 5
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),
  // ADD to convex/schema.ts, alongside antonymSets.
  wordRelationSets: defineTable({
    topic: v.string(),
    groups: v.array(
      v.object({
        word: v.string(),
        synonymOptions: v.array(v.string()), // exactly 4
        correctSynonymIndex: v.number(),
        antonymOptions: v.array(v.string()), // exactly 4
        correctAntonymIndex: v.number(),
        debateQuestion: v.string(),
      }),
    ), // exactly 6
    discussionQuestions: v.array(v.string()), // exactly 15
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),
  // ADD to convex/schema.ts, alongside wordRelationSets.
  punSets: defineTable({
    topic: v.string(),
    puns: v.array(
      v.object({
        setup: v.string(),
        punchline: v.string(),
        distractors: v.array(v.string()),
        explanation: v.string(),
        groanRating: v.number(), // 1-5
      }),
    ), // exactly 10
    discussionQuestions: v.array(v.string()), // exactly 15
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),
});

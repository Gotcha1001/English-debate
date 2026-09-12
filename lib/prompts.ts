// lib/prompts.ts
//
// Prompt templates for the two generators. Kept in one place so the JSON
// contract the model must follow is easy to audit and adjust.

export type Difficulty = "beginner" | "intermediate" | "advanced";

const DIFFICULTY_INSTRUCTIONS: Record<Difficulty, string> = {
  beginner:
    "Keep the English very simple (roughly A1-A2 CEFR): short sentences, common everyday words, mostly present and simple past tense.",
  intermediate:
    "Use everyday intermediate English (roughly A2-B1 CEFR): moderate sentence length, a few varied tenses, mostly common vocabulary.",
  advanced:
    "Use richer, more natural English (roughly B1-B2 CEFR): longer sentences, a wider range of tenses and vocabulary, while staying clear enough for a learner.",
};

const LESSON_JSON_SHAPE = `{
  "topic": string,
  "story": string,               // 150-250 words, ESL-friendly English at the requested level
  "comprehensionQuestions": [ { "question": string, "answer": string } ],   // exactly 8, answerable from the story
  "multipleChoice": [ { "question": string, "options": [string, string, string, string], "correctIndex": number } ], // exactly 5, about the story
  "vocabulary": [ { "word": string, "meaning": string } ],  // exactly 8 words from the story, simple one-sentence meanings
  "discussionQuestions": [string],  // exactly 50, short, easy, about the TOPIC (for free-talking practice, not the story)
  "sentenceAnalysis": [ { "sentence": string, "subject": string, "verb": string, "adverb": string|null } ] // exactly 3 sentences copied verbatim from the story
}`;

export function buildLessonPrompt(
  topic?: string,
  difficulty?: Difficulty,
): string {
  const topicInstruction = topic
    ? `The topic is: "${topic}".`
    : `No topic was given — choose one interesting, everyday "free talking" topic suitable for adult ESL learners (e.g. travel, food, habits, technology, weekend plans). Put your chosen topic in the "topic" field.`;

  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "intermediate"];

  return `You are an ESL (English as a Second Language) lesson writer. Build one complete "Free Talking" lesson.

${topicInstruction}

Requirements:
- Story: 150-250 words, written about the topic. ${difficultyInstruction}
- comprehensionQuestions: exactly 8 questions that can be answered directly from the story, with short model answers.
- multipleChoice: exactly 5 questions about the story, each with exactly 4 options and one correct answer (correctIndex is 0-based).
- vocabulary: exactly 8 words or short phrases taken from the story that a learner might not know, each with a simple, one-sentence meaning (not a dictionary definition, plain and easy).
- discussionQuestions: exactly 50 short, easy, open-ended speaking-practice questions about the TOPIC in general (not the story) that two learners could ask each other in conversation. Keep each under 15 words.
- sentenceAnalysis: pick exactly 3 sentences copied VERBATIM from the story. For each, identify the grammatical subject, the main verb, and an adverb if one is present in that sentence (use null if there is no adverb in that sentence).

Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${LESSON_JSON_SHAPE}`;
}

const DEBATE_JSON_SHAPE = `{
  "topic": string,
  "questions": [string]   // exactly 50
}`;

export function buildDebatePrompt(
  topic: string,
  difficulty?: Difficulty,
): string {
  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "advanced"];

  return `You are an ESL discussion and debate facilitator. Generate discussion/debate prompts for adult English learners on this topic: "${topic}".

Requirements:
- Generate exactly 50 questions or prompts, for open discussion and debate ONLY (no story, no comprehension, no vocabulary).
- Mix question types: some opinion questions ("Do you think...?"), some "would you rather", some that invite the learner to argue a side, some that ask for personal experience.
- Each question should be self-contained, clear, and usable as a conversation or debate starter. ${difficultyInstruction}
- Vary the phrasing and angle across all 50 — avoid repeating the same sentence structure back to back.

Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${DEBATE_JSON_SHAPE}`;
}

const QUICK_QUESTIONS_JSON_SHAPE = `{
  "topic": string,
  "questions": [string]   // exactly 40
}`;

/** Standalone "40 Questions" generator — quick free-talk questions, no story. */
export function buildQuickQuestionsPrompt(
  topic: string,
  difficulty?: Difficulty,
): string {
  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "intermediate"];
  return `You are an ESL conversation coach. Generate quick "free talking" warm-up questions for adult English learners on this topic: "${topic}".

Requirements:
- Generate exactly 40 questions, light and easy, for casual spoken practice (not debate, not story-based).
- Each question should be answerable in a sentence or two and easy to ask a partner.
- Vary the phrasing and angle across all 40 --- avoid repeating the same sentence structure back to back.
- Keep each question under 15 words. ${difficultyInstruction}

Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${QUICK_QUESTIONS_JSON_SHAPE}`;
}

const LIFE_SITUATIONS_JSON_SHAPE = `{
  "topic": string,
  "situations": [
    { "scenario": string, "options": [string, string, string, string] }
  ]  // exactly 12
}`;

/**
 * "Life Situations" generator --- everyday dilemmas the learner must pick
 * an option for and then explain their reasoning out loud. No correct
 * answer, so there is no correctIndex (unlike lessons.multipleChoice).
 */
export function buildLifeSituationsPrompt(
  topic?: string,
  difficulty?: Difficulty,
): string {
  const topicInstruction = topic
    ? `Base the scenarios loosely around this theme: "${topic}".`
    : `No theme was given --- use a broad mix of everyday situations (travel, work, money, friendships, unexpected problems). Put a short label describing the mix in the "topic" field (e.g. "Everyday dilemmas").`;
  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "intermediate"];
  return `You are an ESL conversation coach. Write "life situation" speaking-practice scenarios for adult English learners. ${topicInstruction}

Requirements:
- Generate exactly 12 scenarios, e.g. "If you got lost in a new country, what would you do?" or "Your car breaks down on the freeway --- what's your move?".
- Each scenario needs exactly 4 short, plausible, DIFFERENT options a learner could pick between.
- Do not mark any option as correct --- this is for discussion, not testing. The learner will pick one out loud and explain why.
- Keep each scenario under 25 words and each option under 10 words. ${difficultyInstruction}
- Vary the situations across travel, work, relationships, money, and everyday surprises.

Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${LIFE_SITUATIONS_JSON_SHAPE}`;
}

// ADD THIS to lib/prompts.ts, below the other buildXPrompt functions.
// Uses the same Difficulty type and DIFFICULTY_INSTRUCTIONS map already
// defined in that file.

const GRAMMAR_PARTS_OF_SPEECH =
  '"noun" | "pronoun" | "verb" | "adjective" | "adverb" | "article" | "preposition" | "conjunction" | "interjection"';

const GRAMMAR_JSON_SHAPE = `{
  "topic": string,
  "sentences": [
    {
      "sentence": string,               // one full sentence
      "tokens": [                       // EVERY word in the sentence, in order, no punctuation-only tokens
        { "word": string, "partOfSpeech": ${GRAMMAR_PARTS_OF_SPEECH} }
      ],
      "quiz": [                         // exactly 5 questions about THIS sentence
        { "question": string, "answer": string }
      ]
    }
  ]   // exactly 5 sentences
}`;

/**
 * "Grammar Breakdown" generator -- standalone page. Writes 5 sentences on a
 * topic, tags every word's part of speech, and writes a 5-question quiz per
 * sentence (subject, main verb, and a mix of whatever other parts of speech
 * are actually present) for a reveal-the-answer quiz format.
 */
export function buildGrammarBreakdownPrompt(
  topic?: string,
  difficulty?: Difficulty,
): string {
  const topicInstruction = topic
    ? `The topic is: "${topic}".`
    : `No topic was given -- choose one interesting, everyday topic suitable for adult ESL learners. Put your chosen topic in the "topic" field.`;

  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "intermediate"];

  return `You are an ESL grammar teacher. Write 5 example sentences about a topic, then give a complete, teacher-grade parts-of-speech breakdown of each one, plus a short quiz for each sentence.

${topicInstruction}

Requirements:
- Generate exactly 5 sentences about the topic. ${difficultyInstruction}
- Vary sentence structure across the 5 -- don't repeat the same grammatical pattern (include at least one sentence with an adjective, one with an adverb, one with a preposition, and one with a conjunction, spread naturally across the set).
- tokens: split the sentence into its individual words, in reading order, and tag EVERY word with exactly one part of speech from this list: noun, pronoun, verb, adjective, adverb, article, preposition, conjunction, interjection. Do not include punctuation marks (commas, periods, etc.) as separate tokens. Contractions like "don't" should be split into "do" (verb) and "n't"/"not" (adverb) if natural, otherwise tag the whole contraction with its dominant part of speech -- prioritize consistency over perfect linguistic precision.
- quiz: write exactly 5 questions for each sentence, testing whether a student can identify parts of that specific sentence. Always include one question asking for the subject and one asking for the main verb. For the remaining 3, pick from whatever other parts of speech are actually present in that sentence (e.g. "Which word is the article in this sentence?", "Find the adjective that describes the noun.", "Which conjunction links the two ideas?", "Which word is the preposition?"). Every answer must be a word or short phrase copied verbatim from that sentence. Never ask about a part of speech that isn't present in the sentence.
- Keep quiz answers short (usually one word, at most a few words) and unambiguous given the sentence.

Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${GRAMMAR_JSON_SHAPE}`;
}

const TENSES_JSON_SHAPE = `{
  "topic": string,
  "sentences": [
    {
      "sentence": string,   // one base sentence from the paragraph, written in Present Simple
      "variants": [         // exactly 5, one per tense below, IN THIS ORDER
        {
          "tense": "Present Simple" | "Past Simple" | "Past Continuous" | "Present Perfect" | "Future Simple",
          "sentence": string,        // the base sentence rewritten in that tense, same meaning/subject
          "options": [string, string, string, string, string], // all 5 tense names above, SHUFFLED
          "correctIndex": number     // index into options matching "tense"
        }
      ]
    }
  ]  // exactly 5 sentences
}`;

/**
 * "Tenses" generator -- standalone page. Writes a short 5-sentence paragraph
 * on a topic, then rewrites every sentence in Present Simple, Past Simple,
 * Past Continuous, Present Perfect, and Future Simple, pairing each rewrite
 * with a multiple-choice question that asks the learner to name the tense.
 */
export function buildTensesPrompt(
  topic?: string,
  difficulty?: Difficulty,
): string {
  const topicInstruction = topic
    ? `The topic is: "${topic}".`
    : `No topic was given -- choose one interesting, everyday topic suitable for adult ESL learners. Put your chosen topic in the "topic" field.`;
  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "intermediate"];
  return `You are an ESL grammar teacher. Write a short paragraph about a topic, then show how each sentence changes across five tenses, and quiz the learner on naming each one.
${topicInstruction}

Requirements:
- Write exactly 5 sentences that flow together as one short paragraph about the topic, in Present Simple. ${difficultyInstruction}
- For EVERY sentence, produce exactly 5 variants, one for each tense in this exact order: Present Simple, Past Simple, Past Continuous, Present Perfect, Future Simple. Rewrite the sentence naturally in that tense -- keep the same subject and meaning, change only what the tense requires (verb form, and time expressions like "yesterday", "right now", "by next year" where it reads naturally).
- For every variant, set "options" to all 5 tense names above in a SHUFFLED order (never the same order twice in a row), and set "correctIndex" to the position of the correct tense within that shuffled list.
- Keep sentences short and clear enough that the tense is unambiguous from its form (helper verbs, verb endings, time words) alone -- a learner should be able to tell the tense without already knowing the topic.

Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${TENSES_JSON_SHAPE}`;
}

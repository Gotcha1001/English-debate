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

// ADD to lib/prompts.ts, below buildTensesPrompt. Reuses Difficulty,
// DIFFICULTY_INSTRUCTIONS, and the TENSES list already in this file (or
// inline the 5 names again if you kept them local to types/lessons.ts).

const TENSE_CONVERSION_JSON_SHAPE = `{
  "topic": string,
  "sentences": [
    {
      "sentence": string,   // one sentence about the topic, written in "fromTense"
      "fromTense": "Present Simple" | "Past Simple" | "Past Continuous" | "Present Perfect" | "Future Simple",
      "toTense": "Present Simple" | "Past Simple" | "Past Continuous" | "Present Perfect" | "Future Simple",  // must differ from fromTense
      "answer": string      // the SAME sentence correctly rewritten in "toTense"
    }
  ]  // exactly 5 sentences
}`;

/**
 * "Transform the Tense" generator -- second Tenses activity. Writes 5
 * sentences about a topic, each tagged with its current tense and a
 * DIFFERENT target tense the learner must convert it into, plus the
 * correct rewrite for self-checking after they've had a go themselves.
 */
export function buildTenseConversionPrompt(
  topic?: string,
  difficulty?: Difficulty,
): string {
  const topicInstruction = topic
    ? `The topic is: "${topic}".`
    : `No topic was given -- choose one interesting, everyday topic suitable for adult ESL learners. Put your chosen topic in the "topic" field.`;
  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "intermediate"];
  return `You are an ESL grammar teacher. Write 5 separate sentences about a topic, each one a small "convert this to another tense" exercise.
${topicInstruction}

Requirements:
- Generate exactly 5 standalone sentences about the topic (they don't need to connect into a paragraph). ${difficultyInstruction}
- For each sentence, pick "fromTense" (the tense the sentence is written in) and "toTense" (a DIFFERENT tense the learner must convert it into) from: Present Simple, Past Simple, Past Continuous, Present Perfect, Future Simple.
- Across the 5 sentences, use a good variety of fromTense/toTense pairs -- don't repeat the same pair twice.
- "answer": rewrite "sentence" correctly in "toTense", keeping the same subject and meaning, changing only what the tense requires.
- Keep each sentence short and natural, clear enough that there's one obviously correct way to convert it.

Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${TENSE_CONVERSION_JSON_SHAPE}`;
}

// ADD to lib/prompts.ts, below buildLifeSituationsPrompt. Reuses Difficulty
// and DIFFICULTY_INSTRUCTIONS already defined in this file.

const IDIOM_JSON_SHAPE = `{
  "topic": string,
  "idiom": string,                 // the idiom itself, Title Case, e.g. "Off the Record"
  "goal": string,                  // one sentence: what the learner will practice today
  "origin": string,                // 2-4 sentences on where the idiom comes from and why it's used
  "example": string,               // one natural sentence using the idiom
  "relatedExpressions": [          // exactly 2
    { "phrase": string, "meaning": string, "example": string }
  ],
  "choicePrompt": string,          // one short question framing the 3 choice pairs below
  "choicePairs": [                 // exactly 3
    { "optionA": string, "optionB": string }
  ],
  "standScaleLabels": [string, string, string, string, string], // exactly 5, one extreme to the other, phrased using the idiom/theme
  "standQuestions": [string]       // exactly 3, personal questions a learner can answer using the scale
}`;

/**
 * "Idioms" generator -- standalone page. Picks (or is given) a topic, finds
 * an idiom connected to it, explains its origin, gives 2 related
 * expressions, then builds a "Make a Choice" (3 A-vs-B pairs) and a
 * "Where Do You Stand?" 5-point scale + discussion questions -- all
 * speaking practice, no correct answers.
 */
export function buildIdiomsPrompt(
  topic?: string,
  difficulty?: Difficulty,
): string {
  const topicInstruction = topic
    ? `The topic is: "${topic}". Choose an idiom that connects naturally to this topic.`
    : `No topic was given -- pick any common, useful English idiom and put a short topic label describing its theme (e.g. "Privacy & Secrets") in the "topic" field.`;
  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "intermediate"];
  return `You are an ESL teacher building a one-idiom speaking lesson for adult English learners.
${topicInstruction}
Requirements:
- "idiom": the idiom itself, written in Title Case.
- "goal": one short sentence describing what the learner will practice ("Learn how to use the idiom '...' in conversations about ...").
- "origin": 2-4 sentences explaining where the idiom comes from or why English speakers use it. ${difficultyInstruction}
- "example": one natural sentence that uses the idiom correctly.
- "relatedExpressions": exactly 2 OTHER expressions or idioms that mean something similar or related, each with its own one-sentence meaning and one example sentence using it (not the same idiom as "idiom").
- "choicePrompt": one short question that frames a set of 3 "this vs that" choices related to the idiom's theme (e.g. for "Off the Record": "What Should Be Kept Off the Record?").
- "choicePairs": exactly 3 pairs of contrasting short options (2-4 words each) a learner could argue between and explain their reasoning -- no correct answer, this is for discussion.
- "standScaleLabels": exactly 5 short phrases forming a scale from one extreme to the opposite extreme, using or echoing the idiom's theme (e.g. "Always off the record" ... "Always open"). Order them from one extreme to the other.
- "standQuestions": exactly 6 short personal questions (under 20 words each) that a learner could answer by placing themselves on that scale and explaining why, related to the topic.
Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${IDIOM_JSON_SHAPE}`;
}
// ADD to lib/prompts.ts, below buildIdiomsPrompt. Reuses Difficulty and
// DIFFICULTY_INSTRUCTIONS already defined in this file.

const SYNONYM_JSON_SHAPE = `{
  "topic": string,
  "groups": [                          // exactly 5
    {
      "concept": string,               // the base idea, e.g. "Angry"
      "spectrumLabel": string,         // describes the two ends, e.g. "Mild -> Intense" or "Negative -> Positive"
      "words": [string, string, string, string, string], // exactly 5 near-synonyms, in CORRECT order from one end of the spectrum to the other
      "connotationNote": string,       // one sentence on why these words aren't interchangeable
      "fillBlankSentence": string,     // one natural sentence containing "___" where exactly one of the 5 words fits best
      "correctWordIndex": number,      // index into "words" -- the best fit for the blank
      "debateQuestion": string         // one discussion/debate question built from the connotation gap between two of the words
    }
  ],
  "discussionQuestions": [string]      // exactly 15, general questions about the topic, naturally using a mix of the words above
}`;

/**
 * "Synonym Spectrum" generator -- standalone page. Builds 5 groups of near-
 * synonyms ordered along a spectrum (intensity or connotation), each paired
 * with a fill-in-the-blank check and a debate question grown from the
 * connotation gap, plus general discussion questions that reuse the
 * vocabulary. Interactive + conversation/debate in one feature.
 */
export function buildSynonymsPrompt(
  topic?: string,
  difficulty?: Difficulty,
): string {
  const topicInstruction = topic
    ? `The topic is: "${topic}". Base every synonym group around vocabulary connected to this topic.`
    : `No topic was given -- pick a broad, useful theme (e.g. emotions, describing people, talking about work) and put a short label for it in the "topic" field.`;
  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "intermediate"];
  return `You are an ESL vocabulary teacher building an interactive "shades of meaning" lesson for adult English learners.
${topicInstruction}
Requirements:
- Generate exactly 5 "groups", each built around ONE base concept (an emotion, a personality trait, a quality, an action -- whatever fits the topic).
- "words": exactly 5 near-synonyms for that concept, ordered correctly along the spectrum described in "spectrumLabel" (e.g. mildest to most intense, or most negative to most positive). Do not shuffle them here -- write them in the TRUE correct order; the app will shuffle them for the exercise. ${difficultyInstruction}
- "connotationNote": one sentence explaining why a learner can't just swap these words for each other (formality, intensity, or positive/negative judgment).
- "fillBlankSentence": one natural sentence with "___" where exactly one of the 5 words is clearly the best fit; the other 4 would sound odd or change the meaning there.
- "correctWordIndex": the index (0-based) into "words" of the best fit for the blank.
- "debateQuestion": one open discussion/debate question that uses the connotation difference between two of the words in the group (e.g. calling the same behavior by a kinder word vs a harsher one) to spark a real argument -- no correct answer.
- Across the 5 groups, vary the kind of spectrum (don't make all 5 about intensity -- mix in formality, positivity/negativity, or size/degree).
- "discussionQuestions": exactly 15 short, open discussion questions about the topic in general, naturally written so a learner could use several of the group words while answering. Keep each under 20 words.
Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${SYNONYM_JSON_SHAPE}`;
}

// ADD to lib/prompts.ts, below buildSynonymsPrompt. Reuses Difficulty and
// DIFFICULTY_INSTRUCTIONS already defined in this file.

const ANTONYM_JSON_SHAPE = `{
  "topic": string,
  "pairs": [                            // exactly 8
    { "word": string, "antonym": string, "exampleSentence": string }
  ],
  "analogies": [                        // exactly 5
    {
      "pairIndexA": number,             // index into "pairs" -- the given relationship
      "pairIndexB": number,             // index into "pairs" -- the word being asked about (different from pairIndexA)
      "options": [string, string, string, string], // exactly 4, one of which is pairs[pairIndexB].antonym
      "correctIndex": number            // index into "options" matching pairs[pairIndexB].antonym
    }
  ]
}`;

/**
 * "Antonym Match" generator -- standalone page. Builds 8 word/antonym pairs
 * around a topic for a tap-to-match game, plus 5 "A is to A' as B is to ___"
 * analogy questions built from those same pairs.
 */
export function buildAntonymsPrompt(
  topic?: string,
  difficulty?: Difficulty,
): string {
  const topicInstruction = topic
    ? `The topic is: "${topic}". Base every pair on vocabulary connected to this topic.`
    : `No topic was given -- pick a broad, useful theme (e.g. describing weather, personality, size and speed) and put a short label for it in the "topic" field.`;
  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "intermediate"];
  return `You are an ESL vocabulary teacher building an interactive antonyms lesson for adult English learners.
${topicInstruction}
Requirements:
- "pairs": exactly 8 word/antonym pairs connected to the topic. ${difficultyInstruction} Each needs one natural "exampleSentence" that uses BOTH the word and its antonym together to show the contrast (e.g. "The soup was too hot to eat, so I waited for it to turn cold.").
- Keep every word and antonym to a single common word or short phrase (no rare vocabulary) so the matching game stays fair.
- Do not repeat the same word or antonym across two different pairs.
- "analogies": exactly 5 questions in the form "pairs[pairIndexA].word is to pairs[pairIndexA].antonym as pairs[pairIndexB].word is to ___". Pick pairIndexA and pairIndexB as two DIFFERENT indices from "pairs" (0-7) for each analogy, and vary which pairs you use across the 5 so most of the 8 pairs get used at least once.
- "options": exactly 4 words for each analogy -- one must be exactly pairs[pairIndexB].antonym (the correct answer), and the other 3 should be plausible but wrong distractors (other antonyms from the set, or close-but-wrong words).
- "correctIndex": the 0-based index into "options" that matches pairs[pairIndexB].antonym.
Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${ANTONYM_JSON_SHAPE}`;
}

// ADD to lib/prompts.ts, below buildAntonymsPrompt. Reuses Difficulty and
// DIFFICULTY_INSTRUCTIONS already defined in this file.

const WORD_RELATION_JSON_SHAPE = `{
  "topic": string,
  "groups": [                          // exactly 6
    {
      "word": string,                  // the base word
      "synonymOptions": [string, string, string, string], // exactly 4, one means the same as "word"
      "correctSynonymIndex": number,   // index into synonymOptions
      "antonymOptions": [string, string, string, string],  // exactly 4, one means the opposite of "word"
      "correctAntonymIndex": number,   // index into antonymOptions
      "debateQuestion": string         // built by comparing the correct synonym and antonym for "word"
    }
  ],
  "discussionQuestions": [string]      // exactly 15, general questions about the topic
}`;

/**
 * "Word Relations" generator -- standalone page. Combines a "choose the
 * synonym" and "choose the antonym" multiple choice for each base word with
 * a debate question that compares the two, plus general discussion
 * questions at the end. Merges the interactivity of Antonym Match with the
 * debate angle of Synonym Spectrum.
 */
export function buildWordRelationsPrompt(
  topic?: string,
  difficulty?: Difficulty,
): string {
  const topicInstruction = topic
    ? `The topic is: "${topic}". Base every group's word on vocabulary connected to this topic.`
    : `No topic was given -- pick a broad, useful theme (e.g. personality, emotions, describing places) and put a short label for it in the "topic" field.`;
  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "intermediate"];
  return `You are an ESL vocabulary teacher building a combined synonym/antonym lesson for adult English learners.
${topicInstruction}
Requirements:
- Generate exactly 6 groups, each built around ONE base word connected to the topic. ${difficultyInstruction}
- "synonymOptions": exactly 4 words, only ONE of which is a genuine synonym of "word" -- the other 3 should be plausible-looking but clearly wrong (unrelated words, or words that sound similar but mean something different).
- "correctSynonymIndex": the 0-based index of the correct synonym in synonymOptions.
- "antonymOptions": exactly 4 words, only ONE of which is a genuine antonym of "word" -- same distractor rules as above, and don't reuse any word from synonymOptions.
- "correctAntonymIndex": the 0-based index of the correct antonym in antonymOptions.
- "debateQuestion": one open discussion/debate question that compares the correct synonym and the correct antonym for THIS word -- e.g. whether calling someone the antonym is really just "not" the synonym, whether the synonym and the word carry the exact same judgment, or whether context changes which one people actually use. No correct answer -- this is for speaking practice.
- Across the 6 groups, use a good mix of word types (adjectives, verbs, nouns) if the topic allows it.
- "discussionQuestions": exactly 15 short, open discussion questions about the topic in general (under 20 words each), independent of the 6 words above.
Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${WORD_RELATION_JSON_SHAPE}`;
}

// ADD to lib/prompts.ts, below buildWordRelationsPrompt. Reuses Difficulty
// and DIFFICULTY_INSTRUCTIONS already defined in this file.

const PUN_JSON_SHAPE = `{
  "topic": string,
  "puns": [                              // exactly 10
    {
      "setup": string,                  // a short build-up line or question that sets up the joke
      "punchline": string,              // the pun payoff -- one witty line
      "distractors": [string, string, string], // exactly 3 wrong-but-plausible punchlines
      "explanation": string,            // one short sentence on the wordplay mechanic (double meaning, homophone, etc.)
      "groanRating": number             // 1-5, how groan-worthy/cheesy it is (5 = ultimate dad joke)
    }
  ],
  "discussionQuestions": [string]       // exactly 15, general questions about humor, wordplay, or the topic
}`;

/**
 * "Pun Lab" generator -- standalone, playful page. Builds 10 puns around a
 * topic (setup + reveal-on-tap punchline + a one-line explanation of the
 * wordplay + a "groan rating" for fun), plus 15 general discussion
 * questions about humor and language so it doubles as speaking practice.
 */
export function buildPunsPrompt(
  topic?: string,
  difficulty?: Difficulty,
): string {
  const topicInstruction = topic
    ? `The topic is: "${topic}". Base every pun on vocabulary or ideas connected to this topic.`
    : `No topic was given -- pick a broad, fun, everyday theme (e.g. food, animals, weather, technology) and put a short label for it in the "topic" field.`;

  const difficultyInstruction =
    DIFFICULTY_INSTRUCTIONS[difficulty ?? "intermediate"];

  return `You are a witty ESL teacher building a lighthearted "Pun Lab" speaking-practice page for adult English learners.

${topicInstruction}

Requirements:
- Generate exactly 10 puns connected to the topic. ${difficultyInstruction}
- "setup": a short line or question that primes the listener for the joke, without giving away the punchline.
- "punchline": the pun itself -- genuinely funny wordplay (double meanings, homophones, or idiom twists), not just a random sentence.
- "distractors": exactly 3 other possible punchlines for the same setup that are plausible but wrong -- similar length and tone to the real punchline, tied to the same topic, but without the actual wordplay. Avoid decoys that are obviously silly, off-topic, or grammatically broken; they should tempt someone who hasn't spotted the pun yet.
- "explanation": one short, clear sentence explaining the wordplay mechanic for a learner who might miss it (e.g. "This works because 'flour' and 'flower' sound the same.").
- "groanRating": your honest 1-5 rating of how cheesy/groan-worthy the pun is (1 = mild chuckle, 5 = classic dad-joke groan).
- Vary the type of wordplay across the 10 puns -- don't repeat the same joke structure back to back.
- Keep the English clear enough that a learner can follow the joke even if the wordplay itself takes a moment to land.
- "discussionQuestions": exactly 15 short, open discussion questions (under 20 words each) about humor, wordplay, and language in general -- e.g. whether puns translate well between languages, whether the learner enjoys wordplay, or a favorite joke in their own language.

Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
${PUN_JSON_SHAPE}`;
}

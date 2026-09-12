// Shared types for the Free Talking lesson generator and the Debate
// question generator. These mirror convex/schema.ts field-for-field so the
// same shape is used from the OpenRouter response, through validation, into
// the Convex mutation, and back out to the React components. No `any`.

export interface ComprehensionQuestion {
  question: string;
  answer: string;
}

export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface VocabularyEntry {
  word: string;
  meaning: string;
}

export interface SentenceAnalysis {
  sentence: string;
  subject: string;
  verb: string;
  adverb?: string | null;
}

// The shape the AI model must return for a Free Talking lesson.
export interface GeneratedLesson {
  topic: string;
  story: string;
  comprehensionQuestions: ComprehensionQuestion[];
  multipleChoice: MultipleChoiceQuestion[];
  vocabulary: VocabularyEntry[];
  discussionQuestions: string[];
  sentenceAnalysis: SentenceAnalysis[];
}

// The shape the AI model must return for a Debate question set.
export interface GeneratedDebateSet {
  topic: string;
  questions: string[];
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isComprehensionQuestion(
  value: unknown,
): value is ComprehensionQuestion {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return isString(v.question) && isString(v.answer);
}

function isMultipleChoiceQuestion(
  value: unknown,
): value is MultipleChoiceQuestion {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isString(v.question) &&
    isStringArray(v.options) &&
    v.options.length >= 2 &&
    typeof v.correctIndex === "number" &&
    Number.isInteger(v.correctIndex) &&
    v.correctIndex >= 0 &&
    v.correctIndex < v.options.length
  );
}

function isVocabularyEntry(value: unknown): value is VocabularyEntry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return isString(v.word) && isString(v.meaning);
}

function isSentenceAnalysis(value: unknown): value is SentenceAnalysis {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (!isString(v.sentence) || !isString(v.subject) || !isString(v.verb)) {
    return false;
  }
  return v.adverb === undefined || v.adverb === null || isString(v.adverb);
}

/**
 * Validates and narrows an unknown parsed-JSON value into a GeneratedLesson.
 * Throws a descriptive error (never returns a partially-typed object) so the
 * caller can decide whether to retry the generation.
 */
export function assertGeneratedLesson(value: unknown): GeneratedLesson {
  if (typeof value !== "object" || value === null) {
    throw new Error("Lesson JSON was not an object");
  }
  const v = value as Record<string, unknown>;

  if (!isString(v.topic)) throw new Error("Lesson JSON missing string 'topic'");
  if (!isString(v.story)) throw new Error("Lesson JSON missing string 'story'");

  if (
    !Array.isArray(v.comprehensionQuestions) ||
    !v.comprehensionQuestions.every(isComprehensionQuestion)
  ) {
    throw new Error("Lesson JSON has invalid 'comprehensionQuestions'");
  }
  if (
    !Array.isArray(v.multipleChoice) ||
    !v.multipleChoice.every(isMultipleChoiceQuestion)
  ) {
    throw new Error("Lesson JSON has invalid 'multipleChoice'");
  }
  if (!Array.isArray(v.vocabulary) || !v.vocabulary.every(isVocabularyEntry)) {
    throw new Error("Lesson JSON has invalid 'vocabulary'");
  }
  if (!isStringArray(v.discussionQuestions)) {
    throw new Error("Lesson JSON has invalid 'discussionQuestions'");
  }
  if (
    !Array.isArray(v.sentenceAnalysis) ||
    !v.sentenceAnalysis.every(isSentenceAnalysis)
  ) {
    throw new Error("Lesson JSON has invalid 'sentenceAnalysis'");
  }

  return {
    topic: v.topic,
    story: v.story,
    comprehensionQuestions: v.comprehensionQuestions,
    multipleChoice: v.multipleChoice,
    vocabulary: v.vocabulary,
    discussionQuestions: v.discussionQuestions,
    sentenceAnalysis: v.sentenceAnalysis,
  };
}

/** Validates and narrows an unknown parsed-JSON value into a GeneratedDebateSet. */
export function assertGeneratedDebateSet(value: unknown): GeneratedDebateSet {
  if (typeof value !== "object" || value === null) {
    throw new Error("Debate JSON was not an object");
  }
  const v = value as Record<string, unknown>;

  if (!isString(v.topic)) throw new Error("Debate JSON missing string 'topic'");
  if (!isStringArray(v.questions)) {
    throw new Error("Debate JSON has invalid 'questions'");
  }

  return { topic: v.topic, questions: v.questions };
}

export interface GeneratedQuickQuestionsSet {
  topic: string;
  questions: string[]; // exactly 40
}

export function assertGeneratedQuickQuestionsSet(
  value: unknown,
): GeneratedQuickQuestionsSet {
  if (typeof value !== "object" || value === null) {
    throw new Error("Quick questions JSON was not an object");
  }
  const v = value as Record<string, unknown>;
  if (!isString(v.topic)) {
    throw new Error("Quick questions JSON missing string 'topic'");
  }
  if (!isStringArray(v.questions)) {
    throw new Error("Quick questions JSON has invalid 'questions'");
  }
  return { topic: v.topic, questions: v.questions };
}

// ---- Life Situations ---------------------------------------------------

export interface LifeSituation {
  scenario: string;
  options: string[];
}

export interface GeneratedLifeSituationsSet {
  topic: string;
  situations: LifeSituation[];
}

function isLifeSituation(value: unknown): value is LifeSituation {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isString(v.scenario) && isStringArray(v.options) && v.options.length >= 2
  );
}

export function assertGeneratedLifeSituationsSet(
  value: unknown,
): GeneratedLifeSituationsSet {
  if (typeof value !== "object" || value === null) {
    throw new Error("Life situations JSON was not an object");
  }
  const v = value as Record<string, unknown>;
  if (!isString(v.topic)) {
    throw new Error("Life situations JSON missing string 'topic'");
  }
  if (!Array.isArray(v.situations) || !v.situations.every(isLifeSituation)) {
    throw new Error("Life situations JSON has invalid 'situations'");
  }
  return { topic: v.topic, situations: v.situations };
}

// ADD THIS to types/lessons.ts, alongside the other Generated*/assert*
// pairs. Follows the exact same "validate unknown JSON, throw a
// descriptive error, never return a partially-typed object" pattern as
// assertGeneratedLesson / assertGeneratedDebateSet.

export type PartOfSpeech =
  | "noun"
  | "pronoun"
  | "verb"
  | "adjective"
  | "adverb"
  | "article"
  | "preposition"
  | "conjunction"
  | "interjection";

const PARTS_OF_SPEECH: readonly PartOfSpeech[] = [
  "noun",
  "pronoun",
  "verb",
  "adjective",
  "adverb",
  "article",
  "preposition",
  "conjunction",
  "interjection",
];

export interface GrammarToken {
  word: string;
  partOfSpeech: PartOfSpeech;
}

export interface GrammarQuizQuestion {
  question: string;
  answer: string;
}

export interface GrammarSentence {
  sentence: string;
  tokens: GrammarToken[];
  quiz: GrammarQuizQuestion[];
}

// The shape the AI model must return for a Grammar Breakdown set.
export interface GeneratedGrammarSet {
  topic: string;
  sentences: GrammarSentence[];
}

function isPartOfSpeech(value: unknown): value is PartOfSpeech {
  return (
    typeof value === "string" && (PARTS_OF_SPEECH as string[]).includes(value)
  );
}

function isGrammarToken(value: unknown): value is GrammarToken {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return isString(v.word) && isPartOfSpeech(v.partOfSpeech);
}

function isGrammarQuizQuestion(value: unknown): value is GrammarQuizQuestion {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return isString(v.question) && isString(v.answer);
}

function isGrammarSentence(value: unknown): value is GrammarSentence {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (!isString(v.sentence)) return false;
  if (
    !Array.isArray(v.tokens) ||
    v.tokens.length === 0 ||
    !v.tokens.every(isGrammarToken)
  ) {
    return false;
  }
  if (
    !Array.isArray(v.quiz) ||
    v.quiz.length === 0 ||
    !v.quiz.every(isGrammarQuizQuestion)
  ) {
    return false;
  }
  return true;
}

/**
 * Validates and narrows an unknown parsed-JSON value into a
 * GeneratedGrammarSet. Throws a descriptive error (never returns a
 * partially-typed object) so the caller can decide whether to retry.
 */
export function assertGeneratedGrammarSet(value: unknown): GeneratedGrammarSet {
  if (typeof value !== "object" || value === null) {
    throw new Error("Grammar breakdown JSON was not an object");
  }
  const v = value as Record<string, unknown>;
  if (!isString(v.topic)) {
    throw new Error("Grammar breakdown JSON missing string 'topic'");
  }
  if (!Array.isArray(v.sentences) || !v.sentences.every(isGrammarSentence)) {
    throw new Error("Grammar breakdown JSON has invalid 'sentences'");
  }
  return { topic: v.topic, sentences: v.sentences };
}

// NOTE: isString is already defined once near the top of types/lessons.ts
// (used by assertGeneratedLesson etc.) -- do not redeclare it, just use it.

export const TENSES = [
  "Present Simple",
  "Past Simple",
  "Past Continuous",
  "Present Perfect",
  "Future Simple",
] as const;

export type Tense = (typeof TENSES)[number];

export interface TenseVariant {
  tense: Tense;
  sentence: string;
  options: string[];
  correctIndex: number;
}

export interface TenseSentence {
  sentence: string;
  variants: TenseVariant[];
}

// The shape the AI model must return for a Tenses set.
export interface GeneratedTenseSet {
  topic: string;
  sentences: TenseSentence[];
}

function isTense(value: unknown): value is Tense {
  return (
    typeof value === "string" && (TENSES as readonly string[]).includes(value)
  );
}

function isTenseVariant(value: unknown): value is TenseVariant {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isTense(v.tense) &&
    isString(v.sentence) &&
    Array.isArray(v.options) &&
    v.options.length > 0 &&
    v.options.every(isString) &&
    typeof v.correctIndex === "number" &&
    Number.isInteger(v.correctIndex) &&
    v.correctIndex >= 0 &&
    v.correctIndex < v.options.length
  );
}

function isTenseSentence(value: unknown): value is TenseSentence {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (!isString(v.sentence)) return false;
  if (
    !Array.isArray(v.variants) ||
    v.variants.length === 0 ||
    !v.variants.every(isTenseVariant)
  ) {
    return false;
  }
  return true;
}

/**
 * Validates and narrows an unknown parsed-JSON value into a
 * GeneratedTenseSet. Throws a descriptive error (never returns a
 * partially-typed object) so the caller can decide whether to retry.
 */
export function assertGeneratedTenseSet(value: unknown): GeneratedTenseSet {
  if (typeof value !== "object" || value === null) {
    throw new Error("Tenses JSON was not an object");
  }
  const v = value as Record<string, unknown>;
  if (!isString(v.topic)) {
    throw new Error("Tenses JSON missing string 'topic'");
  }
  if (!Array.isArray(v.sentences) || !v.sentences.every(isTenseSentence)) {
    throw new Error("Tenses JSON has invalid 'sentences'");
  }
  return { topic: v.topic, sentences: v.sentences };
}

// NOTE: isString is already defined once near the top of types/lessons.ts --
// do not redeclare it, just use it.
// ADD to types/lessons.ts, below GeneratedTenseSet / assertGeneratedTenseSet.
// Reuses Tense / TENSES already defined for that feature.

export interface TenseConversionSentence {
  sentence: string;
  fromTense: Tense;
  toTense: Tense;
  answer: string;
}

export interface GeneratedTenseConversionSet {
  topic: string;
  sentences: TenseConversionSentence[];
}

function isTenseConversionSentence(
  value: unknown,
): value is TenseConversionSentence {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isString(v.sentence) &&
    isTense(v.fromTense) &&
    isTense(v.toTense) &&
    v.fromTense !== v.toTense &&
    isString(v.answer)
  );
}

/**
 * Validates and narrows an unknown parsed-JSON value into a
 * GeneratedTenseConversionSet. Throws a descriptive error (never returns a
 * partially-typed object) so the caller can decide whether to retry.
 */
export function assertGeneratedTenseConversionSet(
  value: unknown,
): GeneratedTenseConversionSet {
  if (typeof value !== "object" || value === null) {
    throw new Error("Tense conversion JSON was not an object");
  }
  const v = value as Record<string, unknown>;
  if (!isString(v.topic)) {
    throw new Error("Tense conversion JSON missing string 'topic'");
  }
  if (
    !Array.isArray(v.sentences) ||
    !v.sentences.every(isTenseConversionSentence)
  ) {
    throw new Error("Tense conversion JSON has invalid 'sentences'");
  }
  return { topic: v.topic, sentences: v.sentences };
}

// NOTE: this file already has `isTense` (private helper next to
// assertGeneratedTenseSet) -- reuse it rather than redeclaring it. If you
// named it differently there, just match the name.

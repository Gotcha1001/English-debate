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
  learningObjective: string; // AI draft of "What you'll learn today"; may be ""
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

  // The draft is a nice-to-have. If the model skips it, save "" and let the
  // teacher write one, instead of failing all 40 questions.
  const learningObjective = isString(v.learningObjective)
    ? v.learningObjective.trim()
    : "";

  return { topic: v.topic, learningObjective, questions: v.questions };
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

// ADD to types/lessons.ts, below GeneratedLifeSituationsSet /
// assertGeneratedLifeSituationsSet. Reuses isString / isStringArray already
// defined at the top of this file.

export interface RelatedExpression {
  phrase: string;
  meaning: string;
  example: string;
}

export interface ChoicePair {
  optionA: string;
  optionB: string;
}

export interface GeneratedIdiomSet {
  topic: string; // the input topic, or a short label if none was given
  idiom: string; // the idiom itself, e.g. "Off the Record"
  goal: string; // one sentence: "Today's Goal"
  origin: string; // 2-4 sentences: where the idiom comes from / why it's used
  example: string; // one natural example sentence using the idiom
  relatedExpressions: RelatedExpression[]; // exactly 2
  choicePrompt: string; // the umbrella question, e.g. "What Should Be Kept Off the Record?"
  choicePairs: ChoicePair[]; // exactly 3
  standScaleLabels: string[]; // exactly 5, ordered from one extreme to the other
  standQuestions: string[]; // exactly 3
}

function isRelatedExpression(value: unknown): value is RelatedExpression {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return isString(v.phrase) && isString(v.meaning) && isString(v.example);
}

function isChoicePair(value: unknown): value is ChoicePair {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return isString(v.optionA) && isString(v.optionB);
}

export function assertGeneratedIdiomSet(value: unknown): GeneratedIdiomSet {
  if (typeof value !== "object" || value === null) {
    throw new Error("Idiom JSON was not an object");
  }
  const v = value as Record<string, unknown>;
  if (!isString(v.topic)) throw new Error("Idiom JSON missing string 'topic'");
  if (!isString(v.idiom)) throw new Error("Idiom JSON missing string 'idiom'");
  if (!isString(v.goal)) throw new Error("Idiom JSON missing string 'goal'");
  if (!isString(v.origin))
    throw new Error("Idiom JSON missing string 'origin'");
  if (!isString(v.example))
    throw new Error("Idiom JSON missing string 'example'");
  if (
    !Array.isArray(v.relatedExpressions) ||
    v.relatedExpressions.length === 0 ||
    !v.relatedExpressions.every(isRelatedExpression)
  ) {
    throw new Error("Idiom JSON has invalid 'relatedExpressions'");
  }
  if (!isString(v.choicePrompt)) {
    throw new Error("Idiom JSON missing string 'choicePrompt'");
  }
  if (
    !Array.isArray(v.choicePairs) ||
    v.choicePairs.length === 0 ||
    !v.choicePairs.every(isChoicePair)
  ) {
    throw new Error("Idiom JSON has invalid 'choicePairs'");
  }
  if (!isStringArray(v.standScaleLabels) || v.standScaleLabels.length !== 5) {
    throw new Error(
      "Idiom JSON has invalid 'standScaleLabels' (need exactly 5)",
    );
  }
  if (!isStringArray(v.standQuestions)) {
    throw new Error("Idiom JSON has invalid 'standQuestions'");
  }
  return {
    topic: v.topic,
    idiom: v.idiom,
    goal: v.goal,
    origin: v.origin,
    example: v.example,
    relatedExpressions: v.relatedExpressions,
    choicePrompt: v.choicePrompt,
    choicePairs: v.choicePairs,
    standScaleLabels: v.standScaleLabels,
    standQuestions: v.standQuestions,
  };
}

// ADD to types/lessons.ts, below assertGeneratedIdiomSet (or wherever your
// idiom types landed). Reuses isString / isStringArray already defined at
// the top of this file.

export interface SynonymGroup {
  concept: string; // the base idea, e.g. "Angry"
  spectrumLabel: string; // describes the two ends, e.g. "Mild -> Intense"
  words: string[]; // exactly 5, in CORRECT order from one end to the other
  connotationNote: string; // one sentence on why the words aren't interchangeable
  fillBlankSentence: string; // one sentence containing "___" where a word fits
  correctWordIndex: number; // index into `words` -- the best fit for the blank
  debateQuestion: string; // one discussion/debate question built from the connotation gap
}

export interface GeneratedSynonymSet {
  topic: string;
  groups: SynonymGroup[]; // exactly 5
  discussionQuestions: string[]; // exactly 15, general topic questions mixing in the vocabulary
}

function isSynonymGroup(value: unknown): value is SynonymGroup {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isString(v.concept) &&
    isString(v.spectrumLabel) &&
    isStringArray(v.words) &&
    v.words.length === 5 &&
    isString(v.connotationNote) &&
    isString(v.fillBlankSentence) &&
    typeof v.correctWordIndex === "number" &&
    Number.isInteger(v.correctWordIndex) &&
    v.correctWordIndex >= 0 &&
    v.correctWordIndex < v.words.length &&
    isString(v.debateQuestion)
  );
}

export function assertGeneratedSynonymSet(value: unknown): GeneratedSynonymSet {
  if (typeof value !== "object" || value === null) {
    throw new Error("Synonym JSON was not an object");
  }
  const v = value as Record<string, unknown>;
  if (!isString(v.topic)) {
    throw new Error("Synonym JSON missing string 'topic'");
  }
  if (
    !Array.isArray(v.groups) ||
    v.groups.length === 0 ||
    !v.groups.every(isSynonymGroup)
  ) {
    throw new Error("Synonym JSON has invalid 'groups'");
  }
  if (!isStringArray(v.discussionQuestions)) {
    throw new Error("Synonym JSON has invalid 'discussionQuestions'");
  }
  return {
    topic: v.topic,
    groups: v.groups,
    discussionQuestions: v.discussionQuestions,
  };
}

// ADD to types/lessons.ts, below assertGeneratedSynonymSet. Reuses isString
// / isStringArray already defined at the top of this file.

export interface AntonymPair {
  word: string;
  antonym: string;
  exampleSentence: string; // one sentence using both words to contrast them
}

export interface AntonymAnalogy {
  pairIndexA: number; // index into `pairs` -- the "given" relationship
  pairIndexB: number; // index into `pairs` -- the word being asked about
  options: string[]; // exactly 4, one of which is pairs[pairIndexB].antonym
  correctIndex: number; // index into `options`
}

export interface GeneratedAntonymSet {
  topic: string;
  pairs: AntonymPair[]; // exactly 8
  analogies: AntonymAnalogy[]; // exactly 5
}

function isAntonymPair(value: unknown): value is AntonymPair {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return isString(v.word) && isString(v.antonym) && isString(v.exampleSentence);
}

function isAntonymAnalogy(
  value: unknown,
  pairsLength: number,
): value is AntonymAnalogy {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (
    typeof v.pairIndexA !== "number" ||
    !Number.isInteger(v.pairIndexA) ||
    v.pairIndexA < 0 ||
    v.pairIndexA >= pairsLength
  ) {
    return false;
  }
  if (
    typeof v.pairIndexB !== "number" ||
    !Number.isInteger(v.pairIndexB) ||
    v.pairIndexB < 0 ||
    v.pairIndexB >= pairsLength ||
    v.pairIndexB === v.pairIndexA
  ) {
    return false;
  }
  if (!isStringArray(v.options) || v.options.length !== 4) return false;
  return (
    typeof v.correctIndex === "number" &&
    Number.isInteger(v.correctIndex) &&
    v.correctIndex >= 0 &&
    v.correctIndex < v.options.length
  );
}

export function assertGeneratedAntonymSet(value: unknown): GeneratedAntonymSet {
  if (typeof value !== "object" || value === null) {
    throw new Error("Antonym JSON was not an object");
  }
  const v = value as Record<string, unknown>;
  if (!isString(v.topic)) {
    throw new Error("Antonym JSON missing string 'topic'");
  }
  if (
    !Array.isArray(v.pairs) ||
    v.pairs.length !== 8 ||
    !v.pairs.every(isAntonymPair)
  ) {
    throw new Error("Antonym JSON has invalid 'pairs' (need exactly 8)");
  }
  const pairsLength = v.pairs.length;
  if (
    !Array.isArray(v.analogies) ||
    v.analogies.length === 0 ||
    !v.analogies.every((a) => isAntonymAnalogy(a, pairsLength))
  ) {
    throw new Error("Antonym JSON has invalid 'analogies'");
  }
  return {
    topic: v.topic,
    pairs: v.pairs,
    analogies: v.analogies,
  };
}
// ADD to types/lessons.ts, below assertGeneratedAntonymSet. Reuses isString
// / isStringArray already defined at the top of this file.

export interface WordRelationGroup {
  word: string; // the base word
  synonymOptions: string[]; // exactly 4, one of which means the same as `word`
  correctSynonymIndex: number; // index into synonymOptions
  antonymOptions: string[]; // exactly 4, one of which means the opposite of `word`
  correctAntonymIndex: number; // index into antonymOptions
  debateQuestion: string; // built by comparing the correct synonym and antonym
}

export interface GeneratedWordRelationSet {
  topic: string;
  groups: WordRelationGroup[]; // exactly 6
  discussionQuestions: string[]; // exactly 15
}

function isWordRelationGroup(value: unknown): value is WordRelationGroup {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (!isString(v.word)) return false;
  if (!isStringArray(v.synonymOptions) || v.synonymOptions.length !== 4) {
    return false;
  }
  if (
    typeof v.correctSynonymIndex !== "number" ||
    !Number.isInteger(v.correctSynonymIndex) ||
    v.correctSynonymIndex < 0 ||
    v.correctSynonymIndex >= v.synonymOptions.length
  ) {
    return false;
  }
  if (!isStringArray(v.antonymOptions) || v.antonymOptions.length !== 4) {
    return false;
  }
  if (
    typeof v.correctAntonymIndex !== "number" ||
    !Number.isInteger(v.correctAntonymIndex) ||
    v.correctAntonymIndex < 0 ||
    v.correctAntonymIndex >= v.antonymOptions.length
  ) {
    return false;
  }
  return isString(v.debateQuestion);
}

export function assertGeneratedWordRelationSet(
  value: unknown,
): GeneratedWordRelationSet {
  if (typeof value !== "object" || value === null) {
    throw new Error("Word relation JSON was not an object");
  }
  const v = value as Record<string, unknown>;
  if (!isString(v.topic)) {
    throw new Error("Word relation JSON missing string 'topic'");
  }
  if (
    !Array.isArray(v.groups) ||
    v.groups.length !== 6 ||
    !v.groups.every(isWordRelationGroup)
  ) {
    throw new Error("Word relation JSON has invalid 'groups' (need exactly 6)");
  }
  if (!isStringArray(v.discussionQuestions)) {
    throw new Error("Word relation JSON has invalid 'discussionQuestions'");
  }
  return {
    topic: v.topic,
    groups: v.groups,
    discussionQuestions: v.discussionQuestions,
  };
}

// ADD to types/lessons.ts, below assertGeneratedWordRelationSet (or wherever
// your other standalone-page types live). Reuses isString / isStringArray
// already defined at the top of this file.

export interface PunItem {
  setup: string; // the build-up line or question that sets up the joke
  punchline: string; // the pun / wordplay payoff
  explanation: string; // one short sentence on HOW the wordplay works (the double meaning / homophone)
  distractors: string[];
  groanRating: number; // 1-5, how groan-worthy / cheesy the pun is (5 = maximum dad-joke energy)
}

export interface GeneratedPunSet {
  topic: string; // the input topic, or a short label if none was given
  puns: PunItem[]; // exactly 10
  discussionQuestions: string[]; // exactly 15, about wordplay/humor/language in general
}

function isPunItem(value: unknown): value is PunItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isString(v.setup) &&
    isString(v.punchline) &&
    isStringArray(v.distractors) &&
    v.distractors.length === 3 &&
    isString(v.explanation) &&
    typeof v.groanRating === "number" &&
    Number.isInteger(v.groanRating) &&
    v.groanRating >= 1 &&
    v.groanRating <= 5
  );
}

export function assertGeneratedPunSet(value: unknown): GeneratedPunSet {
  if (typeof value !== "object" || value === null) {
    throw new Error("Pun JSON was not an object");
  }
  const v = value as Record<string, unknown>;
  if (!isString(v.topic)) {
    throw new Error("Pun JSON missing string 'topic'");
  }
  if (
    !Array.isArray(v.puns) ||
    v.puns.length !== 10 ||
    !v.puns.every(isPunItem)
  ) {
    throw new Error("Pun JSON has invalid 'puns' (need exactly 10)");
  }
  if (
    !isStringArray(v.discussionQuestions) ||
    v.discussionQuestions.length !== 15
  ) {
    throw new Error(
      "Pun JSON has invalid 'discussionQuestions' (need exactly 15)",
    );
  }
  return {
    topic: v.topic,
    puns: v.puns,
    discussionQuestions: v.discussionQuestions,
  };
}

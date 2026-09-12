/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as debate from "../debate.js";
import type * as debateData from "../debateData.js";
import type * as grammar from "../grammar.js";
import type * as grammarData from "../grammarData.js";
import type * as lessonData from "../lessonData.js";
import type * as lessons from "../lessons.js";
import type * as lifeSituations from "../lifeSituations.js";
import type * as lifeSituationsData from "../lifeSituationsData.js";
import type * as quickQuestions from "../quickQuestions.js";
import type * as quickQuestionsData from "../quickQuestionsData.js";
import type * as tenses from "../tenses.js";
import type * as tensesData from "../tensesData.js";
import type * as user from "../user.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  debate: typeof debate;
  debateData: typeof debateData;
  grammar: typeof grammar;
  grammarData: typeof grammarData;
  lessonData: typeof lessonData;
  lessons: typeof lessons;
  lifeSituations: typeof lifeSituations;
  lifeSituationsData: typeof lifeSituationsData;
  quickQuestions: typeof quickQuestions;
  quickQuestionsData: typeof quickQuestionsData;
  tenses: typeof tenses;
  tensesData: typeof tensesData;
  user: typeof user;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

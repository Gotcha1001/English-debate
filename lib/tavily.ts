// lib/tavily.ts
//
// Thin wrapper around Tavily's REST Search API (https://api.tavily.com/search).
// Used only by convex/topNews.ts to pull today's top news story -- headline,
// article text, publish date, and a representative image if Tavily found
// one. Plain helper (not a Convex function), same shape as lib/cloudinary.ts:
// imported from an action, which is where the "use node" runtime
// requirement actually comes from.

export class TavilyError extends Error {}

export interface TopNewsArticle {
  title: string;
  url: string;
  /** Best available article text: raw_content if Tavily extracted the full
   * page, otherwise its shorter relevance-ranked content snippet. */
  content: string;
  publishedDate?: string;
  /** First query-related image Tavily returned alongside the results, if any. */
  imageUrl?: string;
}

interface TavilySearchResult {
  title?: string;
  url?: string;
  content?: string;
  raw_content?: string;
  published_date?: string;
}

interface TavilyImageResult {
  url?: string;
}

interface TavilySearchResponse {
  results?: TavilySearchResult[];
  images?: (string | TavilyImageResult)[];
}

function getApiKey(): string {
  // Convex functions only see variables set on the Convex deployment (not
  // the Next.js .env) -- same rule as lib/cloudinary.ts.
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new TavilyError(
      "TAVILY_API_KEY is not set for this Convex deployment. Run `npx convex env set TAVILY_API_KEY <key>`.",
    );
  }
  return apiKey;
}

/**
 * Searches Tavily's "news" topic for today's most prominent story and
 * returns enough of its real content to build an ESL lesson from. Results
 * come back pre-ranked by relevance, so the first one with enough real text
 * is treated as "the" top story.
 */
export async function fetchTopNewsArticle(): Promise<TopNewsArticle> {
  const apiKey = getApiKey();

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: "today's top world news headline",
      topic: "news",
      days: 1,
      search_depth: "advanced",
      max_results: 5,
      include_raw_content: true,
      include_images: true,
    }),
  });

  const raw = (await response
    .json()
    .catch(() => null)) as TavilySearchResponse | null;

  if (!response.ok || !raw) {
    throw new TavilyError(`Tavily search failed: HTTP ${response.status}`);
  }

  const results = raw.results ?? [];
  const top =
    results.find(
      (r) => (r.raw_content ?? r.content ?? "").trim().length > 300,
    ) ?? results[0];

  if (!top?.title || !top.url) {
    throw new TavilyError(
      "Tavily didn't return any usable news results today.",
    );
  }

  const content = (top.raw_content ?? top.content ?? "").trim();
  if (!content) {
    throw new TavilyError(
      "Today's top story had no readable content to work with.",
    );
  }

  const firstImage = raw.images?.[0];
  const imageUrl =
    typeof firstImage === "string" ? firstImage : firstImage?.url;

  return {
    title: top.title,
    url: top.url,
    content,
    publishedDate: top.published_date,
    imageUrl,
  };
}

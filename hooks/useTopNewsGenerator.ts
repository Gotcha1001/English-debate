// hooks/useTopNewsGenerator.ts

"use client";

import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseTopNewsGenerator {
  generateTopNewsLesson: () => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/** No topic input, unlike every other generator hook -- Top News always
 * pulls whatever Tavily says is leading the news right now. */
export function useTopNewsGenerator(): UseTopNewsGenerator {
  const generate = useAction(api.topNews.generateTopNewsLesson);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTopNewsLesson = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generate({});
      const id: Id<"topNewsLessons"> = result.id;
      if (result.usedFallback) {
        toast.message("Backup model used", {
          description:
            "The primary AI model was busy, so a backup one wrote this lesson instead.",
        });
      }
      router.push(`/top-news/${id}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong fetching today's news. Try again.";
      setError(message);
      toast.error("Couldn't generate today's lesson", {
        description: message,
        action: {
          label: "Try again",
          onClick: () => void generateTopNewsLesson(),
        },
      });
    } finally {
      setIsGenerating(false);
    }
  }, [generate, router]);

  return { generateTopNewsLesson, isGenerating, error };
}

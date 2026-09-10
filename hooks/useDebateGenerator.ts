"use client";

import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseDebateGenerator {
  generateDebateSet: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/** Calls debate.generateDebateSet, then routes to the new set's page. */
export function useDebateGenerator(): UseDebateGenerator {
  const generate = useAction(api.debate.generateDebateSet);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDebateSet = useCallback(
    async (topic: string) => {
      if (!topic.trim()) {
        setError("Enter a topic for the debate questions.");
        return;
      }
      setIsGenerating(true);
      setError(null);
      try {
        const id: Id<"debateSets"> = await generate({ topic: topic.trim() });
        router.push(`/debate/${id}`);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong generating the questions. Try again.",
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );

  return { generateDebateSet, isGenerating, error };
}

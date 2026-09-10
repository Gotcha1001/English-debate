"use client";

import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseGrammarGenerator {
  generateGrammarSet: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Drives the "Grammar Breakdown" generator (convex/grammar.ts ->
 * generateGrammarSet). Same shape as useLifeSituationsGenerator /
 * useDebateGenerator: fire the action, toast if the fallback model was
 * used, then route to the new set's detail page.
 */
export function useGrammarGenerator(): UseGrammarGenerator {
  const generate = useAction(api.grammar.generateGrammarSet);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateGrammarSet = useCallback(
    async (topic: string) => {
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generate({
          topic: topic.trim() ? topic.trim() : undefined,
        });
        const id: Id<"grammarSets"> = result.id;
        if (result.usedFallback) {
          toast.message("Backup model used", {
            description:
              "The primary AI model was busy, so a backup one wrote this breakdown instead.",
          });
        }
        router.push(`/grammar/${id}`);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong generating the breakdown. Try again.";
        setError(message);
        toast.error("Couldn't generate the breakdown", {
          description: message,
          action: {
            label: "Try again",
            onClick: () => void generateGrammarSet(topic),
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );

  return { generateGrammarSet, isGenerating, error };
}

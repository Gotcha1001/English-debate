"use client";

import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseTensesGenerator {
  generateTenseSet: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Drives the "Tenses" generator (convex/tenses.ts -> generateTenseSet).
 * Same shape as useGrammarGenerator / useDebateGenerator: fire the action,
 * toast if the fallback model was used, then route to the new set's
 * detail page.
 */
export function useTensesGenerator(): UseTensesGenerator {
  const generate = useAction(api.tenses.generateTenseSet);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTenseSet = useCallback(
    async (topic: string) => {
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generate({
          topic: topic.trim() ? topic.trim() : undefined,
        });
        const id: Id<"tenseSets"> = result.id;
        if (result.usedFallback) {
          toast.message("Backup model used", {
            description:
              "The primary AI model was busy, so a backup one wrote this set instead.",
          });
        }
        router.push(`/tenses/${id}`);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong generating the tenses set. Try again.";
        setError(message);
        toast.error("Couldn't generate the tenses set", {
          description: message,
          action: {
            label: "Try again",
            onClick: () => void generateTenseSet(topic),
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );

  return { generateTenseSet, isGenerating, error };
}

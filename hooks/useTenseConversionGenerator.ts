"use client";

import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseTenseConversionGenerator {
  generateTenseConversionSet: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Drives the "Transform the Tense" generator (convex/tenseConversion.ts ->
 * generateTenseConversionSet). Same shape as useTensesGenerator: fire the
 * action, toast if the fallback model was used, then route to the new
 * set's detail page.
 */
export function useTenseConversionGenerator(): UseTenseConversionGenerator {
  const generate = useAction(api.tenseConversion.generateTenseConversionSet);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTenseConversionSet = useCallback(
    async (topic: string) => {
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generate({
          topic: topic.trim() ? topic.trim() : undefined,
        });
        const id: Id<"tenseConversionSets"> = result.id;
        if (result.usedFallback) {
          toast.message("Backup model used", {
            description:
              "The primary AI model was busy, so a backup one wrote this set instead.",
          });
        }
        router.push(`/tenses/transform/${id}`);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong generating the set. Try again.";
        setError(message);
        toast.error("Couldn't generate the set", {
          description: message,
          action: {
            label: "Try again",
            onClick: () => void generateTenseConversionSet(topic),
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );

  return { generateTenseConversionSet, isGenerating, error };
}

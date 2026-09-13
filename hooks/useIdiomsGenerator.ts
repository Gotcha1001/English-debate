"use client";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseIdiomsGenerator {
  generateIdiomSet: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Drives the "Idioms" generator (convex/idioms.ts -> generateIdiomSet).
 * Same shape as useLifeSituationsGenerator: fire the action, toast if the
 * fallback model was used, then route to the new set's detail page.
 */
export function useIdiomsGenerator(): UseIdiomsGenerator {
  const generate = useAction(api.idioms.generateIdiomSet);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generateIdiomSet = useCallback(
    async (topic: string) => {
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generate({
          topic: topic.trim() ? topic.trim() : undefined,
        });
        const id: Id<"idiomSets"> = result.id;
        if (result.usedFallback) {
          toast.message("Backup model used", {
            description:
              "The primary AI model was busy, so a backup one wrote this lesson instead.",
          });
        }
        router.push(`/idioms/${id}`);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong generating the idiom lesson. Try again.";
        setError(message);
        toast.error("Couldn't generate the idiom lesson", {
          description: message,
          action: {
            label: "Try again",
            onClick: () => void generateIdiomSet(topic),
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );
  return { generateIdiomSet, isGenerating, error };
}

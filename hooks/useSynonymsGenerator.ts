"use client";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseSynonymsGenerator {
  generateSynonymSet: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function useSynonymsGenerator(): UseSynonymsGenerator {
  const generate = useAction(api.synonyms.generateSynonymSet);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generateSynonymSet = useCallback(
    async (topic: string) => {
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generate({
          topic: topic.trim() ? topic.trim() : undefined,
        });
        const id: Id<"synonymSets"> = result.id;
        if (result.usedFallback) {
          toast.message("Backup model used", {
            description:
              "The primary AI model was busy, so a backup one wrote this set instead.",
          });
        }
        router.push(`/synonyms/${id}`);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong generating the synonym set. Try again.";
        setError(message);
        toast.error("Couldn't generate the synonym set", {
          description: message,
          action: {
            label: "Try again",
            onClick: () => void generateSynonymSet(topic),
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );
  return { generateSynonymSet, isGenerating, error };
}

"use client";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseAntonymsGenerator {
  generateAntonymSet: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function useAntonymsGenerator(): UseAntonymsGenerator {
  const generate = useAction(api.antonyms.generateAntonymSet);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generateAntonymSet = useCallback(
    async (topic: string) => {
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generate({
          topic: topic.trim() ? topic.trim() : undefined,
        });
        const id: Id<"antonymSets"> = result.id;
        if (result.usedFallback) {
          toast.message("Backup model used", {
            description:
              "The primary AI model was busy, so a backup one wrote this set instead.",
          });
        }
        router.push(`/antonyms/${id}`);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong generating the antonym set. Try again.";
        setError(message);
        toast.error("Couldn't generate the antonym set", {
          description: message,
          action: {
            label: "Try again",
            onClick: () => void generateAntonymSet(topic),
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );
  return { generateAntonymSet, isGenerating, error };
}

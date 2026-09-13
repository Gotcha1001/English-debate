"use client";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseWordRelationsGenerator {
  generateWordRelationSet: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function useWordRelationsGenerator(): UseWordRelationsGenerator {
  const generate = useAction(api.wordRelations.generateWordRelationSet);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generateWordRelationSet = useCallback(
    async (topic: string) => {
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generate({
          topic: topic.trim() ? topic.trim() : undefined,
        });
        const id: Id<"wordRelationSets"> = result.id;
        if (result.usedFallback) {
          toast.message("Backup model used", {
            description:
              "The primary AI model was busy, so a backup one wrote this set instead.",
          });
        }
        router.push(`/word-relations/${id}`);
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
            onClick: () => void generateWordRelationSet(topic),
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );
  return { generateWordRelationSet, isGenerating, error };
}

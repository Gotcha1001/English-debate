"use client";

import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseLifeSituationsGenerator {
  generateLifeSituationSet: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function useLifeSituationsGenerator(): UseLifeSituationsGenerator {
  const generate = useAction(api.lifeSituations.generateLifeSituationSet);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLifeSituationSet = useCallback(
    async (topic: string) => {
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generate({
          topic: topic.trim() ? topic.trim() : undefined,
        });
        const id: Id<"lifeSituationSets"> = result.id;
        if (result.usedFallback) {
          toast.message("Backup model used", {
            description:
              "The primary AI model was busy, so a backup one wrote these scenarios instead.",
          });
        }
        router.push(`/life-situations/${id}`);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong generating the scenarios. Try again.";
        setError(message);
        toast.error("Couldn't generate the scenarios", {
          description: message,
          action: {
            label: "Try again",
            onClick: () => void generateLifeSituationSet(topic),
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );

  return { generateLifeSituationSet, isGenerating, error };
}

"use client";

import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseQuickQuestionsGenerator {
  generateQuickQuestionSet: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function useQuickQuestionsGenerator(): UseQuickQuestionsGenerator {
  const generate = useAction(api.quickQuestions.generateQuickQuestionSet);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuickQuestionSet = useCallback(
    async (topic: string) => {
      if (!topic.trim()) {
        setError("Enter a topic for the 40 questions.");
        return;
      }
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generate({ topic: topic.trim() });
        const id: Id<"quickQuestionSets"> = result.id;
        if (result.usedFallback) {
          toast.message("Backup model used", {
            description:
              "The primary AI model was busy, so a backup one wrote these questions instead.",
          });
        }
        router.push(`/quick-questions/${id}`);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong generating the questions. Try again.";
        setError(message);
        toast.error("Couldn't generate the questions", {
          description: message,
          action: {
            label: "Try again",
            onClick: () => void generateQuickQuestionSet(topic),
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );

  return { generateQuickQuestionSet, isGenerating, error };
}

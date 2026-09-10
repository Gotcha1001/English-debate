"use client";

import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UseLessonGenerator {
  generateLesson: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function useLessonGenerator(): UseLessonGenerator {
  const generate = useAction(api.lessons.generateLesson);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLesson = useCallback(
    async (topic: string) => {
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generate({
          topic: topic.trim() ? topic.trim() : undefined,
        });
        const id: Id<"lessons"> = result.id;
        if (result.usedFallback) {
          toast.message("Backup model used", {
            description:
              "The primary AI model was busy, so a backup one wrote this lesson instead.",
          });
        }
        router.push(`/free-talking/${id}`);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong generating the lesson. Try again.";
        setError(message);
        toast.error("Couldn't generate the lesson", {
          description: message,
          action: {
            label: "Try again",
            onClick: () => void generateLesson(topic),
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );

  return { generateLesson, isGenerating, error };
}

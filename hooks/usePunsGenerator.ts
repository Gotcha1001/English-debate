"use client";

import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UsePunsGenerator {
  generatePunSet: (topic: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Drives the "Pun Lab" generator (convex/puns.ts -> generatePunSet).
 * Same shape as useIdiomsGenerator: fire the action, toast if the
 * fallback model was used, then route to the new set's detail page.
 */
export function usePunsGenerator(): UsePunsGenerator {
  const generate = useAction(api.puns.generatePunSet);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePunSet = useCallback(
    async (topic: string) => {
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generate({
          topic: topic.trim() ? topic.trim() : undefined,
        });
        const id: Id<"punSets"> = result.id;
        if (result.usedFallback) {
          toast.message("Backup model used", {
            description:
              "The primary AI model was busy, so a backup one wrote these puns instead.",
          });
        }
        router.push(`/puns/${id}`);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong generating the puns. Try again.";
        setError(message);
        toast.error("Couldn't generate the puns", {
          description: message,
          action: {
            label: "Try again",
            onClick: () => void generatePunSet(topic),
          },
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [generate, router],
  );

  return { generatePunSet, isGenerating, error };
}

"use client";

import { useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { FunctionReference } from "convex/server";

export function useDeleteSet<Args extends { id: string }>(
  mutationRef: FunctionReference<"mutation", "public", Args, null>,
  itemLabel: string,
) {
  const remove = useMutation(mutationRef) as unknown as (
    args: Args,
  ) => Promise<null>;
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteItem = useCallback(
    async (args: Args) => {
      setDeletingId(args.id);
      try {
        await remove(args);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : `Couldn't delete this ${itemLabel}.`;
        toast.error(`Couldn't delete this ${itemLabel}`, {
          description: message,
          action: { label: "Try again", onClick: () => void deleteItem(args) },
        });
      } finally {
        setDeletingId(null);
      }
    },
    [remove, itemLabel],
  );

  return { deleteItem, deletingId };
}

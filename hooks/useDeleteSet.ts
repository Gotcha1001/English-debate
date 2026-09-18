"use client";

import { useAction, useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { FunctionReference } from "convex/server";

// Shared body: tracks which row is being deleted and shows the retry toast.
function useDeleteRunner<Args extends { id: string }>(
  remove: (args: Args) => Promise<null>,
  itemLabel: string,
) {
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

/** Delete via a plain Convex mutation (existing pages keep using this). */
export function useDeleteSet<Args extends { id: string }>(
  mutationRef: FunctionReference<"mutation", "public", Args, null>,
  itemLabel: string,
) {
  const remove = useMutation(mutationRef) as unknown as (
    args: Args,
  ) => Promise<null>;
  return useDeleteRunner(remove, itemLabel);
}

/**
 * Delete via a Convex *action*. Use this for sets that own a Cloudinary
 * image: only an action can call Cloudinary, so the action deletes the image
 * first and then the row.
 */
export function useDeleteSetAction<Args extends { id: string }>(
  actionRef: FunctionReference<"action", "public", Args, null>,
  itemLabel: string,
) {
  const remove = useAction(actionRef) as unknown as (
    args: Args,
  ) => Promise<null>;
  return useDeleteRunner(remove, itemLabel);
}

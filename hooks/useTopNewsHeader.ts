// hooks/useTopNewsHeader.ts

"use client";

import { useAction, useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { fileToResizedDataUri } from "@/lib/imageToDataUri";

function messageOf(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

/**
 * Glue between <LessonHeader> and Convex for one Top News lesson: image
 * upload/remove (Cloudinary, via actions) and the editable "what you'll
 * learn today" paragraph (plain mutation). Same shape as
 * useLifeSituationHeader, pointed at the `topNewsLessons` table.
 */
export function useTopNewsHeader(id: Id<"topNewsLessons">) {
  const uploadHeaderImage = useAction(api.topNewsActions.uploadHeaderImage);
  const removeHeaderImage = useAction(api.topNewsActions.removeHeaderImage);
  const updateLearningObjective = useMutation(
    api.topNewsData.updateLearningObjective,
  );

  // One flag for upload / replace / remove: the header only has a single
  // spinner slot, and only one image operation should run at a time anyway.
  const [isImageBusy, setIsImageBusy] = useState(false);
  const [isSavingObjective, setIsSavingObjective] = useState(false);

  const uploadImage = useCallback(
    async (file: File) => {
      if (isImageBusy) return;
      setIsImageBusy(true);
      try {
        const imageDataUri = await fileToResizedDataUri(file);
        await uploadHeaderImage({ id, imageDataUri });
      } catch (err) {
        toast.error("Couldn't upload the image", {
          description: messageOf(err, "Something went wrong. Try again."),
        });
      } finally {
        setIsImageBusy(false);
      }
    },
    [id, isImageBusy, uploadHeaderImage],
  );

  const removeImage = useCallback(async (): Promise<void> => {
    if (isImageBusy) return;
    setIsImageBusy(true);
    try {
      await removeHeaderImage({ id });
    } catch (err) {
      toast.error("Couldn't remove the image", {
        description: messageOf(err, "Something went wrong. Try again."),
        action: { label: "Try again", onClick: () => void removeImage() },
      });
    } finally {
      setIsImageBusy(false);
    }
  }, [id, isImageBusy, removeHeaderImage]);

  const saveObjective = useCallback(
    async (text: string) => {
      setIsSavingObjective(true);
      try {
        await updateLearningObjective({ id, learningObjective: text });
      } catch (err) {
        toast.error("Couldn't save your changes", {
          description: messageOf(err, "Something went wrong. Try again."),
        });
        // Re-throw so <LessonHeader> keeps the editor open and the teacher's
        // draft isn't lost.
        throw err;
      } finally {
        setIsSavingObjective(false);
      }
    },
    [id, updateLearningObjective],
  );

  return {
    uploadImage,
    removeImage,
    saveObjective,
    isImageBusy,
    isSavingObjective,
  };
}

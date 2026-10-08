"use client";

// app/pictures/view/[id]/page.tsx
// PUBLIC, view-only gallery. No sign-in needed (see proxy.ts) and no
// add / manage controls. Rendered without sidebar/navbar (see AppShell.tsx).

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HudPanel } from "@/app/components/HudPanel";
import { PictureDeck, useDeck } from "@/app/components/PictureDeck";

export default function PublicPicturesPage() {
  const { id } = useParams<{ id: string }>();
  const pictures = useQuery(api.picturesData.listPublicPictures, {
    ownerId: id,
  });
  const deck = useDeck(pictures?.length ?? 0);

  if (pictures === undefined) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-stone-500">Loading...</p>
      </div>
    );
  }

  return (
    <PictureDeck
      pictures={pictures}
      index={deck.index}
      direction={deck.direction}
      onGo={deck.goTo}
      header={
        <h1 className="text-xl font-bold text-slate-900 dark:text-stone-50">
          Picture Talk
        </h1>
      }
      empty={
        <HudPanel className="p-8 text-center">
          <p className="text-stone-300">No pictures to show.</p>
        </HudPanel>
      }
    />
  );
}

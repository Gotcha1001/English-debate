"use client";

// app/pictures/show/page.tsx
// View-only Picture Talk, PUBLIC (no sign-in, see proxy.ts). Same player as "Show pictures"
// (search bar + next/previous), but NO "Add & manage" tab, NO upload/delete.
// Lives under /pictures, so AppShell already renders it full-screen without
// the sidebar/navbar (STANDALONE_ROUTES).

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HudPanel } from "@/app/components/HudPanel";
import { PictureDeck, useDeck } from "@/app/components/PictureDeck";

export default function ShowPicturesPage() {
  const pictures = useQuery(api.picturesData.listShowPictures);
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
      centerHeader
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

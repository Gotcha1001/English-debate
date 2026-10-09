// convex/picturesData.ts
import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  query,
  type DatabaseReader,
} from "./_generated/server";

async function userByClerkId(db: DatabaseReader, clerkId: string) {
  return await db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();
}

/** The signed-in user's pictures, in number order (1, 2, 3, ...). */
export const listMyPictures = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await userByClerkId(ctx.db, identity.subject);
    if (!me) return [];
    return await ctx.db
      .query("pictureCards")
      .withIndex("by_creator_number", (q) => q.eq("createdBy", me._id))
      .order("asc")
      .collect();
  },
});

/** The signed-in user's id, used to build their public gallery link. */
export const myDeckId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const me = await userByClerkId(ctx.db, identity.subject);
    return me?._id ?? null;
  },
});

/**
 * PUBLIC (no sign-in needed): the pictures of one deck, view-only.
 * Only returns what the player needs: no owner info, no storage ids.
 */
export const listPublicPictures = query({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) => {
    const id = ctx.db.normalizeId("users", ownerId);
    if (!id) return [];
    const cards = await ctx.db
      .query("pictureCards")
      .withIndex("by_creator_number", (q) => q.eq("createdBy", id))
      .order("asc")
      .collect();
    return cards.map((c) => ({
      _id: c._id,
      title: c.title,
      number: c.number,
      image: { url: c.image.url },
    }));
  },
});

/** PUBLIC (no sign-in): all pictures in number order, view-only. */
export const listShowPictures = query({
  args: {},
  handler: async (ctx) => {
    const cards = await ctx.db.query("pictureCards").collect();
    return cards
      .sort((a, b) => a.number - b.number)
      .map((c) => ({
        _id: c._id,
        title: c.title,
        number: c.number,
        image: { url: c.image.url },
      }));
  },
});

// --- internal (called only from picturesActions.ts) ------------------------

/** Ownership check for the delete action. Returns null for anyone else's card. */
export const getOwnedPicture = internalQuery({
  args: { id: v.id("pictureCards"), clerkId: v.string() },
  handler: async (ctx, { id, clerkId }) => {
    const me = await userByClerkId(ctx.db, clerkId);
    if (!me) return null;
    const doc = await ctx.db.get(id);
    if (!doc || doc.createdBy !== me._id) return null;
    return doc;
  },
});

/** Adds a card at the end of the deck: its number is (highest number) + 1. */
export const insertPicture = internalMutation({
  args: {
    clerkId: v.string(),
    title: v.string(),
    url: v.string(),
    publicId: v.string(),
  },
  handler: async (ctx, { clerkId, title, url, publicId }) => {
    const me = await userByClerkId(ctx.db, clerkId);
    if (!me) throw new Error("User not found.");

    const last = await ctx.db
      .query("pictureCards")
      .withIndex("by_creator_number", (q) => q.eq("createdBy", me._id))
      .order("desc")
      .first();
    const number = (last?.number ?? 0) + 1;

    const id = await ctx.db.insert("pictureCards", {
      title,
      number,
      image: { url, publicId },
      createdBy: me._id,
      createdAt: Date.now(),
    });
    return { id, number };
  },
});

/**
 * Deletes the card, then closes the gap so numbers stay 1..N
 * (deleting #3 turns old #4 into #3, and so on).
 */
export const deleteRow = internalMutation({
  args: { id: v.id("pictureCards") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    await ctx.db.delete(id);

    const later = await ctx.db
      .query("pictureCards")
      .withIndex("by_creator_number", (q) =>
        q.eq("createdBy", doc.createdBy).gt("number", doc.number),
      )
      .collect();
    for (const card of later) {
      await ctx.db.patch(card._id, { number: card.number - 1 });
    }
    return null;
  },
});

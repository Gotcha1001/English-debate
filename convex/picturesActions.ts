"use node";

// convex/picturesActions.ts
import { createHash } from "node:crypto";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const MAX_TITLE_LENGTH = 80;
// Convex caps action arguments at 8 MiB. The client shrinks images first,
// so this is only a safety net.
const MAX_DATA_URI_LENGTH = 7_000_000;

// --- Cloudinary (plain REST, no npm package) ---------------------------------
// If your other *Actions.ts files already share a Cloudinary helper, replace
// uploadToCloudinary / destroyFromCloudinary below with calls to it.

// Reads credentials from the *Convex deployment's* environment variables, not
// from .env.local (that file only feeds Next.js). Accepts either
// CLOUDINARY_URL or the separate variables, including the NEXT_PUBLIC_ names.
function cloudinaryEnv() {
  let cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  let apiKey =
    process.env.CLOUDINARY_API_KEY ??
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  // CLOUDINARY_URL looks like cloudinary://<api-key>:<api-secret>@<cloud-name>
  const rawUrl = process.env.CLOUDINARY_URL;
  if (rawUrl && (!cloudName || !apiKey || !apiSecret)) {
    const parsed = new URL(rawUrl);
    cloudName = cloudName || parsed.hostname;
    apiKey = apiKey || decodeURIComponent(parsed.username);
    apiSecret = apiSecret || decodeURIComponent(parsed.password);
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary isn't configured on this Convex deployment. Set CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET) with `npx convex env set`.",
    );
  }
  return { cloudName, apiKey, apiSecret };
}

// Cloudinary signature: sorted "key=value" pairs joined by "&", plus the secret, SHA-1.
function sign(params: Record<string, string | number>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");
}

async function uploadToCloudinary(dataUri: string) {
  const { cloudName, apiKey, apiSecret } = cloudinaryEnv();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "picture-talk";

  const body = new FormData();
  body.append("file", dataUri);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("folder", folder);
  body.append("signature", sign({ folder, timestamp }, apiSecret));

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body },
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Cloudinary upload failed.");
  }
  return {
    url: json.secure_url as string,
    publicId: json.public_id as string,
  };
}

async function destroyFromCloudinary(publicId: string) {
  const { cloudName, apiKey, apiSecret } = cloudinaryEnv();
  const timestamp = Math.floor(Date.now() / 1000);

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature: sign({ public_id: publicId, timestamp }, apiSecret),
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body },
  );
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error?.message ?? "Cloudinary delete failed.");
  }
}

// --- actions -----------------------------------------------------------------

/** Upload the image to Cloudinary, then save the card with the next number. */
export const addPicture = action({
  args: { title: v.string(), imageDataUri: v.string() },
  handler: async (
    ctx,
    { title, imageDataUri },
  ): Promise<{ id: Id<"pictureCards">; number: number }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("You must be signed in to add a picture.");

    const cleanTitle = title.trim();
    if (!cleanTitle) throw new Error("Give the picture a title.");
    if (cleanTitle.length > MAX_TITLE_LENGTH) {
      throw new Error(`Keep the title under ${MAX_TITLE_LENGTH} characters.`);
    }
    if (!imageDataUri.startsWith("data:image/")) {
      throw new Error("That file isn't an image.");
    }
    if (imageDataUri.length > MAX_DATA_URI_LENGTH) {
      throw new Error("That image is too large. Try a smaller one.");
    }

    const uploaded = await uploadToCloudinary(imageDataUri);

    try {
      return await ctx.runMutation(internal.picturesData.insertPicture, {
        clerkId: identity.subject,
        title: cleanTitle,
        url: uploaded.url,
        publicId: uploaded.publicId,
      });
    } catch (err) {
      // Don't leave an orphaned image behind if saving the card failed.
      await destroyFromCloudinary(uploaded.publicId).catch(() => undefined);
      throw err;
    }
  },
});

/** Remove the image from Cloudinary first, then delete the card row. */
export const deletePicture = action({
  args: { id: v.id("pictureCards") },
  handler: async (ctx, { id }): Promise<null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("You must be signed in.");

    const doc = await ctx.runQuery(internal.picturesData.getOwnedPicture, {
      id,
      clerkId: identity.subject,
    });
    if (!doc) throw new Error("Picture not found.");

    await destroyFromCloudinary(doc.image.publicId);
    await ctx.runMutation(internal.picturesData.deleteRow, { id });
    return null;
  },
});

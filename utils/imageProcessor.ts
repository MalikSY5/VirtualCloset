/**
 * imageProcessor.ts
 * ─────────────────────────────────────────────────────────────────
 * Utilities for processing clothing photos before storing them.
 *
 * STORAGE OPTIMIZATION STRATEGY
 * ──────────────────────────────
 * Full-resolution clothing photos (typically 3–12 MB from modern
 * smartphones) are far too large to store naively. Instead we:
 *
 *  1. COMPRESS TO WebP (~50 KB target)
 *     WebP achieves 25–34% better compression than JPEG at the
 *     same perceptual quality. We resize to a 400×400 thumbnail
 *     and export at 75% quality — landing around 40–60 KB per item.
 *     expo-image-manipulator handles the resize + format conversion.
 *
 *  2. REMOVE BACKGROUND
 *     Stripping the background (via the remove.bg API or a local
 *     ML model) reduces visual noise, keeps the wardrobe grid
 *     clean, and shaves another 10–15% off the file size because
 *     the transparent regions compress extremely well in WebP.
 *
 *  3. GENERATE THUMBNAIL
 *     A 100×100 micro-thumbnail is stored alongside the main image
 *     for use in the "Recently Added" strip on the Home screen —
 *     avoiding loading the full 400×400 image when only a 80×80
 *     preview is needed.
 *
 *  4. CDN STORAGE VIA SUPABASE
 *     Processed images are uploaded to Supabase Storage and served
 *     via their global CDN. Each wardrobe item therefore costs:
 *       • ~50 KB (main WebP) + ~5 KB (thumbnail) = ~55 KB
 *     A 100-piece wardrobe = ~5.5 MB stored — well within free tier.
 *     Supabase Storage URL pattern:
 *       https://<project>.supabase.co/storage/v1/object/public/wardrobe/<userId>/<itemId>.webp
 * ─────────────────────────────────────────────────────────────────
 */

import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

// ── Types ─────────────────────────────────────

export type ProcessedImage = {
  /** Local file URI of the processed WebP image (~50 KB) */
  uri: string;
  /** File size in bytes after compression */
  sizeBytes: number;
  /** Width in pixels (always 400 after compression) */
  width: number;
  /** Height in pixels (always 400 after compression) */
  height: number;
};

export type ProcessingResult = {
  main: ProcessedImage;
  thumbnail: ProcessedImage;
  /** Estimated saving vs original, e.g. "94%" */
  savingsPercent: string;
};

// ── Constants ─────────────────────────────────

const MAIN_SIZE = 400;        // px — main wardrobe card image
const THUMBNAIL_SIZE = 100;   // px — home screen strip / grid previews
const WEBP_QUALITY = 75;      // 0–100; 75 gives great quality at ~50 KB

// ── compressToWebP ────────────────────────────

/**
 * Compresses and converts a photo to WebP format.
 *
 * Steps:
 *  - Resize to MAIN_SIZE × MAIN_SIZE (cover crop)
 *  - Convert to WebP at WEBP_QUALITY
 *  - Returns a ProcessedImage with the local URI and file size
 *
 * @param sourceUri  - Local URI from expo-image-picker result
 * @returns          - ProcessedImage ready for upload or display
 *
 * @example
 * const result = await compressToWebP(pickerResult.assets[0].uri);
 * console.log(`Compressed to ${result.sizeBytes / 1024} KB`);
 */
export async function compressToWebP(sourceUri: string): Promise<ProcessedImage> {
  // TODO: Implement background removal before compression (see removeBackground).
  // For now we compress the original image directly.

  const manipResult = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: MAIN_SIZE, height: MAIN_SIZE } }],
    {
      compress: WEBP_QUALITY / 100,
      format: ImageManipulator.SaveFormat.WEBP,
    }
  );

  // Read file info to get actual size on disk
  const fileInfo = await FileSystem.getInfoAsync(manipResult.uri, { size: true });
  const sizeBytes = (fileInfo as FileSystem.FileInfo & { size?: number }).size ?? 0;

  return {
    uri: manipResult.uri,
    sizeBytes,
    width: MAIN_SIZE,
    height: MAIN_SIZE,
  };
}

// ── removeBackground ──────────────────────────

/**
 * Removes the background from a clothing photo, leaving only
 * the garment on a transparent canvas.
 *
 * Integration options (choose one based on budget/quality needs):
 *
 *  A. remove.bg API (recommended for production)
 *     - POST https://api.remove.bg/v1.0/removebg
 *     - ~$0.002 / image after free tier
 *     - Returns a high-quality alpha-matted PNG
 *
 *  B. @tensorflow/tfjs + bodyPix (on-device, free)
 *     - Runs locally — no API cost, works offline
 *     - Lower quality on complex backgrounds
 *
 *  C. Supabase Edge Function wrapping remove.bg
 *     - Keeps API key server-side (more secure)
 *     - Returns processed image URL directly in Supabase Storage
 *
 * @param sourceUri  - Local URI of the original or compressed image
 * @returns          - URI of the background-removed image (PNG with alpha)
 *
 * @stub This function is a stub. Wire up one of the options above.
 */
export async function removeBackground(sourceUri: string): Promise<string> {
  // ── STUB ──────────────────────────────────────────────────────
  // TODO: Call remove.bg or on-device ML model here.
  //
  // Example with remove.bg:
  //
  //   const formData = new FormData();
  //   formData.append("image_file", { uri: sourceUri, type: "image/webp", name: "image.webp" } as any);
  //   formData.append("size", "preview");   // "preview" = free tier (0.25 MP)
  //
  //   const res = await fetch("https://api.remove.bg/v1.0/removebg", {
  //     method: "POST",
  //     headers: { "X-Api-Key": process.env.REMOVE_BG_API_KEY! },
  //     body: formData,
  //   });
  //   const blob = await res.blob();
  //   const localUri = FileSystem.cacheDirectory + "bg_removed.png";
  //   // Write blob to local cache and return URI...
  //
  // ─────────────────────────────────────────────────────────────

  console.warn("removeBackground: stub not yet implemented. Returning original URI.");
  return sourceUri;
}

// ── generateThumbnail ─────────────────────────

/**
 * Generates a small 100×100 thumbnail for use in the
 * Home screen "Recently Added" strip and anywhere a
 * micro-preview is needed.
 *
 * Keeping this separate avoids loading the full 400 px image
 * when only an 80 px slot is displayed — a ~20× bandwidth saving
 * for list/grid views with many items.
 *
 * @param sourceUri  - URI of the already-compressed main image
 * @returns          - ProcessedImage at THUMBNAIL_SIZE resolution (~5 KB)
 *
 * @example
 * const thumb = await generateThumbnail(mainImage.uri);
 * <Image source={{ uri: thumb.uri }} style={{ width: 80, height: 80 }} />
 */
export async function generateThumbnail(sourceUri: string): Promise<ProcessedImage> {
  const manipResult = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE } }],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.WEBP,
    }
  );

  const fileInfo = await FileSystem.getInfoAsync(manipResult.uri, { size: true });
  const sizeBytes = (fileInfo as FileSystem.FileInfo & { size?: number }).size ?? 0;

  return {
    uri: manipResult.uri,
    sizeBytes,
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  };
}

// ── Full Pipeline ─────────────────────────────

/**
 * Convenience function that runs the entire processing pipeline:
 *   1. Remove background
 *   2. Compress to WebP main image
 *   3. Generate thumbnail
 *
 * Call this from the ClosetScreen's "Add Item" flow after
 * the user selects or captures a photo.
 *
 * @param sourceUri  - Raw URI from expo-image-picker
 * @returns          - ProcessingResult with main + thumbnail images
 *
 * @example
 * const { main, thumbnail, savingsPercent } = await processClothingPhoto(uri);
 * console.log(`Saved ${savingsPercent} vs original`);
 * await uploadToSupabase(main.uri, thumbnail.uri, userId, itemId);
 */
export async function processClothingPhoto(sourceUri: string): Promise<ProcessingResult> {
  // Step 1: background removal (stub — returns original until implemented)
  const bgRemovedUri = await removeBackground(sourceUri);

  // Step 2: compress main image
  const main = await compressToWebP(bgRemovedUri);

  // Step 3: generate thumbnail from compressed main
  const thumbnail = await generateThumbnail(main.uri);

  // Calculate original size for savings report
  const originalInfo = await FileSystem.getInfoAsync(sourceUri, { size: true });
  const originalSize = (originalInfo as FileSystem.FileInfo & { size?: number }).size ?? 1;
  const savings = Math.round(((originalSize - main.sizeBytes) / originalSize) * 100);

  return {
    main,
    thumbnail,
    savingsPercent: `${savings}%`,
  };
}

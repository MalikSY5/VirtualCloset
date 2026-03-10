import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../supabase/supabaseClient';

// ─────────────────────────────────────────
// STORAGE STRATEGY
//
// Goal: Store 1,000 users × 100 items = 100,000 images
// cheaply and fast.
//
// Pipeline:
//   1. User picks photo (raw ~3–8MB JPEG from camera)
//   2. compressAndResize()  → ~50–80KB JPEG thumbnail (max 400×400px)
//   3. removeBackground()   → clean product-style image (via remove.bg API)
//   4. uploadThumbnail()    → Supabase Storage (public CDN bucket)
//   5. Save CDN URL to DB   → served globally via Supabase CDN
//
// Cost estimate:
//   100,000 images × 60KB avg = ~6GB storage
//   Supabase Storage: $0.021/GB = ~$0.13/month 🎉
// ─────────────────────────────────────────

const THUMBNAIL_SIZE   = 400;   // max width/height in pixels
const JPEG_QUALITY     = 0.72;  // 0–1, sweet spot for size vs quality
const MAX_FILE_SIZE_KB = 200;   // hard cap — re-compress if exceeded

// ─────────────────────────────────────────
// STEP 1: COMPRESS & RESIZE
// Uses expo-image-manipulator (no native modules needed)
// Input:  local URI from expo-image-picker
// Output: smaller local URI ready for upload
// ─────────────────────────────────────────
export async function compressAndResize(localUri) {
  try {
    const result = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE } }],
      {
        compress: JPEG_QUALITY,
        format:   ImageManipulator.SaveFormat.JPEG,
        base64:   false,
      }
    );

    // Verify file size — re-compress harder if over limit
    const fileInfo = await FileSystem.getInfoAsync(result.uri, { size: true });
    const fileSizeKB = (fileInfo.size ?? 0) / 1024;

    if (fileSizeKB > MAX_FILE_SIZE_KB) {
      console.log(`Image ${fileSizeKB.toFixed(0)}KB > ${MAX_FILE_SIZE_KB}KB limit, re-compressing...`);
      const recompressed = await ImageManipulator.manipulateAsync(
        result.uri,
        [],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      return recompressed.uri;
    }

    console.log(`✅ Compressed to ${fileSizeKB.toFixed(0)}KB`);
    return result.uri;

  } catch (err) {
    throw new Error(`Image compression failed: ${err.message}`);
  }
}

// ─────────────────────────────────────────
// STEP 2: REMOVE BACKGROUND (optional but recommended)
// Uses remove.bg API — $0.20 per image on free tier,
// or ~$0.002 per image on paid ($24.99/month for 12,500 calls)
//
// Alternative (self-hosted, free): run Rembg as a Supabase Edge Function
// See: https://github.com/danielgatis/rembg
//
// Set EXPO_PUBLIC_REMOVEBG_API_KEY in your .env
// ─────────────────────────────────────────
export async function removeBackground(localUri) {
  const apiKey = process.env.EXPO_PUBLIC_REMOVEBG_API_KEY;

  if (!apiKey) {
    // Background removal not configured — skip silently
    console.log('ℹ️  No REMOVEBG_API_KEY set, skipping background removal');
    return localUri;
  }

  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Call remove.bg
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key':    apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: base64,
        size:           'preview',   // 'preview' = free tier, ~500px output
        format:         'png',
        bg_color:       'ffffff',    // White bg keeps file size small vs transparent PNG
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.errors?.[0]?.title ?? 'remove.bg error');
    }

    // Save result to a local temp file
    const arrayBuffer = await response.arrayBuffer();
    const base64Result = Buffer.from(arrayBuffer).toString('base64');
    const outputUri = `${FileSystem.cacheDirectory}rmbg_${Date.now()}.png`;

    await FileSystem.writeAsStringAsync(outputUri, base64Result, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('✅ Background removed');
    return outputUri;

  } catch (err) {
    // Don't block the upload if bg removal fails — just use original
    console.warn(`Background removal failed (using original): ${err.message}`);
    return localUri;
  }
}

// ─────────────────────────────────────────
// STEP 3: UPLOAD TO SUPABASE STORAGE
// Path structure: {userId}/thumbnails/{itemId}.jpg
// Returns: { thumbnailPath, thumbnailUrl }
// ─────────────────────────────────────────
export async function uploadThumbnail(localUri, itemId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const storagePath = `${user.id}/thumbnails/${itemId}.jpg`;

  // Read file as base64
  const fileContent = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Decode base64 to ArrayBuffer for Supabase upload
  const binaryStr = atob(fileContent);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const { error: uploadError } = await supabase.storage
    .from('clothing-thumbnails')
    .upload(storagePath, bytes.buffer, {
      contentType: 'image/jpeg',
      upsert:      true,             // Overwrite if item is being re-uploaded
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  // Get public CDN URL
  const { data: { publicUrl } } = supabase.storage
    .from('clothing-thumbnails')
    .getPublicUrl(storagePath);

  console.log(`✅ Uploaded to ${storagePath}`);
  return {
    thumbnailPath: storagePath,
    thumbnailUrl:  publicUrl,
  };
}

// ─────────────────────────────────────────
// FULL PIPELINE
// Call this from your AddItemScreen
//
// Usage:
//   const { thumbnailPath, thumbnailUrl } = await processAndUploadImage(
//     pickerResult.assets[0].uri,
//     newItemId
//   );
// ─────────────────────────────────────────
export async function processAndUploadImage(localUri, itemId, { onProgress } = {}) {
  onProgress?.('Compressing image...');        // 1/3
  const compressed = await compressAndResize(localUri);

  onProgress?.('Removing background...');      // 2/3
  const cleaned = await removeBackground(compressed);

  onProgress?.('Uploading to your closet...'); // 3/3
  const result = await uploadThumbnail(cleaned, itemId);

  // Clean up temp files from cache
  try {
    await FileSystem.deleteAsync(compressed, { idempotent: true });
    if (cleaned !== compressed) {
      await FileSystem.deleteAsync(cleaned, { idempotent: true });
    }
  } catch {
    // Non-critical, ignore cleanup errors
  }

  return result;
}

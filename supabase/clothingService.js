import { supabase } from './supabaseClient';

// ─────────────────────────────────────────
// FETCH ALL CLOTHING ITEMS FOR CURRENT USER
// ─────────────────────────────────────────
export async function getClothingItems({ category = null } = {}) {
  let query = supabase
    .from('clothing_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// ADD A CLOTHING ITEM
// Call this AFTER imageService.uploadThumbnail()
// returns the thumbnail_path and thumbnail_url
// ─────────────────────────────────────────
export async function addClothingItem({
  name,
  category,
  colorHex,
  tags = [],
  thumbnailPath,
  thumbnailUrl,
  detectedType,
  detectedColor,
  styleNotes,
}) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('clothing_items')
    .insert({
      user_id:        user.id,
      name,
      category,
      color_hex:      colorHex,
      tags,
      thumbnail_path: thumbnailPath,
      thumbnail_url:  thumbnailUrl,
      detected_type:  detectedType,
      detected_color: detectedColor,
      style_notes:    styleNotes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// UPDATE A CLOTHING ITEM
// ─────────────────────────────────────────
export async function updateClothingItem(id, updates) {
  const { data, error } = await supabase
    .from('clothing_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// DELETE A CLOTHING ITEM
// Also deletes the thumbnail from storage
// ─────────────────────────────────────────
export async function deleteClothingItem(id) {
  // Fetch item first to get the storage path
  const { data: item, error: fetchError } = await supabase
    .from('clothing_items')
    .select('thumbnail_path')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Delete from storage
  if (item?.thumbnail_path) {
    const { error: storageError } = await supabase.storage
      .from('clothing-thumbnails')
      .remove([item.thumbnail_path]);
    if (storageError) console.warn('Storage delete failed:', storageError.message);
  }

  // Delete DB row
  const { error } = await supabase
    .from('clothing_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─────────────────────────────────────────
// INCREMENT TIMES WORN
// ─────────────────────────────────────────
export async function markItemWorn(id) {
  const { error } = await supabase.rpc('increment_times_worn', { item_id: id });
  if (error) {
    // Fallback if RPC not set up
    const { data: item } = await supabase
      .from('clothing_items')
      .select('times_worn')
      .eq('id', id)
      .single();

    await supabase
      .from('clothing_items')
      .update({ times_worn: (item?.times_worn ?? 0) + 1, last_worn_at: new Date().toISOString() })
      .eq('id', id);
  }
}

// ─────────────────────────────────────────
// SAVE AN OUTFIT
// ─────────────────────────────────────────
export async function saveOutfit({ name, occasion, itemIds, aiCaption }) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('outfits')
    .insert({
      user_id:    user.id,
      name,
      occasion,
      item_ids:   itemIds,
      ai_caption: aiCaption,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// GET SAVED OUTFITS
// ─────────────────────────────────────────
export async function getSavedOutfits({ occasion = null } = {}) {
  let query = supabase
    .from('outfits')
    .select('*')
    .order('created_at', { ascending: false });

  if (occasion) query = query.eq('occasion', occasion);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

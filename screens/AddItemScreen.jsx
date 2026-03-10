import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, TextInput, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { processAndUploadImage } from '../services/imageService';
import { addClothingItem } from '../supabase/clothingService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];
const OCCASIONS  = ['work', 'date night', 'movies', 'casual'];

export default function AddItemScreen({ navigation }) {
  const [localUri,  setLocalUri]  = useState(null);
  const [name,      setName]      = useState('');
  const [category,  setCategory]  = useState('Tops');
  const [tags,      setTags]      = useState([]);
  const [progress,  setProgress]  = useState('');
  const [uploading, setUploading] = useState(false);

  // ── Pick photo from camera or library ──────────────────────
  const pickImage = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access in your phone settings.');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: true, aspect: [1, 1] });

    if (!result.canceled) {
      setLocalUri(result.assets[0].uri);
    }
  };

  const toggleTag = (tag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // ── Save item — runs the full pipeline ─────────────────────
  const handleSave = async () => {
    if (!localUri) return Alert.alert('No photo', 'Take or pick a photo first!');
    if (!category) return Alert.alert('Pick a category', 'Select where this item lives.');

    setUploading(true);
    try {
      const itemId = uuidv4();

      // 1. Compress → remove bg → upload
      const { thumbnailPath, thumbnailUrl } = await processAndUploadImage(
        localUri,
        itemId,
        { onProgress: setProgress }
      );

      // 2. Save metadata to DB
      setProgress('Saving to your closet...');
      await addClothingItem({
        name:         name.trim() || category,
        category,
        tags,
        thumbnailPath,
        thumbnailUrl,
      });

      Alert.alert('✨ Added!', `${name || category} is in your closet.`);
      navigation.goBack();

    } catch (err) {
      Alert.alert('Oops!', err.message);
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff8fe' }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add to Closet</Text>
        <Text style={styles.subtitle}>"As if you don't need this in your life"</Text>

        {/* ── Photo Preview / Picker ── */}
        <View style={styles.photoContainer}>
          {localUri ? (
            <Image source={{ uri: localUri }} style={styles.preview} contentFit="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>📸</Text>
              <Text style={styles.placeholderText}>No photo yet</Text>
            </View>
          )}
        </View>

        <View style={styles.photoButtons}>
          <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)}>
            <Text style={styles.photoBtnText}>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.photoBtn, styles.photoBtnOutline]} onPress={() => pickImage(false)}>
            <Text style={[styles.photoBtnText, styles.photoBtnTextOutline]}>🖼️ Library</Text>
          </TouchableOpacity>
        </View>

        {/* ── Name ── */}
        <Text style={styles.label}>Name (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder='"e.g. "Plaid Blazer"'
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />

        {/* ── Category ── */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.pill, category === cat && styles.pillActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Occasion Tags ── */}
        <Text style={styles.label}>Occasion Tags</Text>
        <View style={styles.tagGrid}>
          {OCCASIONS.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, tags.includes(tag) && styles.tagActive]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[styles.tagText, tags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Storage note ── */}
        <View style={styles.storageNote}>
          <Text style={styles.storageNoteText}>
            🌸 Your photo will be compressed to ~50KB and background-removed before storing. No storage bloat!
          </Text>
        </View>

        {/* ── Save Button ── */}
        <TouchableOpacity
          style={[styles.saveBtn, uploading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.saveBtnInner}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.saveBtnText}>{progress || 'Processing...'}</Text>
            </View>
          ) : (
            <Text style={styles.saveBtnText}>✨ Add to My Closet</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#fff8fe' },
  content:             { padding: 24, paddingBottom: 48 },
  title:               { fontSize: 28, fontWeight: '700', color: '#1e1b4b', letterSpacing: -0.5 },
  subtitle:            { fontSize: 14, color: '#94a3b8', fontStyle: 'italic', marginTop: 4, marginBottom: 24 },

  photoContainer:      { borderRadius: 20, overflow: 'hidden', backgroundColor: '#fdf2f8', height: 240, marginBottom: 12 },
  preview:             { width: '100%', height: '100%' },
  placeholder:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  placeholderIcon:     { fontSize: 48 },
  placeholderText:     { fontSize: 14, color: '#94a3b8' },

  photoButtons:        { flexDirection: 'row', gap: 10, marginBottom: 24 },
  photoBtn:            { flex: 1, backgroundColor: '#ec4899', borderRadius: 100, padding: 12, alignItems: 'center' },
  photoBtnOutline:     { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#ec4899' },
  photoBtnText:        { color: 'white', fontWeight: '700', fontSize: 13 },
  photoBtnTextOutline: { color: '#ec4899' },

  label:               { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' },
  input:               { backgroundColor: 'white', borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.07)', color: '#1e1b4b', marginBottom: 24 },

  pillRow:             { marginBottom: 24 },
  pill:                { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: 'white', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)', marginRight: 8 },
  pillActive:          { backgroundColor: '#ec4899', borderColor: '#ec4899' },
  pillText:            { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  pillTextActive:      { color: 'white' },

  tagGrid:             { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag:                 { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: 'white', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)' },
  tagActive:           { backgroundColor: '#f5f3ff', borderColor: '#8b5cf6' },
  tagText:             { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  tagTextActive:       { color: '#8b5cf6' },

  storageNote:         { backgroundColor: '#fdf2f8', borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(236,72,153,0.15)' },
  storageNoteText:     { fontSize: 12, color: '#9d174d', lineHeight: 18 },

  saveBtn:             { backgroundColor: '#ec4899', borderRadius: 100, padding: 16, alignItems: 'center', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  saveBtnDisabled:     { opacity: 0.7 },
  saveBtnInner:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  saveBtnText:         { color: 'white', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
});

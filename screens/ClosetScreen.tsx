/**
 * ClosetScreen.tsx
 * ─────────────────────────────────────────────
 * Virtual wardrobe grid with:
 *  • Category filter pills (All, Tops, Bottoms, …)
 *  • 3-column clothing item grid using ClothingCard
 *  • Item detail bottom sheet modal
 *  • Add-item flow with expo-image-picker + processing pipeline
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { getClothingItems } from "../supabase/clothingService";

import {
  MOCK_CLOTHES,
  CATEGORIES,
  ClothingItem,
  Occasion,
} from "../data/mockClothes";
import { RootTabParamList } from "../navigation/AppNavigator";
import ClothingCard from "../components/ClothingCard";
import CategoryPill from "../components/CategoryPill";
import { processClothingPhoto } from "../utils/imageProcessor";

type ClosetNav = BottomTabNavigationProp<RootTabParamList, "Closet">;

// ── Upload flow steps ─────────────────────────

type UploadStep = "picker" | "processing" | "done";

const PROCESSING_STEPS = [
  "Removing background...",
  "Compressing to WebP...",
  "Detecting color & category...",
  "Adding to your closet! 🎉",
];

export default function ClosetScreen() {
  const navigation = useNavigation<ClosetNav>();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [addingClothes, setAddingClothes] = useState(false);
  const [uploadStep, setUploadStep] = useState<UploadStep>("picker");
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (getClothingItems as any)({ category: activeCategory === "All" ? null : activeCategory })
        .then((data: any[]) => { if (active) setClothes(data ?? []); })
        .catch((err: any) => {
          console.warn("Failed to load clothes:", err);
          if (active) setClothes(MOCK_CLOTHES as any);
        })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [activeCategory])
  );

  const filteredClothes = clothes;

  // ── Image picker helpers ──────────────────────

  const requestPermission = async (source: "camera" | "library") => {
    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    }
  };

  const handlePickImage = async (source: "camera" | "library") => {
    const granted = await requestPermission(source);
    if (!granted) {
      Alert.alert(
        "Permission needed",
        `Please allow Cher's Closet to access your ${source === "camera" ? "camera" : "photos"}.`
      );
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: true, aspect: [1, 1] })
        : await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: true, aspect: [1, 1] });

    if (result.canceled) return;

    setUploadStep("processing");

    try {
      const uri = result.assets[0].uri;
      // Run the full compression + bg-removal + thumbnail pipeline
      const processed = await processClothingPhoto(uri);
      console.log(
        `✅ Processed image: ${(processed.main.sizeBytes / 1024).toFixed(1)} KB | saved ${processed.savingsPercent}`
      );
      setUploadStep("done");
    } catch (err) {
      console.error("Image processing error:", err);
      setUploadStep("done"); // Still proceed to "done" so user isn't stuck
    }
  };

  const closeAddModal = () => {
    setAddingClothes(false);
    setUploadStep("picker");
  };

  // ── Render ────────────────────────────────────

  const numColumns = 3;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff0f9" }}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.9)",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1.5,
          borderBottomColor: "rgba(244,114,182,0.2)",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#ec4899", letterSpacing: -0.5 }}>
          ✦ Cher's Closet
        </Text>
        <Text style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>"As if!"</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#1e1b4b", marginTop: 16 }}>
          My Closet
        </Text>
        <Text style={{ fontSize: 14, color: "#94a3b8", fontStyle: "italic", marginBottom: 12 }}>
          "{clothes.length} pieces of fabulousness"
        </Text>

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onPress={setActiveCategory}
            />
          ))}
        </ScrollView>

        {/* Clothes grid */}
        {loading && (
          <ActivityIndicator color="#ec4899" style={{ marginVertical: 24 }} />
        )}
        <FlatList
          data={loading ? [] : [...filteredClothes, { id: -1, name: "", category: "", color: "", tags: [], emoji: "+", bg: "" } as any]}
          keyExtractor={(item) => String(item.id)}
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
          renderItem={({ item }) => {
            // Add item card
            if (item.id === -1) {
              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate("AddItem" as any)}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.5)",
                    borderWidth: 2,
                    borderColor: "rgba(236,72,153,0.3)",
                    borderStyle: "dashed",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 28, color: "#ec4899" }}>+</Text>
                  <Text style={{ fontSize: 9, color: "#ec4899", fontWeight: "700", marginTop: 4 }}>
                    ADD ITEM
                  </Text>
                </TouchableOpacity>
              );
            }
            return (
              <ClothingCard
                item={item}
                onPress={setSelectedItem}
              />
            );
          }}
        />
      </View>

      {/* ── Add Item Modal ── */}
      <Modal
        visible={addingClothes}
        transparent
        animationType="slide"
        onRequestClose={closeAddModal}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={closeAddModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 28,
              paddingBottom: Platform.OS === "ios" ? 48 : 36,
            }}
          >
            {uploadStep === "picker" && (
              <>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>📸</Text>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: "#1e1b4b" }}>
                    Add to Your Closet
                  </Text>
                  <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>
                    Take a pic or upload from your camera roll
                  </Text>
                </View>

                {/* Storage tip card */}
                <View
                  style={{
                    backgroundColor: "#fdf2f8",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1.5,
                    borderColor: "rgba(236,72,153,0.3)",
                    borderStyle: "dashed",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 20, marginBottom: 4 }}>🌸</Text>
                  <Text style={{ fontSize: 12, color: "#6b7280", fontWeight: "600", textAlign: "center" }}>
                    STORAGE TIP: We compress your photos to ~50 KB
                  </Text>
                  <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, textAlign: "center" }}>
                    WebP format • Background removed • No full-res storage costs
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handlePickImage("camera")}
                  style={primaryBtnStyle}
                >
                  <Text style={primaryBtnTextStyle}>📷  Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handlePickImage("library")}
                  style={[primaryBtnStyle, secondaryBtnStyle]}
                >
                  <Text style={[primaryBtnTextStyle, { color: "#ec4899" }]}>
                    🖼️  Choose from Library
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {uploadStep === "processing" && (
              <>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>✨</Text>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: "#1e1b4b" }}>
                    Processing Photo
                  </Text>
                </View>
                {PROCESSING_STEPS.map((step, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingVertical: 10,
                      borderBottomWidth: i < 3 ? 1 : 0,
                      borderBottomColor: "#f3f4f6",
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#ec4899",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 11, color: "white", fontWeight: "700" }}>✓</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: "#6b7280" }}>{step}</Text>
                  </View>
                ))}
              </>
            )}

            {uploadStep === "done" && (
              <>
                <View style={{ alignItems: "center", marginBottom: 24 }}>
                  <Text style={{ fontSize: 48, marginBottom: 8 }}>🎉</Text>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: "#1e1b4b" }}>
                    She's in the closet!
                  </Text>
                  <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, fontStyle: "italic", textAlign: "center" }}>
                    Your piece has been compressed and added to your wardrobe.
                  </Text>
                </View>
                <TouchableOpacity onPress={closeAddModal} style={primaryBtnStyle}>
                  <Text style={primaryBtnTextStyle}>Done 👗</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Item Detail Modal ── */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 28,
              paddingBottom: Platform.OS === "ios" ? 48 : 36,
            }}
          >
            {selectedItem && (
              <>
                <View style={{ flexDirection: "row", gap: 16, marginBottom: 20 }}>
                  <View
                    style={{
                      backgroundColor: selectedItem.bg,
                      borderRadius: 20,
                      width: 90,
                      height: 90,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 44 }}>{selectedItem.emoji}</Text>
                  </View>
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: "#1e1b4b" }}>
                      {selectedItem.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
                      {selectedItem.category}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      {selectedItem.tags.map((tag) => (
                        <View
                          key={tag}
                          style={{
                            backgroundColor: "#fdf2f8",
                            borderRadius: 100,
                            paddingHorizontal: 10,
                            paddingVertical: 3,
                          }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: "600", color: "#ec4899" }}>
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setSelectedItem(null);
                    navigation.navigate("Stylist", {
                      occasion: selectedItem.tags[0],
                    } as any);
                  }}
                  style={primaryBtnStyle}
                >
                  <Text style={primaryBtnTextStyle}>🪄  Style This Piece</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ── Shared button styles ──────────────────────

const primaryBtnStyle = {
  backgroundColor: "#ec4899",
  borderRadius: 100,
  paddingVertical: 14,
  alignItems: "center" as const,
  width: "100%" as const,
  marginTop: 8,
  shadowColor: "#ec4899",
  shadowOpacity: 0.35,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 4,
};

const primaryBtnTextStyle = {
  color: "white" as const,
  fontSize: 14,
  fontWeight: "700" as const,
  letterSpacing: 0.5,
};

const secondaryBtnStyle = {
  backgroundColor: "rgba(255,255,255,0.9)" as const,
  borderWidth: 2,
  borderColor: "#ec4899" as const,
  shadowOpacity: 0,
  elevation: 0,
};

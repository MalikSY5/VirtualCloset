/**
 * OutfitReveal.tsx
 * Shows Cher's AI-generated outfit recommendation:
 * a row of clothing item cards + a styled caption card.
 */
import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { AiOutfit, MOCK_CLOTHES } from "../data/mockClothes";
import ClothingCard from "./ClothingCard";

type Props = {
  outfit: AiOutfit | null;
  isGenerating: boolean;
  onSave?: () => void;
};

export default function OutfitReveal({ outfit, isGenerating, onSave }: Props) {
  if (isGenerating) {
    return (
      <View
        style={{
          backgroundColor: "rgba(253,242,248,0.9)",
          borderRadius: 24,
          padding: 32,
          alignItems: "center",
          borderWidth: 1.5,
          borderColor: "rgba(244,114,182,0.2)",
          marginTop: 12,
        }}
      >
        <Text style={{ fontSize: 32, marginBottom: 12 }}>✨</Text>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e1b4b" }}>
          Cher is styling you...
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#94a3b8",
            marginTop: 4,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          "Okay, I need to find something to wear."
        </Text>
        <ActivityIndicator color="#ec4899" style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (!outfit) {
    return (
      <View style={{ alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>👆</Text>
        <Text style={{ fontSize: 14, fontStyle: "italic", color: "#94a3b8", textAlign: "center" }}>
          Pick an occasion above and I'll style you!
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: "rgba(253,242,248,0.7)",
        borderRadius: 24,
        padding: 20,
        borderWidth: 1.5,
        borderColor: "rgba(244,114,182,0.2)",
        marginTop: 12,
      }}
    >
      {/* Header */}
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 2,
          color: "#ec4899",
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        Cher Recommends ✨
      </Text>

      {/* Outfit items row */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {outfit.items.map((id) => {
          const item = MOCK_CLOTHES.find((c) => c.id === id);
          return item ? (
            <View key={id} style={{ flex: 1 }}>
              <ClothingCard item={item} onPress={() => {}} size={72} />
            </View>
          ) : null;
        })}
      </View>

      {/* Caption card */}
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.7)",
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: "rgba(236,72,153,0.1)",
        }}
      >
        <Text style={{ fontSize: 14, color: "#1e1b4b", lineHeight: 22, fontStyle: "italic" }}>
          "{outfit.caption}"
        </Text>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: "#ec4899",
            marginTop: 8,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Cher's Verdict: {outfit.rating}
        </Text>
      </View>

      {/* Save button */}
      <TouchableOpacity
        onPress={onSave}
        activeOpacity={0.85}
        style={{
          backgroundColor: "#ec4899",
          borderRadius: 100,
          paddingVertical: 14,
          alignItems: "center",
          marginTop: 12,
          shadowColor: "#ec4899",
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700", fontSize: 14, letterSpacing: 0.5 }}>
          💾  Save This Outfit
        </Text>
      </TouchableOpacity>
    </View>
  );
}

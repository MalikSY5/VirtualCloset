/**
 * ClothingCard.tsx
 * Displays a single clothing item in the closet grid.
 */
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { ClothingItem } from "../data/mockClothes";

type Props = {
  item: ClothingItem;
  onPress: (item: ClothingItem) => void;
  size?: number;
};

export default function ClothingCard({ item, onPress, size = 105 }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.75}
      style={{
        width: size,
        height: size,
        backgroundColor: item.bg,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "rgba(0,0,0,0.05)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Text style={{ fontSize: size * 0.34 }}>{item.emoji}</Text>
      <Text
        numberOfLines={1}
        style={{
          fontSize: 9,
          color: "#6b7280",
          fontWeight: "700",
          letterSpacing: 0.3,
          textAlign: "center",
          paddingHorizontal: 4,
          marginTop: 4,
        }}
      >
        {item.name.toUpperCase()}
      </Text>

      {/* Color swatch dot */}
      <View
        style={{
          position: "absolute",
          bottom: 6,
          right: 6,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: item.color,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.8)",
        }}
      />
    </TouchableOpacity>
  );
}

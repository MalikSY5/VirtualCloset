/**
 * OccasionCard.tsx
 * Tappable card for selecting an occasion (Work, Date Night, etc.)
 * Used on the Home and Stylist screens.
 */
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { OccasionConfig } from "../data/mockClothes";

type Props = {
  occasion: OccasionConfig;
  selected: boolean;
  onPress: (id: string) => void;
};

export default function OccasionCard({ occasion, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onPress(occasion.id)}
      activeOpacity={0.8}
      style={{
        flex: 1,
        backgroundColor: selected ? occasion.color : "rgba(255,255,255,0.9)",
        borderWidth: 2,
        borderColor: selected ? occasion.color : "rgba(0,0,0,0.06)",
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 14,
        alignItems: "center",
        // Elevated shadow when selected
        shadowColor: occasion.color,
        shadowOpacity: selected ? 0.3 : 0.04,
        shadowRadius: selected ? 12 : 4,
        shadowOffset: { width: 0, height: selected ? 8 : 2 },
        elevation: selected ? 6 : 1,
      }}
    >
      <Text style={{ fontSize: 28, marginBottom: 6 }}>{occasion.icon}</Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: selected ? "white" : "#1e1b4b",
          textAlign: "center",
        }}
      >
        {occasion.label}
      </Text>
    </TouchableOpacity>
  );
}

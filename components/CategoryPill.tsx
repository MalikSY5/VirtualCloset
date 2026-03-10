/**
 * CategoryPill.tsx
 * Horizontal scrollable filter pill for the Closet screen.
 * Active pill gets the pink→purple gradient; inactive is muted white.
 */
import React from "react";
import { TouchableOpacity, Text } from "react-native";

type Props = {
  label: string;
  active: boolean;
  onPress: (label: string) => void;
};

export default function CategoryPill({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onPress(label)}
      activeOpacity={0.75}
      style={{
        paddingVertical: 7,
        paddingHorizontal: 16,
        borderRadius: 100,
        backgroundColor: active ? "#ec4899" : "rgba(255,255,255,0.9)",
        borderWidth: active ? 0 : 1.5,
        borderColor: "rgba(0,0,0,0.08)",
        marginRight: 8,
        // Gradient shadow when active
        shadowColor: active ? "#ec4899" : "transparent",
        shadowOpacity: active ? 0.3 : 0,
        shadowRadius: active ? 8 : 0,
        shadowOffset: { width: 0, height: 4 },
        elevation: active ? 3 : 0,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: 0.5,
          color: active ? "white" : "#6b7280",
          whiteSpace: "nowrap",
        } as any}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

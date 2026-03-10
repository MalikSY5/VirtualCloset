/**
 * ChatBubble.tsx
 * Single message bubble for the Ask Cher chat screen.
 * Cher's bubbles appear on the left with gradient background;
 * user's appear on the right with white background.
 */
import React from "react";
import { View, Text } from "react-native";

type Props = {
  role: "cher" | "user";
  text: string;
};

export default function ChatBubble({ role, text }: Props) {
  const isCher = role === "cher";

  return (
    <View
      style={{
        flexDirection: isCher ? "row" : "row-reverse",
        alignItems: "flex-end",
        gap: 8,
        marginVertical: 4,
      }}
    >
      {/* Avatar — only shown for Cher */}
      {isCher && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#ec4899",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 16 }}>👱‍♀️</Text>
        </View>
      )}

      {/* Bubble */}
      <View
        style={{
          maxWidth: "78%",
          backgroundColor: isCher ? "#ec4899" : "rgba(255,255,255,0.95)",
          borderRadius: isCher ? 20 : 20,
          borderBottomLeftRadius: isCher ? 4 : 20,
          borderBottomRightRadius: isCher ? 20 : 4,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: isCher ? 0 : 1.5,
          borderColor: "rgba(0,0,0,0.06)",
          // Shadow
          shadowColor: isCher ? "#ec4899" : "#000",
          shadowOpacity: isCher ? 0.25 : 0.06,
          shadowRadius: isCher ? 8 : 4,
          shadowOffset: { width: 0, height: isCher ? 4 : 2 },
          elevation: isCher ? 3 : 1,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            lineHeight: 21,
            color: isCher ? "white" : "#1e1b4b",
          }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

// ── Typing indicator variant ──────────────────

export function TypingIndicator() {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginVertical: 4 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#ec4899",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 16 }}>👱‍♀️</Text>
      </View>
      <View
        style={{
          backgroundColor: "#ec4899",
          borderRadius: 20,
          borderBottomLeftRadius: 4,
          paddingHorizontal: 18,
          paddingVertical: 14,
          flexDirection: "row",
          gap: 4,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
          />
        ))}
      </View>
    </View>
  );
}

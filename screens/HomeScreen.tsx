/**
 * HomeScreen.tsx
 * ─────────────────────────────────────────────
 * Dashboard screen showing:
 *  • Closet stats (pieces, outfits, utilization)
 *  • Quick occasion buttons → navigates to Stylist
 *  • Recently added items horizontal strip
 */
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { MOCK_CLOTHES, OCCASIONS } from "../data/mockClothes";
import { RootTabParamList } from "../navigation/AppNavigator";
import OccasionCard from "../components/OccasionCard";

type HomeNav = BottomTabNavigationProp<RootTabParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const handleOccasionPress = (id: string) => {
    setSelectedOccasion(id);
    // Navigate to Stylist and pass the chosen occasion via route params
    navigation.navigate("Stylist", { occasion: id } as any);
  };

  const stats = [
    { value: MOCK_CLOTHES.length, label: "Pieces" },
    { value: 4, label: "Outfits" },
    { value: "94%", label: "Utilization" },
  ];

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
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: "#ec4899",
            letterSpacing: -0.5,
          }}
        >
          ✦ Cher's Closet
        </Text>
        <Text style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
          "As if!"
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ── */}
        <Text
          style={{
            fontSize: 13,
            color: "#ec4899",
            fontWeight: "700",
            letterSpacing: 2,
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          GOOD MORNING ✨
        </Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#1e1b4b",
            lineHeight: 34,
            marginBottom: 4,
          }}
        >
          What are you{"\n"}wearing today?
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#94a3b8",
            fontStyle: "italic",
            marginBottom: 24,
          }}
        >
          "I don't rely on mirrors, I rely on Cher."
        </Text>

        {/* ── Quick Outfit Fix ── */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            letterSpacing: 2,
            color: "#94a3b8",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Quick Outfit Fix
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {OCCASIONS.map((o, i) => (
            <View key={o.id} style={{ width: "47%" }}>
              <OccasionCard
                occasion={o}
                selected={selectedOccasion === o.id}
                onPress={handleOccasionPress}
              />
            </View>
          ))}
        </View>

        {/* ── Closet Stats ── */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            letterSpacing: 2,
            color: "#94a3b8",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Your Closet Stats
        </Text>
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.85)",
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: "rgba(244,114,182,0.12)",
            shadowColor: "#ec4899",
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {stats.map((s) => (
              <View key={s.label} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 28, fontWeight: "700", color: "#ec4899" }}>
                  {s.value}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    fontWeight: "600",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Recently Added ── */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            letterSpacing: 2,
            color: "#94a3b8",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Recently Added
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {MOCK_CLOTHES.slice(0, 5).map((item) => (
              <View
                key={item.id}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  backgroundColor: item.bg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderColor: "rgba(0,0,0,0.05)",
                }}
              >
                <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: "#94a3b8",
                    fontWeight: "700",
                    marginTop: 2,
                    letterSpacing: 0.5,
                  }}
                >
                  {item.name.toUpperCase().slice(0, 8)}
                </Text>
              </View>
            ))}

            {/* Add item shortcut */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Closet")}
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.5)",
                borderWidth: 2,
                borderColor: "rgba(236,72,153,0.3)",
                borderStyle: "dashed",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 20, color: "#ec4899" }}>+</Text>
              <Text style={{ fontSize: 9, color: "#ec4899", fontWeight: "700" }}>ADD</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

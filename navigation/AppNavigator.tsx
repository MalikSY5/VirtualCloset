import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "../screens/HomeScreen";
import ClosetScreen from "../screens/ClosetScreen";
import StylistScreen from "../screens/StylistScreen";
import CherScreen from "../screens/CherScreen";
import AddItemScreen from "../screens/AddItemScreen";

// ── Param list types ──────────────────────────

export type RootTabParamList = {
  Home: undefined;
  Closet: undefined;
  /** Optional occasion id passed when navigating from Home or Closet */
  Stylist: { occasion?: string } | undefined;
  Cher: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  AddItem: undefined;
};

// ── Navigators ────────────────────────────────

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<string, string> = {
  Home: "🏠",
  Closet: "👗",
  Stylist: "🪄",
  Cher: "👱‍♀️",
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.95)",
          borderTopColor: "rgba(244,114,182,0.15)",
          borderTopWidth: 1.5,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 84 : 64,
        },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              fontSize: 10,
              fontWeight: focused ? "700" : "400",
              color: focused ? "#ec4899" : "#94a3b8",
              letterSpacing: 0.5,
              marginTop: 2,
            }}
          >
            {route.name === "Cher" ? "Ask Cher" : route.name}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Closet" component={ClosetScreen} />
      <Tab.Screen name="Stylist" component={StylistScreen} />
      <Tab.Screen name="Cher" component={CherScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen
            name="AddItem"
            component={AddItemScreen}
            options={{
              headerShown: true,
              title: "Add to Closet",
              headerTintColor: "#ec4899",
              headerStyle: { backgroundColor: "#fff0f9" },
              headerTitleStyle: { fontWeight: "700", color: "#1e1b4b" },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

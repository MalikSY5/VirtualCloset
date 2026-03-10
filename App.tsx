/**
 * App.tsx
 * ─────────────────────────────────────────────
 * Root of the Cher's Closet app.
 * Mounts the bottom-tab navigator inside a GestureHandlerRootView
 * (required by react-native-gesture-handler).
 *
 * Auth gate: listens to Supabase auth state changes.
 *  - undefined  → still loading (render nothing to avoid flash)
 *  - null       → not signed in → show auth placeholder
 *  - User obj   → signed in → show AppNavigator
 */
import React from "react";
import { registerRootComponent } from "expo";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./navigation/AppNavigator";

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);

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
/**
 * App.tsx
 * ─────────────────────────────────────────────
 * Root of the Cher's Closet app.
 *
 * Auth gate:
 *  - undefined  → loading (blank screen to avoid flash)
 *  - null       → not signed in → show Login / SignUp
 *  - User obj   → signed in → show AppNavigator
 */
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { registerRootComponent } from "expo";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./navigation/AppNavigator";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import { onAuthStateChange } from "./supabase/authService";

function App() {
  const [user, setUser] = useState<any>(undefined);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChange((session: any) => {
      setUser(session?.user ?? null);
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  // Still resolving cached session
  if (user === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff0f9", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#ec4899" size="large" />
      </View>
    );
  }

  // Not signed in
  if (user === null) {
    return showSignUp ? (
      <SignUpScreen onNavigateToLogin={() => setShowSignUp(false)} />
    ) : (
      <LoginScreen onNavigateToSignUp={() => setShowSignUp(true)} />
    );
  }

  // Signed in
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);

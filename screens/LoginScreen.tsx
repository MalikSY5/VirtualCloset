/**
 * LoginScreen.tsx
 * Sign-in with email + password via Supabase auth.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { signIn } from "../supabase/authService";

type Props = {
  onNavigateToSignUp: () => void;
};

export default function LoginScreen({ onNavigateToSignUp }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Hold up!", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
      // onAuthStateChange in App.tsx will automatically navigate into the app
    } catch (err: any) {
      Alert.alert("As if!", err.message ?? "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff0f9" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 32 }}
      >
        {/* Logo / title */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 8 }}>👗</Text>
          <Text style={{ fontSize: 32, fontWeight: "800", color: "#ec4899", letterSpacing: -1 }}>
            ✦ Cher's Closet
          </Text>
          <Text style={{ fontSize: 14, color: "#94a3b8", fontStyle: "italic", marginTop: 6 }}>
            "As if you'd ever be underdressed."
          </Text>
        </View>

        {/* Email */}
        <Text style={labelStyle}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="cher@horowitz.com"
          placeholderTextColor="#c4b5d0"
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          style={inputStyle}
        />

        {/* Password */}
        <Text style={[labelStyle, { marginTop: 16 }]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#c4b5d0"
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          style={inputStyle}
        />

        {/* Login button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: "#ec4899",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 28,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
              Sign In ✦
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign up link */}
        <TouchableOpacity onPress={onNavigateToSignUp} style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ color: "#94a3b8", fontSize: 14 }}>
            New here?{" "}
            <Text style={{ color: "#ec4899", fontWeight: "700" }}>Create an account</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const labelStyle = {
  fontSize: 13,
  fontWeight: "600" as const,
  color: "#6b21a8",
  marginBottom: 6,
  letterSpacing: 0.5,
};

const inputStyle = {
  backgroundColor: "white",
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 15,
  color: "#1e1b4b",
  borderWidth: 1.5,
  borderColor: "rgba(236,72,153,0.2)",
};

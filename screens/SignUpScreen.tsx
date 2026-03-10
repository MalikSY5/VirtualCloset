/**
 * SignUpScreen.tsx
 * Create a new account with email + password via Supabase auth.
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
  ScrollView,
} from "react-native";
import { signUp } from "../supabase/authService";

type Props = {
  onNavigateToLogin: () => void;
};

export default function SignUpScreen({ onNavigateToLogin }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!displayName.trim() || !email.trim() || !password) {
      Alert.alert("Hold up!", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("As if!", "Passwords don't match. Try again.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Whatever!", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await signUp({ email: email.trim().toLowerCase(), password, displayName: displayName.trim() });
      Alert.alert(
        "Welcome to the closet! 🎉",
        "Check your email to confirm your account, then sign in.",
        [{ text: "OK", onPress: onNavigateToLogin }]
      );
    } catch (err: any) {
      Alert.alert("Totally buggin'!", err.message ?? "Sign up failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff0f9" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 32, paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / title */}
          <View style={{ alignItems: "center", marginBottom: 36 }}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>✨</Text>
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#ec4899", letterSpacing: -0.5 }}>
              Join Cher's Closet
            </Text>
            <Text style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", marginTop: 6 }}>
              "Let's do a makeover!"
            </Text>
          </View>

          {/* Display name */}
          <Text style={labelStyle}>Your Name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Cher Horowitz"
            placeholderTextColor="#c4b5d0"
            autoCapitalize="words"
            returnKeyType="next"
            style={inputStyle}
          />

          {/* Email */}
          <Text style={[labelStyle, { marginTop: 16 }]}>Email</Text>
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
            returnKeyType="next"
            style={inputStyle}
          />

          {/* Confirm password */}
          <Text style={[labelStyle, { marginTop: 16 }]}>Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor="#c4b5d0"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
            style={inputStyle}
          />

          {/* Sign up button */}
          <TouchableOpacity
            onPress={handleSignUp}
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
                Create Account ✦
              </Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity onPress={onNavigateToLogin} style={{ marginTop: 20, alignItems: "center" }}>
            <Text style={{ color: "#94a3b8", fontSize: 14 }}>
              Already have an account?{" "}
              <Text style={{ color: "#ec4899", fontWeight: "700" }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
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

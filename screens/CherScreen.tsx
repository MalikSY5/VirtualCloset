/**
 * CherScreen.tsx
 * ─────────────────────────────────────────────
 * AI chatbot screen powered by Anthropic Claude.
 *  • Full conversation history is sent on each turn
 *  • Graceful error handling with in-character fallbacks
 *  • ChatBubble + TypingIndicator components
 *  • Auto-scrolls to the latest message
 */
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";

import { sendChatMessage, ChatMessage } from "../services/anthropicService";
import ChatBubble, { TypingIndicator } from "../components/ChatBubble";

// ── Types ─────────────────────────────────────

type DisplayMessage = {
  id: string;
  role: "cher" | "user";
  text: string;
};

// ── Component ─────────────────────────────────

export default function CherScreen() {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: "0",
      role: "cher",
      text: "Hi! I'm Cher, your personal style AI. Tell me about an occasion or just ask for outfit advice! As if you'd ever be underdressed with me around. 💅",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList<DisplayMessage>>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Build conversation history for the API (role: "user" | "assistant" only)
    const history: ChatMessage[] = [...messages, userMsg]
      .filter((m) => m.role !== "cher" || m.id !== "0") // exclude greeting from API history
      .map((m) => ({
        role: m.role === "cher" ? "assistant" : "user",
        content: m.text,
      }));

    try {
      const reply = await sendChatMessage(history);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "cher", text: reply },
      ]);
    } catch (err) {
      setIsTyping(false);
      console.error("[CherScreen] API error:", err);
      const errorMsg =
        err instanceof Error && err.message.includes("Missing ANTHROPIC_API_KEY")
          ? "Whatever! I can't connect without my API key. Add ANTHROPIC_API_KEY to your .env file and restart Expo!"
          : `Whatever! My connection is being so not Fetch right now. (${err instanceof Error ? err.message : String(err)})`;
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "cher", text: errorMsg },
      ]);
    }
  };

  const renderItem = ({ item }: { item: DisplayMessage }) => (
    <ChatBubble role={item.role} text={item.text} />
  );

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
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#ec4899", letterSpacing: -0.5 }}>
          ✦ Cher's Closet
        </Text>
        <Text style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>"As if!"</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* ── Screen title ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#1e1b4b" }}>Ask Cher</Text>
          <Text style={{ fontSize: 14, color: "#94a3b8", fontStyle: "italic" }}>
            "My name is Cher and I'm your stylist."
          </Text>
        </View>

        {/* ── Messages list ── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 12,
            flexGrow: 1,
            gap: 4,
          }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* ── Input bar ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: "rgba(244,114,182,0.15)",
            backgroundColor: "rgba(255,240,249,0.95)",
            paddingBottom: Platform.OS === "ios" ? 24 : 12,
          }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            placeholder="Ask Cher anything fashion..."
            placeholderTextColor="#94a3b8"
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 100,
              borderWidth: 1.5,
              borderColor: "rgba(236,72,153,0.2)",
              backgroundColor: "rgba(255,255,255,0.9)",
              fontSize: 14,
              color: "#1e1b4b",
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: inputText.trim() && !isTyping ? "#ec4899" : "#e5e7eb",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#ec4899",
              shadowOpacity: inputText.trim() && !isTyping ? 0.35 : 0,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: inputText.trim() && !isTyping ? 4 : 0,
            }}
          >
            <Text style={{ fontSize: 18 }}>✨</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

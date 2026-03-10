/**
 * anthropicService.ts
 * ─────────────────────────────────────────────
 * Handles all communication with the Anthropic
 * Claude API for the "Ask Cher" chatbot feature.
 *
 * Model: claude-sonnet-4-20250514
 * Docs:  https://docs.anthropic.com/en/api/messages
 * ─────────────────────────────────────────────
 */

import Constants from "expo-constants";
import { MOCK_CLOTHES } from "../data/mockClothes";

// ── Types ────────────────────────────────────

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type AnthropicResponse = {
  id: string;
  type: "message";
  role: "assistant";
  content: Array<{ type: "text"; text: string }>;
  model: string;
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
};

// ── Config ───────────────────────────────────

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;
const API_VERSION = "2023-06-01";
const DANGEROUS_ALLOW_BROWSER = true; // required for direct calls from React Native / Expo Go

/**
 * Reads the API key from Expo's extra config which is
 * populated from the .env file via app.config.ts.
 *
 * In development: set ANTHROPIC_API_KEY in your .env file.
 * In production:  inject via EAS Secrets or your CI/CD pipeline.
 *
 * ⚠️  NEVER hardcode your API key here.
 */
const getApiKey = (): string => {
  // Primary: read from Expo config extra (set via app.config.ts → process.env)
  const key =
    (Constants.expoConfig?.extra?.anthropicApiKey as string | undefined) ||
    (process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY as string | undefined);

  if (!key || key === "your_anthropic_api_key_here") {
    throw new Error(
      "Missing ANTHROPIC_API_KEY. Add it to your .env file and restart Expo."
    );
  }
  return key;
};

// ── System Prompt ────────────────────────────

/**
 * Builds the system prompt injecting the user's current wardrobe
 * so Cher can reference specific pieces in her advice.
 */
const buildSystemPrompt = (): string => {
  const wardrobeList = MOCK_CLOTHES.map((c) => c.name).join(", ");

  return (
    `You are Cher Horowitz from the movie Clueless — bubbly, fashion-obsessed, ` +
    `and genuinely helpful. You're a personal style AI assistant in a virtual closet app. ` +
    `The user's wardrobe includes: ${wardrobeList}. ` +
    `Give outfit advice in Cher's voice — use her iconic phrases like "As if!", "Whatever!", ` +
    `"Totally buggin'", "Baldwin", "Monet", etc. ` +
    `Keep responses short (2-4 sentences), fun, and actually helpful with fashion advice. ` +
    `Reference specific items from their wardrobe when relevant.`
  );
};

// ── API Call ─────────────────────────────────

/**
 * Sends a conversation history to Claude and returns Cher's reply.
 *
 * @param messages  - Full conversation history (user + assistant turns).
 *                    Pass only `role: "user" | "assistant"` messages here;
 *                    the system prompt is injected separately.
 * @returns         The assistant's text reply.
 *
 * @example
 * const reply = await sendChatMessage([
 *   { role: "user", content: "What should I wear to a job interview?" }
 * ]);
 */
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const apiKey = getApiKey();
  console.log("[Anthropic] Using key prefix:", apiKey.slice(0, 16) + "...");

  const body = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystemPrompt(),
    messages,
  };

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": API_VERSION,
      "anthropic-dangerous-allow-browser": "true",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
  }

  const data: AnthropicResponse = await response.json();
  const text = data.content?.[0]?.text;

  if (!text) {
    throw new Error("Empty response from Anthropic API.");
  }

  return text;
}

// ── Outfit Suggestion Helper ─────────────────

/**
 * Asks Claude to suggest an outfit for a given occasion,
 * returning both a caption and item suggestions in plain text.
 *
 * @param occasion - e.g. "work", "date night", "movies", "casual"
 */
export async function getOutfitSuggestion(occasion: string): Promise<string> {
  return sendChatMessage([
    {
      role: "user",
      content: `Suggest a complete outfit from my wardrobe for a ${occasion} occasion. 
                Include specific pieces and why they work together.`,
    },
  ]);
}

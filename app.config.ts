import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Cher's Closet",
  slug: "chers-closet",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#fff0f9",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.yourname.cherscloset",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#fff0f9",
    },
    package: "com.yourname.cherscloset",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow Cher's Closet to access your photos to add clothes to your wardrobe.",
        cameraPermission:
          "Allow Cher's Closet to use your camera to photograph your clothes.",
      },
    ],
  ],
  extra: {
    anthropicApiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
  },
});

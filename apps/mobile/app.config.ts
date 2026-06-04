import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "诸象 Atlas",
  slug: "atlas",
  version: "0.1.0",
  orientation: "portrait",
  scheme: "atlas",
  userInterfaceStyle: "dark",
  splash: {
    resizeMode: "contain",
    backgroundColor: "#0D0D0F",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.atlas.app",
  },
  android: {
    adaptiveIcon: { backgroundColor: "#0D0D0F" },
    package: "com.atlas.app",
  },
  plugins: ["expo-router"],
  experiments: { typedRoutes: true },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default config;

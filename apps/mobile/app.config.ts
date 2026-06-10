import path from "node:path";
import dotenv from "dotenv";
import type { ExpoConfig } from "expo/config";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config: ExpoConfig = {
  name: "诸象 Atlas",
  slug: "atlas",
  version: "0.1.0",
  orientation: "portrait",
  scheme: "atlas",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#0D0D0F",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.atlas.app",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#0D0D0F",
    },
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

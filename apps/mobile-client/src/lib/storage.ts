import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

interface WebStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const webStorage = (globalThis as { localStorage?: WebStorage }).localStorage;

export const SESSION_KEY = "drio-auth-session";

export async function getStoredItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return webStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setStoredItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      webStorage?.setItem(key, value);
    } catch {
      // Ignore storage failures (private mode, etc.)
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeStoredItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      webStorage?.removeItem(key);
    } catch {
      // Ignore storage failures (private mode, etc.)
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

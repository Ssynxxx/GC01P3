import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const web = Platform.OS === "web";

export const storage = {
  getItem: async (key) => (web ? localStorage.getItem(key) : SecureStore.getItemAsync(key)),
  setItem: async (key, value) => (web ? localStorage.setItem(key, value) : SecureStore.setItemAsync(key, value)),
  removeItem: async (key) => (web ? localStorage.removeItem(key) : SecureStore.deleteItemAsync(key)),
};
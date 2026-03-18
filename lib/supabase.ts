import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import { Platform } from 'react-native';

// Defensive storage adapter that won't crash the app if SecureStore's native module fails
// or if the Expo Go binary is missing new SDK 55 methods like getValueWithKeyAsync
class SafeStorageAdapter {
  private memoryStore: Record<string, string> = {};

  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (e) {
      console.warn('SecureStore.getItemAsync failed, using memory store:', e);
      return this.memoryStore[key] || null;
    }
  }

  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('SecureStore.setItemAsync failed, using memory store:', e);
      this.memoryStore[key] = value;
    }
  }

  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('SecureStore.deleteItemAsync failed, using memory store:', e);
      delete this.memoryStore[key];
    }
  }
}

const ExpoSecureStoreAdapter = new SafeStorageAdapter();

// Supabase configuration — reads from .env (EXPO_PUBLIC_ prefix)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://hheyezsnekoisegeycgt.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

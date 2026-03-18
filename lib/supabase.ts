import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Lazy-load SecureStore only on native platforms (it crashes in Node.js SSR)
let SecureStore: any = null;
if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
  } catch (e) {
    console.warn('expo-secure-store not available:', e);
  }
}

// Bulletproof storage adapter: SecureStore on native, localStorage on web, memory fallback
class SafeStorageAdapter {
  private memoryStore: Record<string, string> = {};

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    if (SecureStore) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (e) {
        console.warn('SecureStore.getItemAsync failed:', e);
      }
    }
    return this.memoryStore[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    if (SecureStore) {
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch (e) {
        console.warn('SecureStore.setItemAsync failed:', e);
      }
    }
    this.memoryStore[key] = value;
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(key); } catch {}
      return;
    }
    if (SecureStore) {
      try {
        await SecureStore.deleteItemAsync(key);
        return;
      } catch (e) {
        console.warn('SecureStore.deleteItemAsync failed:', e);
      }
    }
    delete this.memoryStore[key];
  }
}

const storage = new SafeStorageAdapter();

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://hheyezsnekoisegeycgt.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

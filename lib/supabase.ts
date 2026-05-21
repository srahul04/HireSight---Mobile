import { Platform } from 'react-native';

// Apply the URL polyfill only on native (iOS/Android).
// On web the browser already has a spec-compliant URL API.
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage on native so sessions survive app restarts.
    // On web Supabase falls back to localStorage automatically.
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    // Supabase JS v2 bundles its own whatwg-fetch polyfill which fails on
    // Android/iOS Hermes because it is a Node.js-targeted implementation.
    // Explicitly passing the global fetch forces Supabase to use React
    // Native's native fetch implementation on all platforms, fixing the
    // "TypeError: Network request failed" error on Android.
    fetch: fetch.bind(globalThis),
  },
});

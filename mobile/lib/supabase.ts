// Env names only — never commit values. Set these in your local shell / EAS
// secrets: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY (same
// project as the website's NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY). Expo
// inlines EXPO_PUBLIC_* at build time.
import 'react-native-url-polyfill/auto';
import '@/lib/cryptoPolyfill';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { chunkedSecureStore } from '@/lib/sessionStorage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!url && !!key;

export const supabase = isSupabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        storage: Platform.OS === 'web' ? undefined : chunkedSecureStore,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
        flowType: 'pkce',
      },
    })
  : null;

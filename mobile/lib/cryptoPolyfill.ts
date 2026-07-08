import { Platform } from 'react-native';
import * as ExpoCrypto from 'expo-crypto';

// supabase-js's PKCE flow calls crypto.getRandomValues to build the code
// verifier — unlike crypto.subtle (which it detects and gracefully falls
// back from to the 'plain' PKCE method), there is no fallback for a missing
// getRandomValues, so its absence throws. Hermes has no crypto global at
// all. Native only — web already has a real window.crypto.
if (Platform.OS !== 'web') {
  const g = globalThis as { crypto?: Crypto };
  if (!g.crypto) {
    // @ts-expect-error partial polyfill: only the method auth-js calls
    g.crypto = { getRandomValues: (array: any) => ExpoCrypto.getRandomValues(array) };
  } else if (!g.crypto.getRandomValues) {
    g.crypto.getRandomValues = (array: any) => ExpoCrypto.getRandomValues(array);
  }
}

import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/ui';
import { useAuth } from '@/store/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { theme } from '@/theme';
import { useState } from 'react';

function GoogleGlyph() {
  return (
    <Svg width={16} height={16} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.6 0-14.1 4.3-17.4 10.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 34.6 26.9 35.5 24 35.5c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.8 39.6 16.3 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.6 5.6C41.8 36.1 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </Svg>
  );
}

export default function SignInScreen() {
  const { signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  async function handleGoogle() {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.center}>
        <AppText weight="black" style={styles.wordmark}>
          POSHH
        </AppText>
        <AppText weight="regular" style={styles.tagline}>
          Sonic Pulse · Dhaka
        </AppText>
      </View>

      <View style={styles.footer}>
        {isSupabaseConfigured ? (
          <Pressable
            onPress={handleGoogle}
            disabled={signingIn}
            style={({ pressed }) => [styles.googleButton, pressed && { opacity: 0.85 }]}>
            {signingIn ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <GoogleGlyph />
                <AppText weight="bold" style={styles.googleLabel}>
                  Continue with Google
                </AppText>
              </>
            )}
          </Pressable>
        ) : (
          <Button label="Continue in demo mode" onPress={() => router.replace('/onboarding')} />
        )}
        <AppText weight="regular" style={styles.footnote}>
          Same account as sonicpulsefestival.com
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between', paddingVertical: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontSize: 34, letterSpacing: 2, color: theme.primary },
  tagline: { fontSize: 12, color: theme.muted, marginTop: 8 },
  footer: { gap: 14 },
  googleButton: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#101014',
    borderWidth: 1,
    borderColor: '#2a2a32',
  },
  googleLabel: { fontSize: 13, color: '#fff' },
  footnote: { fontSize: 10.5, color: theme.mutedDim, textAlign: 'center' },
});

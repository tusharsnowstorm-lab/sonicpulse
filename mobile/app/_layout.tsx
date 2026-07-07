import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { fonts, theme } from '@/theme';
import { AppStoreProvider } from '@/store/AppStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// The whole brand is a single dark identity (void background, magenta accent) —
// the website has no light mode, so the app doesn't adapt to system scheme either.
//
// React Navigation renders native headers (e.g. the Verify screen's title)
// through its own theme.fonts, bypassing AppText entirely — every weight
// here has to be overridden or that one title silently falls back to the
// system font while everything else is Montserrat.
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.accent,
    background: theme.void,
    card: theme.surface,
    text: theme.primary,
    border: theme.border,
  },
  fonts: {
    regular: { fontFamily: fonts.regular, fontWeight: '400' as const },
    medium: { fontFamily: fonts.medium, fontWeight: '400' as const },
    bold: { fontFamily: fonts.bold, fontWeight: '400' as const },
    heavy: { fontFamily: fonts.black, fontWeight: '400' as const },
  },
};

// Prevent the splash screen from auto-hiding before fonts are loaded.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
    'Montserrat-Black': require('../assets/fonts/Montserrat-Black.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <AppStoreProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="gate/index" options={{ headerShown: false }} />
          <Stack.Screen name="verify/[code]" options={{ headerShown: true, title: 'Verify Ticket' }} />
        </Stack>
      </AppStoreProvider>
    </ThemeProvider>
  );
}

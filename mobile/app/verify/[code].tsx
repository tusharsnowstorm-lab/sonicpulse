import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { theme } from '@/theme';

// Mirrors the website's /verify/[referenceCode] page — Phase 04 of the
// build guide points this at the same lookup the existing API route already
// performs; no new backend logic here.
export default function VerifyScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();

  return (
    <Screen>
      <View style={styles.center}>
        <AppText weight="medium" style={styles.label}>
          REFERENCE CODE
        </AppText>
        <AppText weight="black" style={styles.code}>
          {code}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, color: theme.muted, letterSpacing: 1, marginBottom: 8 },
  code: { fontSize: 20, color: theme.primary },
});

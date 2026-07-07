import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { theme } from '@/theme';

// Staff-only, reached outside the tab bar — not something an attendee ever
// sees. The viewfinder below is static; Phase 05 of the build guide wires it
// to expo-camera's built-in barcode scanning, same allowlist as the
// website's gate-auth.ts.
const LAST_SCAN = {
  holder: 'TANVIR AHMED',
  tier: 'PHASE 1',
  reference: 'SP-4F82A1C9',
  time: '21:42',
};

export default function GateScreen() {
  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View style={styles.staffBar}>
        <AppText weight="medium" style={styles.staffLabel}>
          GATE · SONIC PULSE
        </AppText>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <AppText weight="medium" style={styles.liveLabel}>
            Scanning
          </AppText>
        </View>
      </View>

      <View style={styles.viewfinder}>
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
        <AppText weight="regular" style={styles.hint}>
          Align QR within frame
        </AppText>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.resultStatus}>
          <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.good} size={11} />
          <AppText weight="medium" style={styles.resultStatusText}>
            ENTRY CONFIRMED
          </AppText>
        </View>
        <AppText weight="bold" style={styles.resultName}>
          {LAST_SCAN.holder}
        </AppText>
        <View style={styles.resultMetaRow}>
          <AppText weight="regular" style={styles.resultMeta}>
            {LAST_SCAN.tier}
          </AppText>
          <AppText weight="regular" style={styles.resultMeta}>
            {LAST_SCAN.reference}
          </AppText>
          <AppText weight="regular" style={styles.resultMeta}>
            {LAST_SCAN.time}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  staffBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  staffLabel: { fontSize: 11, letterSpacing: 0.6, color: theme.muted },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.good },
  liveLabel: { fontSize: 10, color: theme.good },
  viewfinder: {
    marginHorizontal: 20,
    height: 220,
    backgroundColor: '#000',
    borderRadius: 16,
    marginBottom: 16,
  },
  corner: { position: 'absolute', width: 26, height: 26, borderColor: theme.accent, borderWidth: 3 },
  cornerTL: { top: 14, left: 14, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 14, right: 14, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 14, left: 14, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 14, right: 14, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  hint: { position: 'absolute', bottom: 10, alignSelf: 'center', fontSize: 10, color: 'rgba(240,240,248,0.5)' },
  resultCard: {
    marginHorizontal: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 16,
  },
  resultStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.good,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 9,
    marginBottom: 10,
  },
  resultStatusText: { fontSize: 10, color: theme.good },
  resultName: { fontSize: 15, marginBottom: 6 },
  resultMetaRow: { flexDirection: 'row', gap: 16 },
  resultMeta: { fontSize: 10, color: theme.muted },
});

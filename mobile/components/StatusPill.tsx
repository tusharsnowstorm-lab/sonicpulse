import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { theme } from '@/theme';

type Tone = 'pending' | 'good' | 'neutral';

const TONE_COLOR: Record<Tone, string> = {
  pending: '#FFB648',
  good: theme.good,
  neutral: theme.muted,
};

export function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  const color = TONE_COLOR[tone];
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <AppText weight="medium" style={[styles.text, { color }]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  text: { fontSize: 9, letterSpacing: 0.4 },
});

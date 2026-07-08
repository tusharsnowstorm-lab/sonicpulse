import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import type { CliqueMember } from '@/data/clique';
import { theme } from '@/theme';

export function Facepile({ members, max = 4, size = 26 }: { members: CliqueMember[]; max?: number; size?: number }) {
  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;

  return (
    <View style={styles.row}>
      {shown.map((m, i) => (
        <View
          key={m.slug}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: m.color,
              marginLeft: i === 0 ? 0 : -size * 0.32,
              zIndex: shown.length - i,
            },
          ]}>
          <AppText weight="bold" style={styles.initial}>
            {m.initial}
          </AppText>
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={[
            styles.dot,
            styles.more,
            { width: size, height: size, borderRadius: size / 2, marginLeft: -size * 0.32 },
          ]}>
          <AppText weight="bold" style={styles.moreText}>
            +{overflow}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.surface,
  },
  initial: { fontSize: 10, color: 'rgba(5,5,8,0.65)' },
  more: { backgroundColor: theme.elevated },
  moreText: { fontSize: 9, color: theme.muted },
});

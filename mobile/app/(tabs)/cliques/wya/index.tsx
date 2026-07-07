import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { EventHeader } from '@/components/Headers';
import { AppText } from '@/components/AppText';
import { SearchInput } from '@/components/SearchInput';
import { Radar } from '@/components/Radar';
import { nightOwls, FOUND_DISTANCE_METERS, type CliqueMember } from '@/data/clique';
import { theme } from '@/theme';

export default function WyaScreen() {
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();
  const dimmedSlugs = useMemo(
    () =>
      normalized
        ? nightOwls.members.filter((m) => !m.name.toLowerCase().includes(normalized)).map((m) => m.slug)
        : [],
    [normalized]
  );
  const visibleMembers = normalized
    ? nightOwls.members.filter((m) => m.name.toLowerCase().includes(normalized))
    : nightOwls.members;

  function openMember(member: CliqueMember) {
    router.push(`/(tabs)/cliques/wya/${member.slug}`);
  }

  return (
    <Screen>
      <EventHeader back={nightOwls.name} />

      <View style={styles.sharePill}>
        <SymbolView name={{ ios: 'location.fill', android: 'location_on', web: 'location_on' }} tintColor={theme.accent} size={11} />
        <AppText weight="medium" style={styles.sharePillText}>
          Sharing until 09:00
        </AppText>
      </View>

      <SearchInput value={query} onChangeText={setQuery} />

      <Radar members={nightOwls.members} dimmedSlugs={dimmedSlugs} onSelectMember={openMember} />

      <View style={styles.legend}>
        {visibleMembers.length === 0 ? (
          <AppText weight="regular" style={styles.empty}>
            No one in this clique matches "{query}"
          </AppText>
        ) : (
          visibleMembers.map((m) => {
            const found = m.distanceMeters <= FOUND_DISTANCE_METERS;
            return (
              <Pressable key={m.slug} style={styles.legendRow} onPress={() => openMember(m)}>
                <View style={[styles.dot, { backgroundColor: m.color }]} />
                <AppText weight="semiBold" style={styles.legendName}>
                  {m.name}
                </AppText>
                {found ? (
                  <View style={styles.foundPill}>
                    <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.good} size={9} />
                    <AppText weight="medium" style={styles.foundText}>
                      FOUND
                    </AppText>
                  </View>
                ) : (
                  <AppText weight="regular" style={styles.legendDist}>
                    {m.distanceMeters}m
                  </AppText>
                )}
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                  tintColor={theme.mutedDim}
                  size={12}
                />
              </Pressable>
            );
          })
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sharePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    marginBottom: 14,
  },
  sharePillText: { fontSize: 10, color: theme.muted },
  legend: { gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: 13 },
  legendDist: { fontSize: 11, color: theme.muted },
  foundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.good,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  foundText: { fontSize: 10, color: theme.good },
  empty: { fontSize: 12, color: theme.muted, textAlign: 'center', marginTop: 20 },
});

import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { EventHeader } from '@/components/Headers';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/ui';
import { SearchInput } from '@/components/SearchInput';
import { Radar } from '@/components/Radar';
import { FOUND_DISTANCE_METERS, type CliqueMember } from '@/data/clique';
import { useAppStore } from '@/store/AppStore';
import { useLiveClique } from '@/hooks/useLiveClique';
import { theme } from '@/theme';

export default function WyaScreen() {
  const { cliqueId } = useLocalSearchParams<{ cliqueId?: string }>();
  const { cliques } = useAppStore();
  const clique = cliques.find((c) => c.id === cliqueId) ?? cliques[0];
  const { members, status, stopSharing } = useLiveClique(clique);
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();
  const dimmedSlugs = useMemo(
    () =>
      members
        .filter((m) => m.stale || (normalized && !m.name.toLowerCase().includes(normalized)))
        .map((m) => m.slug),
    [normalized, members]
  );
  const visibleMembers = normalized ? members.filter((m) => m.name.toLowerCase().includes(normalized)) : members;

  function openMember(member: CliqueMember) {
    router.push({ pathname: '/(tabs)/cliques/wya/[slug]', params: { slug: member.slug, cliqueId: clique?.id ?? '' } });
  }

  if (!clique) {
    return (
      <Screen>
        <AppText weight="medium" style={{ color: theme.muted }}>
          Join a clique to use wya?
        </AppText>
      </Screen>
    );
  }

  if (status === 'denied') {
    return (
      <Screen>
        <EventHeader back={clique.name} />
        <View style={styles.deniedWrap}>
          <SymbolView name={{ ios: 'location.slash', android: 'location_off', web: 'location_off' }} tintColor={theme.muted} size={28} />
          <AppText weight="bold" style={styles.deniedTitle}>
            Location access needed
          </AppText>
          <AppText weight="regular" style={styles.deniedSub}>
            wya? shows your clique roughly where you are, only while this screen is open, only tonight. Enable
            location access in Settings to use it.
          </AppText>
          <Button label="Open Settings" variant="outline" style={{ marginTop: 16 }} onPress={() => Linking.openSettings()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <EventHeader back={clique.name} />

      <Pressable style={styles.sharePill} onPress={status === 'live' ? stopSharing : undefined} disabled={status !== 'live'}>
        <SymbolView name={{ ios: 'location.fill', android: 'location_on', web: 'location_on' }} tintColor={theme.accent} size={11} />
        <AppText weight="medium" style={styles.sharePillText}>
          {status === 'connecting' ? 'Connecting…' : 'Sharing until 09:00'}
        </AppText>
      </Pressable>

      <SearchInput value={query} onChangeText={setQuery} />

      <Radar members={members} dimmedSlugs={dimmedSlugs} onSelectMember={openMember} />

      <View style={styles.legend}>
        {visibleMembers.length === 0 ? (
          <AppText weight="regular" style={styles.empty}>
            No one in this clique matches "{query}"
          </AppText>
        ) : (
          visibleMembers.map((m) => {
            const found = m.found ?? m.distanceMeters <= FOUND_DISTANCE_METERS;
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
  deniedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, gap: 4 },
  deniedTitle: { fontSize: 15, color: theme.primary, marginTop: 10 },
  deniedSub: { fontSize: 12.5, color: theme.muted, textAlign: 'center', lineHeight: 18, marginTop: 4 },
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

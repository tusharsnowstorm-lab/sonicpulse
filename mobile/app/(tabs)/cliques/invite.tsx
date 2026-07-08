import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { SectionLabel } from '@/components/ui';
import { SearchInput } from '@/components/SearchInput';
import { searchUsers } from '@/data/users';
import { useAppStore } from '@/store/AppStore';
import { theme } from '@/theme';

export default function InviteToCliqueScreen() {
  const { cliqueId } = useLocalSearchParams<{ cliqueId: string }>();
  const { cliques, sendInvite, isInvited } = useAppStore();
  const [query, setQuery] = useState('');

  const clique = cliques.find((c) => c.id === cliqueId);
  const memberIds = clique?.members.map((m) => m.slug) ?? [];
  const results = useMemo(() => searchUsers(query, memberIds), [query, memberIds]);

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
        <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={theme.muted} size={13} />
        <AppText weight="medium" style={styles.backLabel}>
          {clique?.name ?? 'Clique'}
        </AppText>
      </Pressable>

      <SearchInput value={query} onChangeText={setQuery} placeholder="Search by name" />

      <SectionLabel>Results</SectionLabel>
      {results.length === 0 && query.trim().length > 0 && (
        <AppText weight="regular" style={styles.empty}>
          No one matches "{query}"
        </AppText>
      )}
      {results.map((user) => {
        const sent = cliqueId ? isInvited(cliqueId, user.id) : false;
        return (
          <View key={user.id} style={styles.resultRow}>
            <View style={styles.resultDot}>
              <AppText weight="bold" style={styles.resultInitial}>
                {user.initial}
              </AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText weight="bold" style={styles.resultName}>
                {user.name}
              </AppText>
              <AppText weight="regular" style={styles.resultHandle}>
                @{user.handle}
              </AppText>
            </View>
            <Pressable
              disabled={sent}
              onPress={() => cliqueId && sendInvite(cliqueId, user.id)}
              style={[styles.inviteBtn, sent && styles.inviteBtnSent]}>
              <AppText weight="bold" style={[styles.inviteBtnText, sent && styles.inviteBtnTextSent]}>
                {sent ? 'Sent' : 'Invite'}
              </AppText>
            </Pressable>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 18 },
  backLabel: { fontSize: 12, color: theme.muted },
  empty: { fontSize: 12, color: theme.muted, marginTop: 8 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  resultDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInitial: { fontSize: 12, color: theme.muted },
  resultName: { fontSize: 12.5 },
  resultHandle: { fontSize: 10.5, color: theme.muted, marginTop: 1 },
  inviteBtn: { backgroundColor: theme.accent, borderRadius: 100, paddingVertical: 6, paddingHorizontal: 12 },
  inviteBtnText: { fontSize: 10.5, color: theme.void },
  inviteBtnSent: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
  inviteBtnTextSent: { color: theme.mutedDim },
});

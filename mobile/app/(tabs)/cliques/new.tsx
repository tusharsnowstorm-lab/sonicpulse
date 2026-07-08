import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { SectionLabel, InputBox, Button } from '@/components/ui';
import { SearchInput } from '@/components/SearchInput';
import { searchUsers } from '@/data/users';
import { useAppStore } from '@/store/AppStore';
import { theme } from '@/theme';

export default function NewCliqueScreen() {
  const { createClique } = useAppStore();
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const results = useMemo(() => searchUsers(query, []), [query]);

  function toggle(userId: string) {
    setSelected((s) => (s.includes(userId) ? s.filter((id) => id !== userId) : [...s, userId]));
  }

  function create() {
    createClique(name.trim(), selected, null);
    router.back();
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
        <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={theme.muted} size={13} />
        <AppText weight="medium" style={styles.backLabel}>
          Cliques
        </AppText>
      </Pressable>

      <SectionLabel>Clique Name</SectionLabel>
      <View style={{ marginBottom: 18 }}>
        <InputBox value={name} onChangeText={setName} placeholder="Weekend Warriors" autoCapitalize="words" />
      </View>

      <SectionLabel>Invite Members</SectionLabel>
      <SearchInput value={query} onChangeText={setQuery} placeholder="Search by name" />

      {results.map((user) => {
        const isSelected = selected.includes(user.id);
        return (
          <Pressable key={user.id} style={styles.resultRow} onPress={() => toggle(user.id)}>
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
            <View style={[styles.checkbox, isSelected && styles.checkboxOn]}>
              {isSelected && (
                <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.void} size={9} />
              )}
            </View>
          </Pressable>
        );
      })}

      {selected.length > 0 && (
        <AppText weight="medium" style={styles.selectedNote}>
          {selected.length} {selected.length === 1 ? 'person' : 'people'} invited — they'll accept or decline before
          joining.
        </AppText>
      )}

      <View style={{ flex: 1 }} />
      <Button label="Create Clique" onPress={create} disabled={name.trim().length < 2} style={name.trim().length < 2 && { opacity: 0.4 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 18 },
  backLabel: { fontSize: 12, color: theme.muted },
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: theme.accent, borderColor: theme.accent },
  selectedNote: { fontSize: 11, color: theme.muted, marginTop: 12, lineHeight: 16 },
});

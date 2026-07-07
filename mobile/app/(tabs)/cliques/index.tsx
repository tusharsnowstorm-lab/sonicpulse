import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppShellHeader } from '@/components/Headers';
import { AppText } from '@/components/AppText';
import { Card, SectionLabel, Button } from '@/components/ui';
import { nightOwls } from '@/data/clique';
import { theme } from '@/theme';

export default function CliquesScreen() {
  return (
    <Screen>
      <AppShellHeader />
      <SectionLabel>Your Clique</SectionLabel>
      <Card>
        <AppText weight="black" style={styles.name}>
          {nightOwls.name}
        </AppText>
        <View style={styles.avatarRow}>
          {nightOwls.members.map((m, i) => (
            <View
              key={m.name}
              style={[styles.avatar, { borderColor: m.color, marginLeft: i === 0 ? 0 : -10 }]}>
              <AppText weight="bold" style={[styles.avatarInitial, { color: m.color }]}>
                {m.initial}
              </AppText>
            </View>
          ))}
        </View>
        <Button
          label="wya?"
          variant="outline"
          onPress={() => router.push('/(tabs)/cliques/wya')}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 15, marginBottom: 14 },
  avatarRow: { flexDirection: 'row', marginBottom: 16 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.elevated,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 11 },
});

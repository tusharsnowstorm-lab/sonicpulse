import { ScrollView, StyleSheet, View } from 'react-native';
import { EventHeader } from '@/components/Headers';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card, SectionLabel, Button } from '@/components/ui';
import { sonicPulse } from '@/data/event';
import { fonts, theme } from '@/theme';

export default function SonicPulseScreen() {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <EventHeader back="Events" />

        <Card style={{ marginBottom: 22 }}>
          <AppText weight="medium" style={styles.eyebrow}>
            ONE NIGHT ONLY · {sonicPulse.hours}
          </AppText>
          <AppText weight="black" style={styles.tagline}>
            {sonicPulse.tagline}
          </AppText>
          <AppText weight="regular" style={styles.headlinerLine}>
            {sonicPulse.headliners.map((a) => a.name).join(' · ')}
          </AppText>
        </Card>

        <SectionLabel>Lineup</SectionLabel>
        <View style={{ marginBottom: 24 }}>
          {sonicPulse.headliners.map((artist, i) => (
            <View
              key={artist.name}
              style={[styles.lineupRow, i === sonicPulse.headliners.length - 1 && { borderBottomWidth: 0 }]}>
              <AppText weight="medium" style={styles.lineupTime}>
                {artist.setTime.split('–')[0]}
              </AppText>
              <View>
                <AppText weight="bold" style={styles.lineupName}>
                  {artist.name}
                </AppText>
                <AppText weight="regular" style={styles.lineupGenre}>
                  {artist.genre}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <Button label="Sign Up" />
        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontFamily: fonts.medium, fontSize: 10, letterSpacing: 1, color: theme.accent, marginBottom: 8 },
  tagline: { fontSize: 20, marginBottom: 6 },
  headlinerLine: { fontSize: 12, color: theme.muted },
  lineupRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  lineupTime: { fontFamily: fonts.medium, fontSize: 12, color: theme.accent, width: 42 },
  lineupName: { fontSize: 14 },
  lineupGenre: { fontSize: 11, color: theme.muted, marginTop: 2 },
});

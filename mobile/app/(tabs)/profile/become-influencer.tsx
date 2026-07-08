import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { SectionLabel, Segmented, ChipGroup, InputBox, Button } from '@/components/ui';
import {
  INFLUENCER_PLATFORM_OPTIONS,
  FOLLOWER_BUCKET_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  emptyInfluencerProfile,
  type InfluencerProfile,
} from '@/data/profile';
import { useAppStore } from '@/store/AppStore';
import { theme } from '@/theme';

export default function BecomeInfluencerScreen() {
  const { influencerProfile, saveInfluencerProfile, profile } = useAppStore();
  const [draft, setDraft] = useState<InfluencerProfile>(influencerProfile ?? emptyInfluencerProfile);

  function set<K extends keyof InfluencerProfile>(key: K, value: InfluencerProfile[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function save() {
    saveInfluencerProfile(draft);
    router.back();
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
        <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={theme.muted} size={13} />
        <AppText weight="medium" style={styles.backLabel}>
          Profile
        </AppText>
      </Pressable>

      <AppText weight="black" style={styles.title}>
        Become an Influencer
      </AppText>
      <AppText weight="regular" style={styles.sub}>
        Pick events to promote in exchange for a free ticket — approval is reviewed once, applies everywhere.
      </AppText>

      <View style={styles.alreadyOnFile}>
        <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} tintColor={theme.good} size={13} />
        <AppText weight="medium" style={styles.alreadyOnFileText}>
          Name, phone, ID, and @{profile.instagramHandle || 'your Instagram'} are already on file from your profile.
        </AppText>
      </View>

      <SectionLabel>Primary Platform</SectionLabel>
      <View style={{ marginBottom: 18 }}>
        <Segmented options={INFLUENCER_PLATFORM_OPTIONS} value={draft.primaryPlatform} onChange={(v) => set('primaryPlatform', v)} />
      </View>

      {draft.primaryPlatform === 'tiktok' && (
        <View style={{ marginBottom: 18 }}>
          <SectionLabel>TikTok Handle</SectionLabel>
          <InputBox value={draft.tiktokHandle} onChangeText={(v) => set('tiktokHandle', v.replace(/^@/, ''))} placeholder="yourhandle" autoCapitalize="none" />
        </View>
      )}

      {draft.primaryPlatform === 'youtube' && (
        <View style={{ marginBottom: 18 }}>
          <SectionLabel>YouTube Channel</SectionLabel>
          <InputBox value={draft.youtubeChannel} onChangeText={(v) => set('youtubeChannel', v)} placeholder="Channel name" autoCapitalize="none" />
        </View>
      )}

      <SectionLabel>Follower Count</SectionLabel>
      <View style={{ marginBottom: 18 }}>
        <ChipGroup options={FOLLOWER_BUCKET_OPTIONS} value={draft.followerCount} onChange={(v) => set('followerCount', v)} />
      </View>

      <SectionLabel>Content Type</SectionLabel>
      <View style={{ marginBottom: 24 }}>
        <ChipGroup options={CONTENT_TYPE_OPTIONS} value={draft.contentType} onChange={(v) => set('contentType', v)} />
      </View>

      <View style={{ flex: 1 }} />
      <Button label="Save Influencer Profile" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 18 },
  backLabel: { fontSize: 12, color: theme.muted },
  title: { fontSize: 21, marginBottom: 6 },
  sub: { fontSize: 12.5, color: theme.muted, lineHeight: 18, marginBottom: 16 },
  alreadyOnFile: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(62,213,152,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(62,213,152,0.25)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  alreadyOnFileText: { fontSize: 11, color: theme.good, lineHeight: 16, flex: 1 },
});

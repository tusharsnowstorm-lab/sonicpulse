import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { AppShellHeader } from '@/components/Headers';
import { AppText } from '@/components/AppText';
import { Card, SectionLabel, Segmented, InputBox, Button } from '@/components/ui';
import {
  ID_TYPE_OPTIONS,
  GENDER_OPTIONS,
  FOLLOWER_BUCKET_OPTIONS,
  maskIdNumber,
  type Profile,
  type InfluencerProfile,
} from '@/data/profile';
import { useAppStore } from '@/store/AppStore';
import { theme } from '@/theme';

async function pickImage(onPicked: (uri: string) => void) {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });
  if (!result.canceled && result.assets[0]) {
    onPicked(result.assets[0].uri);
  }
}

export default function ProfileScreen() {
  const { profile: saved, updateProfile, influencerProfile } = useAppStore();
  const [draft, setDraft] = useState(saved);
  const [editing, setEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  function startEditing() {
    setDraft(saved);
    setEditing(true);
    setJustSaved(false);
  }

  function save() {
    // Phase 03/04: PUT the same fields to /api/profile once Supabase auth
    // is wired in — this only updates local state for now.
    updateProfile(draft);
    setEditing(false);
    setJustSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setJustSaved(false), 2500);
  }

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <AppShellHeader />
          {!editing && (
            <Pressable onPress={startEditing} style={styles.editBtn} hitSlop={8}>
              <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} tintColor={theme.muted} size={11} />
              <AppText weight="medium" style={styles.editBtnLabel}>
                Edit
              </AppText>
            </Pressable>
          )}
        </View>

        {justSaved && (
          <View style={styles.savedBanner}>
            <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} tintColor={theme.good} size={13} />
            <AppText weight="medium" style={styles.savedText}>
              Information saved
            </AppText>
          </View>
        )}

        {editing ? (
          <EditForm draft={draft} set={set} onSave={save} onCancel={() => setEditing(false)} />
        ) : (
          <ViewMode profile={saved} influencerProfile={influencerProfile} />
        )}
      </ScrollView>
    </Screen>
  );
}

function ViewMode({ profile, influencerProfile }: { profile: Profile; influencerProfile: InfluencerProfile | null }) {
  const idOption = ID_TYPE_OPTIONS.find((o) => o.value === profile.idType) ?? ID_TYPE_OPTIONS[0];
  const genderLabel = GENDER_OPTIONS.find((g) => g.value === profile.gender)?.label ?? '—';

  return (
    <>
      {influencerProfile ? (
        <Pressable onPress={() => router.push('/(tabs)/profile/become-influencer')}>
          <Card style={styles.influencerRow}>
            <AppText style={styles.influencerBadge}>🎤</AppText>
            <AppText weight="bold" style={styles.influencerRowText}>
              Influencer · {FOLLOWER_BUCKET_OPTIONS.find((o) => o.value === influencerProfile.followerCount)?.label}
            </AppText>
            <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={theme.muted} size={11} />
          </Card>
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push('/(tabs)/profile/become-influencer')}>
          <Card style={styles.becomeInfluencerCard}>
            <AppText style={styles.influencerBadge}>🎤</AppText>
            <View style={{ flex: 1 }}>
              <AppText weight="bold" style={styles.becomeInfluencerTitle}>
                Become an Influencer
              </AppText>
              <AppText weight="regular" style={styles.becomeInfluencerSub}>
                Promote events, get a free ticket on approval.
              </AppText>
            </View>
            <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={theme.accent} size={11} />
          </Card>
        </Pressable>
      )}

      <View style={styles.avatarRow}>
        {profile.photoUri ? (
          <Image source={{ uri: profile.photoUri }} style={styles.avatarPhoto} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <View>
          <AppText weight="bold" style={styles.name}>
            {profile.fullName}
          </AppText>
          <View style={styles.photoStatusRow}>
            {profile.photoUri && (
              <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.good} size={9} />
            )}
            <AppText weight="medium" style={[styles.photoStatus, { color: profile.photoUri ? theme.good : theme.mutedDim }]}>
              {profile.photoUri ? 'Photo uploaded' : 'No photo yet'}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.fieldGrid}>
        <Field label="Full Name" value={profile.fullName} />
        <Field label="Phone Number" value={profile.phone} />
        <Field label="ID Type" value={idOption.label} />
        <Field label={`${idOption.short} Number`} value={maskIdNumber(profile.idNumber)} mono />
        <Field label="Instagram" value={profile.instagramHandle ? `@${profile.instagramHandle}` : '—'} />
        <Field label="Other Social Media" value={profile.otherSocial || '—'} />
        <Field label="Gender" value={genderLabel} />
        <View style={{ width: '100%' }}>
          <AppText weight="medium" style={styles.fieldLabel}>
            {idOption.short.toUpperCase()} DOCUMENT
          </AppText>
          <View style={styles.docStatusRow}>
            {profile.idDocumentUri && (
              <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.good} size={10} />
            )}
            <AppText weight="semiBold" style={[styles.fieldValue, { color: profile.idDocumentUri ? theme.good : theme.mutedDim }]}>
              {profile.idDocumentUri ? 'Uploaded' : 'Not uploaded'}
            </AppText>
          </View>
        </View>
      </View>
    </>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.field}>
      <AppText weight="medium" style={styles.fieldLabel}>
        {label.toUpperCase()}
      </AppText>
      <AppText weight={mono ? 'regular' : 'semiBold'} style={[styles.fieldValue, mono && styles.fieldValueMono]}>
        {value}
      </AppText>
    </View>
  );
}

function EditForm({
  draft,
  set,
  onSave,
  onCancel,
}: {
  draft: Profile;
  set: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const idOption = ID_TYPE_OPTIONS.find((o) => o.value === draft.idType) ?? ID_TYPE_OPTIONS[0];

  return (
    <>
      <View style={styles.photoEditRow}>
        <Pressable style={styles.photoEditWrap} onPress={() => pickImage((uri) => set('photoUri', uri))}>
          {draft.photoUri ? (
            <Image source={{ uri: draft.photoUri }} style={styles.avatarPhotoEdit} />
          ) : (
            <View style={styles.avatarPhotoEditPlaceholder} />
          )}
          <View style={styles.cameraBadge}>
            <SymbolView name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} tintColor={theme.void} size={10} />
          </View>
        </Pressable>
        <AppText weight="regular" style={styles.photoEditCopy}>
          <AppText weight="bold" style={{ color: theme.primary }}>
            Shown on your ticket{' '}
          </AppText>
          and checked at the gate — use a clear, recent photo of your face.
        </AppText>
      </View>

      <FormRow label="Full Name (as on ID)">
        <InputBox value={draft.fullName} onChangeText={(v) => set('fullName', v)} placeholder="Mohammad Rahman" autoCapitalize="words" />
      </FormRow>

      <FormRow label="Phone Number">
        <InputBox value={draft.phone} onChangeText={(v) => set('phone', v)} placeholder="+8801XXXXXXXXX" keyboardType="phone-pad" />
      </FormRow>

      <FormRow label="ID Document Type">
        <Segmented options={ID_TYPE_OPTIONS} value={draft.idType} onChange={(v) => set('idType', v)} />
      </FormRow>

      <FormRow label={`${idOption.short} Number`}>
        <InputBox value={draft.idNumber} onChangeText={(v) => set('idNumber', v)} placeholder="10 or 17 digit number" keyboardType="number-pad" />
      </FormRow>

      <FormRow label={`${idOption.short} Document`}>
        <Pressable
          style={[styles.uploadRow, draft.idDocumentUri && styles.uploadRowDone]}
          onPress={() => pickImage((uri) => set('idDocumentUri', uri))}>
          <AppText weight="regular" style={styles.uploadRowLabel}>
            {draft.idDocumentUri ? `${idOption.short} document selected` : `Upload ${idOption.short} document`}
          </AppText>
          {draft.idDocumentUri && (
            <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.good} size={11} />
          )}
        </Pressable>
      </FormRow>

      <FormRow label="Instagram">
        <InputBox value={draft.instagramHandle} onChangeText={(v) => set('instagramHandle', v.replace(/^@/, ''))} placeholder="yourhandle" autoCapitalize="none" />
      </FormRow>

      <FormRow label="Other Social Media (optional)">
        <InputBox value={draft.otherSocial} onChangeText={(v) => set('otherSocial', v)} placeholder="TikTok, X, Facebook…" autoCapitalize="none" />
      </FormRow>

      <FormRow label="Gender">
        <Segmented options={GENDER_OPTIONS} value={draft.gender} onChange={(v) => set('gender', v)} />
      </FormRow>

      <View style={styles.formActions}>
        <Button label="Cancel" variant="dark" style={{ flex: 1 }} onPress={onCancel} />
        <Button label="Save Information" style={{ flex: 2 }} onPress={onSave} />
      </View>
    </>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.formRow}>
      <AppText weight="medium" style={styles.fieldLabel}>
        {label.toUpperCase()}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    marginBottom: 20,
  },
  editBtnLabel: { fontSize: 10, color: theme.muted },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(62,213,152,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(62,213,152,0.25)',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 16,
    marginTop: -8,
  },
  savedText: { fontSize: 11, color: theme.good },

  becomeInfluencerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderColor: theme.accent,
    backgroundColor: theme.magentaSoft,
    marginBottom: 20,
  },
  becomeInfluencerTitle: { fontSize: 13, color: theme.primary },
  becomeInfluencerSub: { fontSize: 11, color: theme.muted, marginTop: 2 },
  influencerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    marginBottom: 20,
  },
  influencerRowText: { fontSize: 12.5, color: theme.primary, flex: 1 },
  influencerBadge: { fontSize: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  avatarPhoto: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: theme.border },
  avatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.accent,
  },
  name: { fontSize: 15 },
  photoStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  photoStatus: { fontSize: 10 },

  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  field: { width: '45%' },
  fieldLabel: { fontSize: 9, letterSpacing: 0.8, color: theme.mutedDim, marginBottom: 4 },
  fieldValue: { fontSize: 12.5, color: theme.primary },
  fieldValueMono: { fontSize: 11.5 },
  docStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },

  photoEditRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  photoEditWrap: { position: 'relative' },
  avatarPhotoEdit: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: theme.accent },
  avatarPhotoEditPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.accent,
    borderWidth: 2,
    borderColor: theme.accent,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.accent,
    borderWidth: 2,
    borderColor: theme.void,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEditCopy: { flex: 1, fontSize: 11, color: theme.muted, lineHeight: 16 },

  formRow: { marginBottom: 14 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.border,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  uploadRowDone: { borderStyle: 'solid', borderColor: theme.good },
  uploadRowLabel: { fontSize: 11, color: theme.muted },
});

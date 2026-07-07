import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Segmented, InputBox, Button } from '@/components/ui';
import { ID_TYPE_OPTIONS, GENDER_OPTIONS, emptyProfile, type Profile } from '@/data/profile';
import { useAppStore } from '@/store/AppStore';
import { fonts, theme } from '@/theme';

const TOTAL_STEPS = 6;

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

export default function OnboardingScreen() {
  const { completeOnboarding } = useAppStore();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Profile>(emptyProfile);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function next() {
    if (step === TOTAL_STEPS - 1) {
      completeOnboarding(draft);
      router.replace('/(tabs)/events');
      return;
    }
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  const canContinue = validateStep(step, draft);
  const idOption = ID_TYPE_OPTIONS.find((o) => o.value === draft.idType) ?? ID_TYPE_OPTIONS[0];

  return (
    <Screen>
      <View style={styles.header}>
        {step > 0 ? (
          <Pressable onPress={back} hitSlop={8} style={styles.backBtn}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={theme.muted} size={14} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
          ))}
        </View>
        <View style={styles.backBtn} />
      </View>

      <AppText weight="medium" style={styles.eyebrow}>
        WELCOME TO POSHH · STEP {step + 1} OF {TOTAL_STEPS}
      </AppText>

      <View style={styles.body}>
        {step === 0 && (
          <Step title="What's your name?" sub="As it appears on your ID — this is what gets checked at the gate.">
            <InputBox value={draft.fullName} onChangeText={(v) => set('fullName', v)} placeholder="Mohammad Rahman" autoCapitalize="words" />
          </Step>
        )}

        {step === 1 && (
          <Step title="How do you identify?">
            <Segmented options={GENDER_OPTIONS} value={draft.gender} onChange={(v) => set('gender', v)} />
          </Step>
        )}

        {step === 2 && (
          <Step title="Phone number" sub="For entry updates and gate check-in.">
            <InputBox value={draft.phone} onChangeText={(v) => set('phone', v)} placeholder="+8801XXXXXXXXX" keyboardType="phone-pad" />
          </Step>
        )}

        {step === 3 && (
          <Step title="Verify your identity" sub="Required for every ticket, checked once at the gate.">
            <AppText weight="medium" style={styles.fieldLabel}>
              ID DOCUMENT TYPE
            </AppText>
            <Segmented options={ID_TYPE_OPTIONS} value={draft.idType} onChange={(v) => set('idType', v)} />
            <View style={{ height: 14 }} />
            <AppText weight="medium" style={styles.fieldLabel}>
              {idOption.short.toUpperCase()} NUMBER
            </AppText>
            <InputBox value={draft.idNumber} onChangeText={(v) => set('idNumber', v)} placeholder="10 or 17 digit number" keyboardType="number-pad" />
            <View style={{ height: 14 }} />
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
          </Step>
        )}

        {step === 4 && (
          <Step title="Find you on Instagram">
            <AppText weight="medium" style={styles.fieldLabel}>
              INSTAGRAM
            </AppText>
            <InputBox value={draft.instagramHandle} onChangeText={(v) => set('instagramHandle', v.replace(/^@/, ''))} placeholder="yourhandle" autoCapitalize="none" />
            <View style={{ height: 14 }} />
            <AppText weight="medium" style={styles.fieldLabel}>
              OTHER SOCIAL MEDIA (OPTIONAL)
            </AppText>
            <InputBox value={draft.otherSocial} onChangeText={(v) => set('otherSocial', v)} placeholder="TikTok, X, Facebook…" autoCapitalize="none" />
          </Step>
        )}

        {step === 5 && (
          <Step title="Add a photo" sub="Shown on your ticket and checked at the gate — use a clear, recent photo of your face.">
            <Pressable style={styles.photoPicker} onPress={() => pickImage((uri) => set('photoUri', uri))}>
              {draft.photoUri ? (
                <Image source={{ uri: draft.photoUri }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <SymbolView name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} tintColor={theme.void} size={22} />
                </View>
              )}
              <AppText weight="medium" style={styles.photoPickerLabel}>
                {draft.photoUri ? 'Change photo' : 'Choose a photo'}
              </AppText>
            </Pressable>
          </Step>
        )}
      </View>

      <Button label={step === TOTAL_STEPS - 1 ? "Let's go" : 'Continue'} onPress={next} disabled={!canContinue} style={!canContinue && { opacity: 0.4 }} />
    </Screen>
  );
}

function validateStep(step: number, draft: Profile) {
  switch (step) {
    case 0:
      return draft.fullName.trim().length > 1;
    case 1:
      return !!draft.gender;
    case 2:
      return draft.phone.trim().length > 6;
    case 3:
      return draft.idNumber.trim().length > 4 && !!draft.idDocumentUri;
    case 4:
      return draft.instagramHandle.trim().length > 0;
    case 5:
      return !!draft.photoUri;
    default:
      return true;
  }
}

function Step({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <View>
      <AppText weight="black" style={styles.title}>
        {title}
      </AppText>
      {sub && (
        <AppText weight="regular" style={styles.sub}>
          {sub}
        </AppText>
      )}
      <View style={{ height: 18 }} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 22 },
  backBtn: { width: 26, height: 26, alignItems: 'flex-start', justifyContent: 'center' },
  progressRow: { flexDirection: 'row', gap: 5 },
  progressDot: { width: 18, height: 3, borderRadius: 2, backgroundColor: theme.border },
  progressDotActive: { backgroundColor: theme.accent },
  eyebrow: { fontSize: 10, letterSpacing: 1, color: theme.mutedDim, marginBottom: 18 },
  body: { flex: 1 },
  title: { fontSize: 21, marginBottom: 6, lineHeight: 27 },
  sub: { fontSize: 12.5, color: theme.muted, lineHeight: 18 },
  fieldLabel: { fontSize: 9, letterSpacing: 0.8, color: theme.mutedDim, marginBottom: 6 },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  uploadRowDone: { borderStyle: 'solid', borderColor: theme.good },
  uploadRowLabel: { fontSize: 12, color: theme.muted },
  photoPicker: { alignItems: 'center', marginTop: 6 },
  photoPreview: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: theme.accent, marginBottom: 12 },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  photoPickerLabel: { fontSize: 12, color: theme.accent },
});

import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Polygon } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { getMemberBySlug, FOUND_DISTANCE_METERS } from '@/data/clique';
import { useAppStore } from '@/store/AppStore';
import { theme } from '@/theme';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

export default function MemberFinderScreen() {
  const { slug, cliqueId } = useLocalSearchParams<{ slug: string; cliqueId?: string }>();
  const { cliques } = useAppStore();
  const clique = cliques.find((c) => c.id === cliqueId) ?? cliques[0];
  const member = getMemberBySlug(clique, slug);

  if (!clique || !member) {
    return (
      <Screen>
        <AppText weight="medium" style={{ color: theme.muted }}>
          Couldn't find that clique member.
        </AppText>
      </Screen>
    );
  }

  const found = member.distanceMeters <= FOUND_DISTANCE_METERS;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
        <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={theme.muted} size={13} />
        <AppText weight="medium" style={styles.backLabel}>
          {clique.name}
        </AppText>
      </Pressable>

      <View style={styles.chipRow}>
        {clique.members.map((m) => (
          <Pressable
            key={m.slug}
            onPress={() => router.setParams({ slug: m.slug })}
            style={[
              styles.chip,
              { backgroundColor: m.color },
              m.slug === member.slug ? styles.chipActive : styles.chipInactive,
            ]}>
            <AppText weight="bold" style={styles.chipLabel}>
              {m.initial}
            </AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.center}>
        {found ? <FoundBurst color={member.color} /> : <SeekingArrow color={member.color} bearingDeg={member.bearingDeg} />}

        {found ? (
          <>
            <AppText weight="black" style={styles.foundLabel}>
              FOUND
            </AppText>
            <AppText weight="regular" style={styles.sub}>
              {member.name} is right next to you
            </AppText>
          </>
        ) : (
          <>
            <AppText weight="black" style={styles.distanceLabel}>
              {member.distanceMeters}m
            </AppText>
            <AppText weight="regular" style={styles.sub}>
              Follow the arrow to {member.name}
            </AppText>
          </>
        )}
      </View>
    </Screen>
  );
}

function FoundBurst({ color }: { color: string }) {
  const scale1 = useSharedValue(0.55);
  const scale2 = useSharedValue(0.55);
  const scale3 = useSharedValue(0.55);

  useEffect(() => {
    const cfg = { duration: 1800, easing: Easing.out(Easing.ease) };
    scale1.value = withRepeat(withTiming(1.15, cfg), -1, false);
    scale2.value = withTiming(0.55, { duration: 1 }, () => {
      scale2.value = withRepeat(withTiming(1.15, cfg), -1, false);
    });
    scale3.value = withTiming(0.55, { duration: 1 }, () => {
      scale3.value = withRepeat(withTiming(1.15, cfg), -1, false);
    });
  }, [scale1, scale2, scale3]);

  const ringStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: 1 - (scale1.value - 0.55) / 0.6,
  }));
  const ringStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: 1 - (scale2.value - 0.55) / 0.6,
  }));
  const ringStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
    opacity: 1 - (scale3.value - 0.55) / 0.6,
  }));

  return (
    <View style={styles.burstWrap}>
      <Animated.View style={[styles.burstRing, { borderColor: color }, ringStyle1]} />
      <Animated.View style={[styles.burstRing, { borderColor: color }, ringStyle2]} />
      <Animated.View style={[styles.burstRing, { borderColor: color }, ringStyle3]} />
      <View style={[styles.burstCore, { backgroundColor: color }]}>
        <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.void} size={28} />
      </View>
    </View>
  );
}

function SeekingArrow({ color, bearingDeg }: { color: string; bearingDeg: number }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.55, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);

  const glowProps = useAnimatedProps(() => ({ opacity: pulse.value * 0.3 }));

  return (
    <View style={styles.arrowWrap}>
      <Svg width={140} height={140} viewBox="0 0 140 140">
        <AnimatedPolygon points="70,18 108,110 70,88 32,110" fill={color} animatedProps={glowProps} />
        <Polygon
          points="70,30 100,105 70,85 40,105"
          fill={color}
          transform={`rotate(${bearingDeg} 70 70)`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 18 },
  backLabel: { fontSize: 12, color: theme.muted },
  chipRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 30 },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { opacity: 1 },
  chipInactive: { opacity: 0.4 },
  chipLabel: { fontSize: 12, color: theme.void },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  arrowWrap: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  burstWrap: { width: 108, height: 108, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  burstRing: { position: 'absolute', width: 108, height: 108, borderRadius: 54, borderWidth: 1.5 },
  burstCore: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  foundLabel: { fontSize: 24, letterSpacing: 0.5, marginBottom: 4 },
  distanceLabel: { fontSize: 34, marginBottom: 4 },
  sub: { fontSize: 13, color: theme.muted },
});

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { CliqueMember } from '@/data/clique';
import { FOUND_DISTANCE_METERS } from '@/data/clique';
import { theme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 220;
const CENTER = SIZE / 2;
const MAX_RADIUS = 96;
const MIN_RADIUS = 34;
const FAR_CAP_METERS = 160;
const DIMMED_OPACITY = 0.22;

// Distance maps to how close the arrow sits to the center; bearing maps to
// angle around it. This is a placeholder mapping — Phase 07 of the build
// guide replaces distanceMeters/bearingDeg with live haversine + compass
// values from GPS, smoothed to avoid jitter at close range.
function radiusForDistance(distanceMeters: number) {
  const clamped = Math.min(distanceMeters, FAR_CAP_METERS);
  return MIN_RADIUS + (clamped / FAR_CAP_METERS) * (MAX_RADIUS - MIN_RADIUS);
}

function ArrowMarker({
  member,
  dimmed,
  onPress,
}: {
  member: CliqueMember;
  dimmed: boolean;
  onPress?: () => void;
}) {
  const found = member.distanceMeters <= FOUND_DISTANCE_METERS;
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (found && !dimmed) {
      pulse.value = withRepeat(withTiming(0.4, { duration: 550, easing: Easing.inOut(Easing.ease) }), -1, true);
    }
  }, [found, dimmed, pulse]);

  const baseOpacity = dimmed ? DIMMED_OPACITY : 1;
  const glowProps = useAnimatedProps(() => ({ opacity: (found && !dimmed ? pulse.value : 1) * 0.35 * baseOpacity }));
  const arrowProps = useAnimatedProps(() => ({ opacity: (found && !dimmed ? pulse.value : 1) * baseOpacity }));

  const radius = radiusForDistance(member.distanceMeters);
  const rad = (member.bearingDeg * Math.PI) / 180;
  const x = CENTER + radius * Math.sin(rad);
  const y = CENTER - radius * Math.cos(rad);

  return (
    <>
      {found && <AnimatedCircle cx={x} cy={y} r={15} fill={member.color} animatedProps={glowProps} />}
      {/* Wider invisible hit target so a small dot stays easy to tap */}
      <Circle cx={x} cy={y} r={16} fill="transparent" onPress={onPress} />
      <AnimatedCircle cx={x} cy={y} r={9} fill={member.color} animatedProps={arrowProps} onPress={onPress} />
    </>
  );
}

type RadarProps = {
  members: CliqueMember[];
  dimmedSlugs?: string[];
  onSelectMember?: (member: CliqueMember) => void;
};

export function Radar({ members, dimmedSlugs, onSelectMember }: RadarProps) {
  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle cx={CENTER} cy={CENTER} r={MAX_RADIUS} stroke={theme.border} strokeDasharray="2 5" fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={(MAX_RADIUS + MIN_RADIUS) / 2} stroke={theme.border} fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={MIN_RADIUS} stroke={theme.border} strokeDasharray="2 5" fill="none" />
        {members.map((m) => (
          <ArrowMarker
            key={m.slug}
            member={m}
            dimmed={!!dimmedSlugs?.includes(m.slug)}
            onPress={onSelectMember ? () => onSelectMember(m) : undefined}
          />
        ))}
        <Circle cx={CENTER} cy={CENTER} r={13} stroke={theme.accent} strokeWidth={2} fill="none" opacity={0.7} />
        <Circle cx={CENTER} cy={CENTER} r={7} fill={theme.primary} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
});

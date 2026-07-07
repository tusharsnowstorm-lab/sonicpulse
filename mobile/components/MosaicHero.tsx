import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { AppText } from '@/components/AppText';
import type { CliqueMember } from '@/data/clique';
import { theme } from '@/theme';

// A clique's square hero — a photo the creator uploads, or (when they
// haven't) a mosaic tiling each member's avatar color/initial. Rendered
// client-side from current membership, not a generated image file, so it's
// always accurate and costs nothing to keep up to date. Phase 06 of the
// build guide.
export function MosaicHero({
  heroImage,
  members,
  size,
}: {
  heroImage: ImageSourcePropType | null;
  members: CliqueMember[];
  size: number;
}) {
  if (heroImage) {
    return <Image source={heroImage} style={{ width: size, height: size, borderRadius: 14 }} resizeMode="cover" />;
  }

  const tiles = members.slice(0, 4);

  if (tiles.length === 0) {
    return (
      <View style={[styles.empty, { width: size, height: size }]}>
        <AppText weight="medium" style={styles.emptyText}>
          Waiting on invites
        </AppText>
      </View>
    );
  }

  const gap = 2;
  const tileSize = (size - gap) / 2;

  return (
    <View style={[styles.grid, { width: size, height: size, gap }]}>
      {tiles.map((m) => (
        <View key={m.slug} style={[styles.tile, { width: tileSize, height: tileSize, backgroundColor: m.color }]}>
          <AppText weight="black" style={[styles.tileInitial, { fontSize: tileSize * 0.4 }]}>
            {m.initial}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: theme.void,
  },
  tile: { alignItems: 'center', justifyContent: 'center' },
  tileInitial: { color: 'rgba(5,5,8,0.65)' },
  empty: {
    borderRadius: 14,
    backgroundColor: theme.elevated,
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 11, color: theme.mutedDim },
});

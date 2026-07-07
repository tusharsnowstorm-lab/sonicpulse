import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { theme } from '@/theme';

export function ImageCarousel({ images, size }: { images: ImageSourcePropType[]; size: number }) {
  const [index, setIndex] = useState(0);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(e.nativeEvent.contentOffset.x / size);
    if (next !== index) setIndex(next);
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={[styles.scroller, { width: size, height: size }]}>
        {images.map((src, i) => (
          <Image key={i} source={src} style={{ width: size, height: size }} resizeMode="cover" />
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroller: { borderRadius: 18, overflow: 'hidden' },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.border },
  dotActive: { backgroundColor: theme.accent, width: 14 },
});

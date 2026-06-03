import { Colors } from '@/constants/theme';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export interface Slide {
  id: string;
  brand: string;
  title: string;
  subtitle: string;
  bullets: string[];
  durationSeconds: number;
  image?: ImageSourcePropType;
}

interface SlideCardProps {
  slide: Slide;
}

export function SlideCard({ slide }: SlideCardProps) {
  const shouldShowHeroImage = Boolean(slide.image) && slide.bullets.length === 0;

  if (shouldShowHeroImage) {
    return (
      <View style={[styles.card, styles.heroCard]}>
        <View style={styles.heroImageFrame}>
          <Image source={slide.image} style={styles.heroImage} resizeMode="contain" />
        </View>

        <View pointerEvents="none" style={styles.heroBottomGradient}>
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="callSlideBottomGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="rgba(2, 6, 23, 0)" />
                <Stop offset="0.42" stopColor="rgba(2, 6, 23, 0.06)" />
                <Stop offset="0.74" stopColor="rgba(2, 6, 23, 0.36)" />
                <Stop offset="1" stopColor="rgba(2, 6, 23, 0.76)" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#callSlideBottomGradient)" />
          </Svg>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.textBlock}>
          <Text style={styles.brand}>{slide.brand}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
          <View style={styles.bullets}>
            {slide.bullets.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {slide.image && <Image source={slide.image} style={styles.image} resizeMode="cover" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    flex: 1,
  },
  heroCard: {
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  textBlock: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    gap: 12,
  },
  brand: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: -4,
  },
  bullets: {
    gap: 8,
    marginTop: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  bulletText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  image: {
    width: '45%',
    height: '100%',
  },
  heroImageFrame: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroImage: {
    flex: 1,
    width: '100%',
  },
  heroBottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
  },
});

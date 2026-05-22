import { Colors } from '@/constants/theme';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

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
      <View style={styles.card}>
        <Image source={slide.image} style={styles.heroImage} resizeMode="contain" />
        <View style={styles.heroFooter}>
          <Text style={styles.heroBrand}>{slide.brand}</Text>
          <Text style={styles.heroTitle}>{slide.title}</Text>
          <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
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

        {slide.image && (
          <Image source={slide.image} style={styles.image} resizeMode="cover" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
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
  heroImage: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  heroFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 4,
  },
  heroBrand: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
});

import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { AppButton } from './AppButton';

type HighlightCardVariant = 'light' | 'dark';

interface HighlightCardProps {
  title: string;
  description?: string;
  items?: string[];
  children?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: HighlightCardVariant;
  style?: ViewStyle;
}

export function HighlightCard({
  title,
  description,
  items,
  children,
  actionLabel,
  onAction,
  variant = 'light',
  style,
}: HighlightCardProps) {
  const isDark = variant === 'dark';

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight, style]}>
      <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>{title}</Text>

      {description && (
        <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>
          {description}
        </Text>
      )}

      {items?.map((item) => (
        <Text key={item} style={[styles.text, isDark ? styles.textDark : styles.textLight]}>
          {item}
        </Text>
      ))}

      {children}

      {actionLabel && (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          variant="outline"
          style={styles.button}
          textStyle={styles.buttonText}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 20,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardLight: {
    backgroundColor: Colors.primaryLight,
    shadowColor: Colors.primary,
  },
  cardDark: {
    backgroundColor: Colors.secondary,
    shadowColor: Colors.secondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  titleLight: {
    color: Colors.secondary,
  },
  titleDark: {
    color: Colors.textOnDark,
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
  },
  textLight: {
    color: Colors.text,
  },
  textDark: {
    color: '#DCEBFF',
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.primary,
    borderWidth: 0,
    marginTop: 4,
  },
  buttonText: {
    color: Colors.textOnDark,
    fontWeight: '700',
  },
});

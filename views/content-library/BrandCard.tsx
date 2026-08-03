import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { TeamBrand } from '@/api/content';
import { Colors } from '@/constants/theme';

interface BrandCardProps {
  brand: TeamBrand;
}

/** One brand, expandable to the SKUs assigned under it. */
export function BrandCard({ brand }: BrandCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSkus = brand.skus.length > 0;

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => hasSkus && setIsExpanded((expanded) => !expanded)}
        style={({ pressed }) => [styles.headerRow, pressed && hasSkus && styles.pressed]}
      >
        <View style={styles.iconBubble}>
          <Ionicons name="medkit-outline" size={20} color={Colors.primary} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.brandName}>{brand.brandName}</Text>
          <Text style={styles.brandMeta}>
            {hasSkus
              ? `${brand.skus.length} SKU${brand.skus.length === 1 ? '' : 's'}`
              : 'Brand-wise content'}
            {' · '}
            {brand.slideCount} slide{brand.slideCount === 1 ? '' : 's'}
          </Text>
        </View>

        {hasSkus ? (
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.primary}
          />
        ) : null}
      </Pressable>

      {isExpanded && hasSkus ? (
        <View style={styles.skuList}>
          {brand.skus.map((sku) => (
            <View key={`${brand.brandName}-${sku.skuName}`} style={styles.skuRow}>
              <Ionicons name="ellipse" size={7} color={Colors.primary} />
              <Text style={styles.skuName}>{sku.skuName}</Text>
              <Text style={styles.skuMeta}>
                {sku.slideCount} slide{sku.slideCount === 1 ? '' : 's'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  brandMeta: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  skuList: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
  },
  skuName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  skuMeta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});

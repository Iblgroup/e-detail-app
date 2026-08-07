import { useDeferredValue, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { useTeamBrands, type TeamBrand } from '@/api/content';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { BrandCard } from './BrandCard';

/**
 * What the rep details on: every brand assigned to their team, with the SKUs
 * under it. Browsing only — the live call still drives slides from the doctor's
 * specialty forcing.
 */
export default function ContentLibrary() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const brandsQuery = useTeamBrands(user?.teamId);

  // Three tiles across on a tablet/desktop, down to one on a phone.
  const columns = width >= 1000 ? 3 : width >= 640 ? 2 : 1;

  const brands = useMemo<TeamBrand[]>(() => {
    const all = brandsQuery.data ?? [];
    const search = deferredSearchQuery.toLowerCase();
    if (!search) return all;

    // Match on the brand or any of its SKUs, and when the hit is on a SKU show
    // only the SKUs that matched.
    return all
      .map((brand) => {
        if (brand.brandName.toLowerCase().includes(search)) return brand;
        const skus = brand.skus.filter((sku) =>
          sku.skuName.toLowerCase().includes(search)
        );
        return skus.length > 0 ? { ...brand, skus } : null;
      })
      .filter((brand): brand is TeamBrand => brand !== null);
  }, [brandsQuery.data, deferredSearchQuery]);

  const skuCount = useMemo(
    () => brands.reduce((total, brand) => total + brand.skus.length, 0),
    [brands]
  );

  // Tiles flex to fill their column, so a half-empty last row would stretch one
  // card across the grid. Pad it out with invisible spacers instead.
  const gridItems = useMemo<(TeamBrand | null)[]>(() => {
    if (columns === 1 || brands.length === 0) return brands;
    const remainder = brands.length % columns;
    if (remainder === 0) return brands;
    return [...brands, ...Array<null>(columns - remainder).fill(null)];
  }, [brands, columns]);

  return (
    <ScreenLayout title="View Content" subtitle={user?.team} scrollable={false} showBack>
      <FlatList
        // Changing numColumns needs a fresh list instance.
        key={`columns-${columns}`}
        data={gridItems}
        keyExtractor={(brand, position) => brand?.brandName ?? `spacer-${position}`}
        renderItem={({ item }) =>
          item ? <BrandCard brand={item} /> : <View style={styles.spacer} />
        }
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppSearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search brand or SKU"
            />

            {brandsQuery.isLoading ? (
              <View style={styles.stateCard}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.stateTitle}>Loading content...</Text>
              </View>
            ) : null}

            {brandsQuery.isError ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>Unable to load content</Text>
                <Text style={styles.stateText}>
                  {brandsQuery.error instanceof Error
                    ? brandsQuery.error.message
                    : 'Unknown error'}
                </Text>
              </View>
            ) : null}

            {!brandsQuery.isLoading && !brandsQuery.isError && brands.length === 0 ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>No content assigned</Text>
                <Text style={styles.stateText}>
                  {deferredSearchQuery
                    ? 'No brand or SKU matches this search.'
                    : 'No brands have been assigned to your team yet.'}
                </Text>
              </View>
            ) : null}

            {brands.length > 0 ? (
              <Text style={styles.summaryText}>
                {brands.length} brand{brands.length === 1 ? '' : 's'} · {skuCount} SKU
                {skuCount === 1 ? '' : 's'}
              </Text>
            ) : null}
          </View>
        }
        ListFooterComponent={<View style={styles.footerSpacer} />}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
  },
  row: {
    gap: 12,
  },
  spacer: {
    flex: 1,
  },
  header: {
    gap: 12,
    paddingBottom: 4,
  },
  stateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 6,
    alignItems: 'center',
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  stateText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  footerSpacer: {
    height: 24,
  },
});

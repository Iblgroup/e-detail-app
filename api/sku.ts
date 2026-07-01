import { useQuery } from '@tanstack/react-query';
import axios from '@/config/axios';

interface SkuRow {
  TeamId?: number;
  'Product/SkuName'?: string;
}

interface SkuResponse {
  success: boolean;
  count: number;
  data: SkuRow[];
}

export const teamSkusKey = (teamId?: number) =>
  ['team-skus', teamId ?? 'no-team'] as const;

const getSkus = async (): Promise<SkuResponse> => {
  return axios.get('/sku') as unknown as Promise<SkuResponse>;
};

/**
 * Distinct SKU names for a team. The sync seeds this cache (offline-first); the
 * queryFn is only a fallback for the rare case it isn't seeded yet.
 */
export const useTeamSkus = (teamId?: number) => {
  return useQuery({
    queryKey: teamSkusKey(teamId),
    queryFn: async (): Promise<string[]> => {
      const response = await getSkus();
      const names = (response.data ?? [])
        .filter((row) => row.TeamId === teamId)
        .map((row) => (row['Product/SkuName'] ?? '').trim())
        .filter(Boolean);
      return [...new Set(names)];
    },
    enabled: Boolean(teamId),
  });
};

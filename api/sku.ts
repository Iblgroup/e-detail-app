import { useQuery } from '@tanstack/react-query';
import axios from '@/config/axios';

interface TeamSkusResponse {
  success: boolean;
  count: number;
  data: string[];
}

export const teamSkusKey = (teamId?: number) =>
  ['team-skus', teamId ?? 'no-team'] as const;

const getTeamSkus = async (teamId: number): Promise<string[]> => {
  const response = (await axios.get('/sku', {
    params: { teamId },
  })) as unknown as TeamSkusResponse;
  return response.data ?? [];
};

/**
 * Distinct SKU names for a team (the call summary "Samples Provided" picker).
 * The sync also seeds this cache under the same key so it's available offline.
 */
export const useTeamSkus = (teamId?: number) => {
  return useQuery({
    queryKey: teamSkusKey(teamId),
    queryFn: () => getTeamSkus(teamId as number),
    enabled: Boolean(teamId),
  });
};

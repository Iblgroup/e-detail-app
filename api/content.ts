import { useQuery } from '@tanstack/react-query';
import axios from '@/config/axios';
import { ApiEndpoints } from '@/api/endpoints';

export interface ForcingContentRow {
  team_id: number;
  team_name: string;
  spec_id: number;
  specility_name: string;
  sku_name: string;
  url: string;
  status: string;
  forcing: number | null;
  duration: string | null;
}

export interface ForcingContentResponse {
  success: boolean;
  count: number;
  teamId: number;
  doctorSpecId: number;
  forcingSpecIds: number[];
  data: ForcingContentRow[];
}

interface ForcingContentParams {
  teamId?: number;
  doctorSpecId?: number;
}

function parseDurationSeconds(duration: string | null | undefined) {
  const match = String(duration ?? '').match(/(\d+)/);
  const seconds = match ? Number(match[1]) : 10;
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 10;
}

function normalizeAssetUrl(url: string) {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl || !url) {
    return url;
  }

  try {
    const apiOrigin = new URL(apiBaseUrl).origin;
    const assetUrl = new URL(url);

    if (assetUrl.hostname === 'localhost' || assetUrl.hostname === '127.0.0.1') {
      return `${apiOrigin}${assetUrl.pathname}${assetUrl.search}`;
    }

    return url;
  } catch {
    return url;
  }
}

const getForcingContent = async ({
  teamId,
  doctorSpecId,
}: ForcingContentParams): Promise<ForcingContentResponse> => {
  return axios.get(ApiEndpoints.forcingContent, {
    params: {
      teamId,
      doctorSpecId,
    },
  }) as unknown as Promise<ForcingContentResponse>;
};

export interface DoctorCallSlide {
  id: string;
  brand: string;
  title: string;
  subtitle: string;
  bullets: string[];
  durationSeconds: number;
  image?: { uri: string };
}

export const useForcingSlides = ({ teamId, doctorSpecId }: ForcingContentParams) => {
  return useQuery({
    queryKey: ['forcing-content', teamId ?? 'no-team', doctorSpecId ?? 'no-spec'],
    queryFn: () => getForcingContent({ teamId, doctorSpecId }),
    enabled: Boolean(teamId && doctorSpecId),
    staleTime: 5 * 60 * 1000,
    select: (response): DoctorCallSlide[] =>
      response.data.map((row, index) => ({
        id: `${row.sku_name}-${row.forcing ?? index}-${index}`,
        brand: row.team_name || 'Searle Pharmaceuticals',
        title: row.sku_name || 'Forcing Content',
        subtitle: row.specility_name || 'Doctor Call',
        bullets: [],
        durationSeconds: parseDurationSeconds(row.duration),
        image: { uri: normalizeAssetUrl(row.url) },
      })),
  });
};

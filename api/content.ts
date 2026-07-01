import { useQuery } from '@tanstack/react-query';
import axios from '@/config/axios';
import { ApiEndpoints } from '@/api/endpoints';
import { API_BASE_URL } from '@/config/api-base-url';
import { resolveCachedImage } from '@/lib/offline/imageCache';

export interface ForcingContentRow {
  team_id: number;
  team_name: string;
  spec_id: number;
  specility_name: string;
  sku_name: string;
  brand_name?: string;
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

export function normalizeAssetUrl(url: string) {
  const rawUrl = String(url ?? '').trim();
  if (!API_BASE_URL || !rawUrl) {
    return rawUrl;
  }

  try {
    const apiOrigin = new URL(API_BASE_URL).origin;
    const sanitizedUrl = rawUrl.replace(/\\/g, '/');
    const assetUrl = new URL(sanitizedUrl, apiOrigin);
    const uploadPathIndex = assetUrl.pathname.toLowerCase().indexOf('/uploads/');

    if (assetUrl.hostname === 'localhost' || assetUrl.hostname === '127.0.0.1') {
      return `${apiOrigin}${encodeURI(assetUrl.pathname)}${assetUrl.search}`;
    }

    if (uploadPathIndex >= 0 && !/^(https?:)?\/\//i.test(sanitizedUrl)) {
      const uploadPath = assetUrl.pathname.slice(uploadPathIndex);
      return `${apiOrigin}${encodeURI(uploadPath)}${assetUrl.search}`;
    }

    return assetUrl.toString();
  } catch {
    return rawUrl;
  }
}

export const forcingContentKey = (
  teamId?: number,
  doctorSpecId?: number,
) => ['forcing-content', teamId ?? 'no-team', doctorSpecId ?? 'no-spec'] as const;

export const getForcingContent = async ({
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

function numericPriority(value: number | null | undefined) {
  return Number.isFinite(Number(value)) ? Number(value) : Number.MAX_SAFE_INTEGER;
}

function sortForcingRows(rows: ForcingContentRow[]) {
  const groupPriorityBySku = new Map<string, number>();

  rows.forEach((row) => {
    const priority = numericPriority(row.forcing);
    const current = groupPriorityBySku.get(row.sku_name);
    if (current == null || priority < current) {
      groupPriorityBySku.set(row.sku_name, priority);
    }
  });

  return [...rows].sort((left, right) => {
    const leftGroup = groupPriorityBySku.get(left.sku_name) ?? Number.MAX_SAFE_INTEGER;
    const rightGroup = groupPriorityBySku.get(right.sku_name) ?? Number.MAX_SAFE_INTEGER;
    if (leftGroup !== rightGroup) {
      return leftGroup - rightGroup;
    }

    const leftPriority = numericPriority(left.forcing);
    const rightPriority = numericPriority(right.forcing);
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    const leftUrl = left.url ?? '';
    const rightUrl = right.url ?? '';
    return leftUrl.localeCompare(rightUrl);
  });
}

export const useForcingSlides = ({ teamId, doctorSpecId }: ForcingContentParams) => {
  return useQuery({
    queryKey: forcingContentKey(teamId, doctorSpecId),
    queryFn: () => getForcingContent({ teamId, doctorSpecId }),
    enabled: Boolean(teamId && doctorSpecId),
    staleTime: 5 * 60 * 1000,
    select: (response): DoctorCallSlide[] =>
      sortForcingRows(response.data)
        .map((row, index) => ({
        id: `${row.sku_name}-${row.forcing ?? index}-${index}`,
        brand: row.team_name || 'Searle Pharmaceuticals',
        title: row.brand_name || row.sku_name || 'Forcing Content',
        subtitle: row.sku_name || row.specility_name || 'Doctor Call',
        bullets: [],
        durationSeconds: parseDurationSeconds(row.duration),
        // Use the on-device copy when available so slides play offline.
        image: { uri: resolveCachedImage(normalizeAssetUrl(row.url)) ?? '' },
      })),
  });
};

/** Image URLs (as the slides will request them) for a forcing response. */
export function forcingImageUrls(response: ForcingContentResponse): string[] {
  return response.data
    .map((row) => normalizeAssetUrl(row.url))
    .filter(Boolean);
}


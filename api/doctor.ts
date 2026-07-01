import { useInfiniteQuery } from '@tanstack/react-query';
import axios from '@/config/axios';
import { ApiEndpoints } from '@/api/endpoints';

export interface DoctorDataRow {
  TEAMID?: number;
  MieSasId?: number;
  MieName?: string;
  DOCTORID?: number;
  DOCTORNAME?: string;
  SpecialtyId?: number;
  SpecialtyByCommercial?: string;
  SpecialtyByIkon?: string;
  CITY?: string;
}

export interface DoctorDataResponse {
  success: boolean;
  count: number;
  totalCount: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  source?: string;
  data: DoctorDataRow[];
}

interface DoctorQueryParams {
  mieId?: string;
  teamId?: number;
  query?: string;
}

interface DoctorRequestParams extends DoctorQueryParams {
  offset?: number;
  limit?: number;
}

const PAGE_SIZE = 30;
// A rep's planned doctors for the day is a bounded set, so fetch it all in one
// page. This keeps it fully available offline (no "load more" that fails with
// no network) and matches what the sync caches.
const PLANNED_PAGE_SIZE = 500;
// Same idea for the team's unplanned doctor pool (capped for offline caching).
const DOCTORS_PAGE_SIZE = 500;

export const doctorsKey = (teamId?: number, mieId?: string, query?: string) =>
  [
    'doctors',
    teamId ?? 'no-team',
    mieId ?? 'no-mie',
    query ?? 'no-query',
  ] as const;

const getDoctors = async ({
  mieId,
  teamId,
  query,
  offset = 0,
  limit = PAGE_SIZE,
}: DoctorRequestParams): Promise<DoctorDataResponse> => {
  return axios.get(ApiEndpoints.doctors, {
    params: {
      mieId,
      teamId,
      q: query,
      offset,
      limit,
    },
  }) as unknown as Promise<DoctorDataResponse>;
};

export const plannedDoctorsKey = (
  teamId?: number,
  mieId?: string,
  query?: string,
) =>
  [
    'planned-doctors',
    teamId ?? 'no-team',
    mieId ?? 'no-mie',
    query ?? 'no-query',
  ] as const;

export const getPlannedDoctors = async ({
  mieId,
  teamId,
  query,
  offset = 0,
  limit = PAGE_SIZE,
}: DoctorRequestParams): Promise<DoctorDataResponse> => {
  return axios.get(ApiEndpoints.plannedDoctors, {
    params: {
      mieId,
      teamId,
      q: query,
      offset,
      limit,
    },
  }) as unknown as Promise<DoctorDataResponse>;
};

export const plannedDoctorsPageParams = {
  initialPageParam: 0,
  getNextPageParam: (lastPage: DoctorDataResponse) =>
    lastPage.hasMore ? lastPage.offset + lastPage.count : undefined,
};

export const useInfiniteDoctors = ({ mieId, teamId, query }: DoctorQueryParams) => {
  return useInfiniteQuery({
    queryKey: doctorsKey(teamId, mieId, query),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getDoctors({
        mieId,
        teamId,
        query,
        offset: pageParam,
        limit: DOCTORS_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.count : undefined,
    enabled: Boolean(teamId) && (Boolean(mieId) || mieId === undefined),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInfinitePlannedDoctors = ({ mieId, teamId, query }: DoctorQueryParams) => {
  return useInfiniteQuery({
    queryKey: plannedDoctorsKey(teamId, mieId, query),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getPlannedDoctors({
        mieId,
        teamId,
        query,
        offset: pageParam,
        limit: PLANNED_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.count : undefined,
    enabled: Boolean(teamId && mieId),
    staleTime: 5 * 60 * 1000,
  });
};

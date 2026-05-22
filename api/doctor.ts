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

const getPlannedDoctors = async ({
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

export const useInfiniteDoctors = ({ mieId, teamId, query }: DoctorQueryParams) => {
  return useInfiniteQuery({
    queryKey: ['doctors', teamId ?? 'no-team', mieId ?? 'no-mie', query ?? 'no-query'],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getDoctors({
        mieId,
        teamId,
        query,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.count : undefined,
    enabled: Boolean(teamId) && (Boolean(mieId) || mieId === undefined),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInfinitePlannedDoctors = ({ mieId, teamId, query }: DoctorQueryParams) => {
  return useInfiniteQuery({
    queryKey: ['planned-doctors', teamId ?? 'no-team', mieId ?? 'no-mie', query ?? 'no-query'],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getPlannedDoctors({
        mieId,
        teamId,
        query,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.count : undefined,
    enabled: Boolean(teamId && mieId),
    staleTime: 5 * 60 * 1000,
  });
};

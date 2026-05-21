import { useQuery } from '@tanstack/react-query';
import axios from '@/config/axios';
import { ApiEndpoints } from '@/api/endpoints';
import { QueryKeys } from '@/constants/query-keys';

export type MasterDataRecord = Record<string, unknown>;

export interface FieldForceHierarchyRow extends MasterDataRecord {
  BUID?: number;
  BU?: string;
  TEAMID?: number;
  TEAMNAME?: string;
  NSMID?: number;
  NSM?: string;
  NSM_SAP_ID?: number;
  SMID?: number;
  SM?: string;
  SM_SAP_ID?: number;
  RMID?: number;
  RM?: string;
  RM_SAP_ID?: number;
  MIE_ID?: number;
  MIE_NAME?: string;
  MIE_SAP_ID?: number;
  MIE_BASE?: string;
  MIE_MOBILE_NO?: string;
  MIE_DOJ?: string;
}

export interface MasterDataResponse<T = MasterDataRecord> {
  success: boolean;
  count: number;
  data: T[];
  teams?: string[];
}

const getFieldForceHierarchy = async (): Promise<MasterDataResponse<FieldForceHierarchyRow>> => {
  return axios.get(ApiEndpoints.fieldForceHierarchy) as unknown as Promise<
    MasterDataResponse<FieldForceHierarchyRow>
  >;
};

export const useGetFieldForceHierarchy = () => {
  return useQuery({
    queryKey: [QueryKeys.fieldForceHierarchy],
    queryFn: getFieldForceHierarchy,
    staleTime: 5 * 60 * 1000,
  });
};

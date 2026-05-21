export const QueryKeys = {
  fieldForceHierarchy: 'fieldForceHierarchy',
} as const;

export type QueryKey = (typeof QueryKeys)[keyof typeof QueryKeys];

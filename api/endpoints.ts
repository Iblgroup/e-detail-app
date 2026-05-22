export const ApiEndpoints = {
  fieldForceHierarchy: '/master-data/teams',
  doctors: '/doctor',
  plannedDoctors: '/doctor/planned',
  forcingContent: '/content/forcing',
} as const;

export type ApiEndpoints = typeof ApiEndpoints;

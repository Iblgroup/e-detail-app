export const ApiEndpoints = {
  doctors: '/doctor',
  plannedDoctors: '/doctor/planned',
  forcingContent: '/content/forcing',
  specialties: '/content/specialties',
  syncDaily: '/sync/daily',
} as const;

export type ApiEndpoints = typeof ApiEndpoints;

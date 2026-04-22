import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui } from '@tamagui/core';

const config = createTamagui(defaultConfig);

export type AppConfig = typeof config;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;

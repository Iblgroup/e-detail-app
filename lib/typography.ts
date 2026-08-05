import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { StyleSheet, Text, TextInput, type TextStyle } from 'react-native';

/** Passed straight to `useFonts` in the root layout. */
export const AppFonts = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
};

/**
 * Custom fonts don't synthesize weights — each weight is its own family — so a
 * style saying `fontWeight: '800'` would silently render Regular. Map the weight
 * onto the matching Inter family instead. Weights we didn't load round to the
 * nearest one we did.
 */
const FAMILY_BY_WEIGHT: Record<string, string> = {
  '100': 'Inter_400Regular',
  '200': 'Inter_400Regular',
  '300': 'Inter_400Regular',
  '400': 'Inter_400Regular',
  normal: 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
  bold: 'Inter_700Bold',
  '800': 'Inter_800ExtraBold',
  '900': 'Inter_800ExtraBold',
};

function familyForWeight(weight: TextStyle['fontWeight']) {
  if (weight == null) return 'Inter_400Regular';
  return FAMILY_BY_WEIGHT[String(weight)] ?? 'Inter_400Regular';
}

let applied = false;

/**
 * Make Inter the app-wide default for every <Text> and <TextInput>, without
 * touching a single StyleSheet.
 *
 * React 19 dropped `defaultProps` on function components, so the usual
 * `Text.defaultProps.style = …` trick no longer works — this wraps the render
 * instead, injecting the weight-matched family UNDER the caller's own style so
 * any explicit `fontFamily` still wins.
 */
export function applyAppFont() {
  if (applied) return;
  applied = true;

  for (const Component of [Text, TextInput] as any[]) {
    const originalRender = Component.render;
    if (typeof originalRender !== 'function') continue;

    Component.render = function patchedRender(props: any, ref: unknown) {
      const flattened = (StyleSheet.flatten(props?.style) ?? {}) as TextStyle;

      return originalRender.call(
        this,
        {
          ...props,
          style: [{ fontFamily: familyForWeight(flattened.fontWeight) }, props?.style],
        },
        ref,
      );
    };
  }
}

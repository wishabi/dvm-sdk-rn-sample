import type { RenderType } from '@flipp/dvm-sdk-native';

export const RENDER_TYPE_LABELS: Record<RenderType, string> = {
  dvm_template: 'DVM Template',
  dvm_static: 'DVM Static',
  sfml_vertical: 'SFML',
  sfml_horizontal: 'SFML Horizontal',
};

/** Render types every publication card offers (greyed out when unsupported). */
export const CARD_RENDER_TYPES: readonly RenderType[] = [
  'dvm_template',
  'dvm_static',
  'sfml_vertical',
];

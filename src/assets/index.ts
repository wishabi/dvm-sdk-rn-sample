import type { ImageSourcePropType } from 'react-native';

/** Bitmap assets rasterized from the Figma prototype. */
export const images = {
  logo: require('./logo.png') as ImageSourcePropType,
  back: require('./icon-back.png') as ImageSourcePropType,
  search: require('./icon-search.png') as ImageSourcePropType,
  copy: require('./icon-copy.png') as ImageSourcePropType,
  close: require('./icon-close.png') as ImageSourcePropType,
  chevron: require('./icon-chevron.png') as ImageSourcePropType,
};

export type IconName = Exclude<keyof typeof images, 'logo'>;

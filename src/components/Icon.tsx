import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { images, type IconName } from '../assets';
import { colors } from '../theme';

export function Icon({
  name,
  size = 24,
  color = colors.textMuted,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={images[name]}
      style={[{ width: size, height: size, tintColor: color }, style]}
      resizeMode="contain"
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

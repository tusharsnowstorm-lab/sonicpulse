import { Text, type TextProps } from 'react-native';
import { fonts, theme } from '@/theme';

type Weight = keyof typeof fonts;

type AppTextProps = TextProps & {
  weight?: Weight;
};

export function AppText({ weight = 'regular', style, ...rest }: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[{ fontFamily: fonts[weight], color: theme.primary }, style]}
    />
  );
}

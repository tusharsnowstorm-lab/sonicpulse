import { Pressable, StyleSheet, View, type PressableProps, type ViewProps } from 'react-native';
import { AppText } from '@/components/AppText';
import { fonts, theme } from '@/theme';

export function Card({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.card, style]} />;
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <AppText weight="medium" style={styles.sectionLabel}>
      {children.toUpperCase()}
    </AppText>
  );
}

type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'outline' | 'dark';
};

export function Button({ label, variant = 'primary', style, ...rest }: ButtonProps) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && { backgroundColor: theme.accent },
        variant === 'outline' && { backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.accent },
        variant === 'dark' && { backgroundColor: '#101014', borderWidth: 1, borderColor: '#2a2a32' },
        pressed && { opacity: 0.85 },
        typeof style === 'function' ? undefined : style,
      ]}>
      <AppText
        weight="bold"
        style={[
          styles.buttonLabel,
          variant === 'primary' && { color: theme.void },
          variant === 'outline' && { color: theme.accent },
          variant === 'dark' && { color: '#fff' },
        ]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 16,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.2,
    color: theme.mutedDim,
    marginBottom: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
  },
  buttonLabel: {
    fontSize: 13,
  },
});

import { Pressable, StyleSheet, TextInput, View, type PressableProps, type ViewProps } from 'react-native';
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

type SegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View style={styles.segmentedRow}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.segmentActive]}>
            <AppText weight="medium" style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function InputBox({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}) {
  return (
    <View style={styles.inputBox}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedDim}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        style={styles.inputText}
      />
    </View>
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
  segmentedRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.elevated,
  },
  segmentActive: {
    borderColor: theme.accent,
    backgroundColor: theme.magentaSoft,
  },
  segmentLabel: {
    fontSize: 11,
    color: theme.muted,
  },
  segmentLabelActive: {
    color: theme.accent,
  },
  inputBox: {
    backgroundColor: theme.elevated,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: theme.primary,
    padding: 0,
  },
});

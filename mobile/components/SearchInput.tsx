import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { fonts, theme } from '@/theme';

export function SearchInput(props: TextInputProps) {
  return (
    <View style={styles.wrap}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        tintColor={theme.muted}
        size={14}
      />
      <TextInput
        placeholder="Search by name"
        placeholderTextColor={theme.muted}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.elevated,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: theme.primary,
    padding: 0,
  },
});

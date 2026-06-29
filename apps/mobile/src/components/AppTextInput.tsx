import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme';

interface AppTextInputProps extends TextInputProps {
  label: string;
}

export const AppTextInput = ({ label, ...props }: AppTextInputProps) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#9ca3af" style={styles.input} {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 8
  },
  label: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 13
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 15
  }
});

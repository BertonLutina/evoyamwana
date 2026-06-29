import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const AppButton = ({ title, onPress, loading = false, variant = 'primary' }: AppButtonProps) => {
  return (
    <Pressable disabled={loading} onPress={onPress} style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed]}>
      {loading ? <ActivityIndicator color={variant === 'ghost' ? colors.blue : colors.white} /> : <Text style={[styles.text, variant === 'ghost' && styles.ghostText]}>{title}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18
  },
  primary: {
    backgroundColor: colors.blue
  },
  secondary: {
    backgroundColor: colors.orange
  },
  ghost: {
    backgroundColor: colors.sky
  },
  text: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15
  },
  ghostText: {
    color: colors.blue
  },
  pressed: {
    opacity: 0.8
  }
});

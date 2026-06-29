import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export const LoadingState = ({ label = 'Loading...' }: { label?: string }) => (
  <View style={styles.box}>
    <ActivityIndicator color={colors.blue} />
    <Text style={styles.text}>{label}</Text>
  </View>
);

export const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <View style={styles.box}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.text}>{description}</Text>
  </View>
);

export const ErrorMessage = ({ message }: { message: string }) => {
  if (!message) return null;
  return (
    <View style={[styles.box, styles.error]}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line
  },
  error: {
    backgroundColor: '#fff1ed',
    borderColor: '#fed7cc'
  },
  title: {
    color: colors.ink,
    fontWeight: '900',
    fontSize: 16
  },
  text: {
    color: colors.muted,
    lineHeight: 21
  },
  errorText: {
    color: colors.danger,
    fontWeight: '700'
  }
});

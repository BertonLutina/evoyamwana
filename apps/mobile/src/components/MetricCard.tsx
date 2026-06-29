import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export const MetricCard = ({ label, value, accent = colors.blue }: { label: string; value: string; accent?: string }) => (
  <View style={styles.card}>
    <View style={[styles.dot, { backgroundColor: accent }]} />
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16
  },
  dot: {
    width: 26,
    height: 6,
    borderRadius: 99,
    marginBottom: 14
  },
  label: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: 12
  },
  value: {
    marginTop: 8,
    color: colors.ink,
    fontWeight: '900',
    fontSize: 26
  }
});

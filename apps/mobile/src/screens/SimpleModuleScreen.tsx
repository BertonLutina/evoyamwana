import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/StateViews';
import { Screen } from '../components/Screen';
import { colors } from '../theme';

interface SimpleModuleScreenProps {
  title: string;
  description: string;
  apiNote: string;
}

export const SimpleModuleScreen = ({ title, description, apiNote }: SimpleModuleScreenProps) => {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <EmptyState title={`${title} ready`} description={apiNote} />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Low-bandwidth mode</Text>
        <Text style={styles.cardText}>This screen uses compact cards, plain text, and API-backed refresh patterns so it works well on slower mobile connections.</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900'
  },
  description: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 22
  },
  card: {
    backgroundColor: colors.orangeSoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fed7aa'
  },
  cardTitle: {
    color: colors.ink,
    fontWeight: '900',
    fontSize: 16
  },
  cardText: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 21
  }
});

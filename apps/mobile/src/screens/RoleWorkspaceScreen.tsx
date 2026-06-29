import type { UserRole } from '@evoyamwana/shared';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const roleLabels: Partial<Record<UserRole, string>> = {
  DIRECTOR: 'Director workspace',
  SECRETARY: 'Secretary desk',
  ACCOUNTANT: 'Finance workspace',
  CLASS_TUTOR: 'Class tutor workspace'
};

const roleTasks: Partial<Record<UserRole, Array<{ title: string; detail: string }>>> = {
  DIRECTOR: [
    { title: 'School pulse', detail: 'Monitor classes, families, staff, attendance, and pending payments.' },
    { title: 'Operational follow-up', detail: 'Use the mobile lists to check records before a meeting or campus walk.' }
  ],
  SECRETARY: [
    { title: 'Front office', detail: 'Keep students, parents, classes, and staff details close at hand.' },
    { title: 'Family support', detail: 'Search parents quickly before calls or document pickup.' }
  ],
  ACCOUNTANT: [
    { title: 'Payment follow-up', detail: 'Review pending fees and payer context from the dashboard API.' },
    { title: 'Low-bandwidth checks', detail: 'Use compact cards for quick reconciliation while away from desk.' }
  ],
  CLASS_TUTOR: [
    { title: 'Class ownership', detail: 'Open assigned classes, attendance, and learner records from the same mobile workspace.' },
    { title: 'Daily routine', detail: 'Keep registers and class context available during school hours.' }
  ]
};

export const RoleWorkspaceScreen = () => {
  const { user } = useAuth();
  const role = user?.role ?? 'SCHOOL_ADMIN';
  const tasks = roleTasks[role] ?? [
    { title: 'Shared workspace', detail: 'Use the mobile modules available for your school role.' },
    { title: 'Connected data', detail: 'Screens read from the same authenticated API as the rest of EVOYAMWANA.' }
  ];

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{role}</Text>
        <Text style={styles.title}>{roleLabels[role] ?? 'Role workspace'}</Text>
        <Text style={styles.subtitle}>{user?.fullName ?? 'Staff member'} · Mobile operations</Text>
      </View>
      <View style={styles.list}>
        {tasks.map((task) => (
          <View key={task.title} style={styles.card}>
            <View style={styles.marker} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{task.title}</Text>
              <Text style={styles.cardText}>{task.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.blueDark,
    borderRadius: 24,
    padding: 22,
    gap: 8
  },
  kicker: { color: colors.orange, fontWeight: '900', fontSize: 12 },
  title: { color: colors.white, fontSize: 30, lineHeight: 36, fontWeight: '900' },
  subtitle: { color: '#dbeafe', lineHeight: 21 },
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line
  },
  marker: { width: 6, borderRadius: 99, backgroundColor: colors.orange },
  cardBody: { flex: 1, gap: 6 },
  cardTitle: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  cardText: { color: colors.muted, lineHeight: 21 }
});

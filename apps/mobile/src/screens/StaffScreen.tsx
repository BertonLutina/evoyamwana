import type { TeacherDto } from '@evoyamwana/shared';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { teachersApi } from '../api/teachers';
import { AppTextInput } from '../components/AppTextInput';
import { EmptyState, ErrorMessage, LoadingState } from '../components/StateViews';
import { Screen } from '../components/Screen';
import { colors } from '../theme';

export const StaffScreen = () => {
  const [search, setSearch] = useState('');
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setTeachers((await teachersApi.list(search)).teachers);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load staff');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <Screen>
      <Text style={styles.title}>Staff</Text>
      <Text style={styles.subtitle}>Teacher directory for director and secretary mobile workflows.</Text>
      <AppTextInput label="Search" value={search} onChangeText={setSearch} placeholder="Name, email, employee number" />
      <ErrorMessage message={error} />
      {loading ? <LoadingState label="Loading staff..." /> : null}
      {!loading && !teachers.length ? <EmptyState title="No staff found" description="Teachers will appear here from the shared backend API." /> : null}
      <View style={styles.list}>
        {teachers.map((teacher) => (
          <View key={teacher.id} style={styles.card}>
            <View style={styles.topLine}>
              <Text style={styles.name}>{teacher.firstName} {teacher.lastName}</Text>
              <Text style={styles.number}>{teacher.employeeNumber}</Text>
            </View>
            <Text style={styles.meta}>{teacher.user?.email ?? 'No email'} · {teacher.phone ?? 'No phone'}</Text>
            <View style={styles.stats}>
              <Text style={styles.stat}>{teacher.classes?.length ?? 0} classes</Text>
              <Text style={styles.stat}>{teacher.subjects?.length ?? 0} subjects</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.muted, lineHeight: 21 },
  list: { gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 9
  },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  name: { flex: 1, color: colors.ink, fontSize: 17, fontWeight: '900' },
  number: { color: colors.orange, fontWeight: '900', fontSize: 12 },
  meta: { color: colors.muted, lineHeight: 20 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: {
    overflow: 'hidden',
    color: colors.blue,
    backgroundColor: colors.sky,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: '800'
  }
});

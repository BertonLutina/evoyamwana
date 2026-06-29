import type { ClassDto } from '@evoyamwana/shared';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { classesApi } from '../api/classes';
import { AppTextInput } from '../components/AppTextInput';
import { EmptyState, ErrorMessage, LoadingState } from '../components/StateViews';
import { Screen } from '../components/Screen';
import { colors } from '../theme';

export const ClassesScreen = () => {
  const [search, setSearch] = useState('');
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setClasses((await classesApi.list(search)).classes);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load classes');
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
      <Text style={styles.title}>Classes</Text>
      <Text style={styles.subtitle}>Class rosters, tutors, rooms, and active academic year from the shared API.</Text>
      <AppTextInput label="Search" value={search} onChangeText={setSearch} placeholder="Class, level, room, teacher" />
      <ErrorMessage message={error} />
      {loading ? <LoadingState label="Loading classes..." /> : null}
      {!loading && !classes.length ? <EmptyState title="No classes found" description="Classes will appear here once they are available for your role." /> : null}
      <View style={styles.list}>
        {classes.map((classRecord) => (
          <View key={classRecord.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{classRecord.level}</Text>
              </View>
              <Text style={styles.year}>{classRecord.academicYear}</Text>
            </View>
            <Text style={styles.name}>{classRecord.name}</Text>
            <Text style={styles.meta}>
              {classRecord.section ?? 'No section'} · {classRecord.room ?? 'No room'}
            </Text>
            <View style={styles.stats}>
              <Text style={styles.stat}>{classRecord._count?.students ?? classRecord.students?.length ?? 0} students</Text>
              <Text style={styles.stat}>{classRecord._count?.subjects ?? classRecord.subjects?.length ?? 0} subjects</Text>
            </View>
            <Text style={styles.teacher}>
              Tutor: {classRecord.teacher ? `${classRecord.teacher.firstName} ${classRecord.teacher.lastName}` : 'Unassigned'}
            </Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  badge: {
    backgroundColor: colors.orangeSoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  badgeText: { color: colors.orange, fontWeight: '900', fontSize: 12 },
  year: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  name: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  meta: { color: colors.muted },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: {
    overflow: 'hidden',
    backgroundColor: colors.sky,
    color: colors.blue,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontWeight: '800',
    fontSize: 12
  },
  teacher: { color: colors.ink, fontWeight: '700' }
});

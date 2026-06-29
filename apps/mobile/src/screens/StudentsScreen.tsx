import type { StudentDto } from '@evoyamwana/shared';
import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { studentsApi } from '../api/students';
import { AppTextInput } from '../components/AppTextInput';
import { EmptyState, ErrorMessage, LoadingState } from '../components/StateViews';
import { Screen } from '../components/Screen';
import { colors } from '../theme';

export const StudentsScreen = () => {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setStudents((await studentsApi.list(search)).students);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load students');
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
      <Text style={styles.title}>Students</Text>
      <AppTextInput label="Search" value={search} onChangeText={setSearch} placeholder="Name or student code" />
      <ErrorMessage message={error} />
      {loading ? <LoadingState label="Loading students..." /> : null}
      {!loading && !students.length ? <EmptyState title="No students found" description="Student records will appear here from the shared backend API." /> : null}
      <View style={styles.list}>
        {students.map((student) => (
          <View key={student.id} style={styles.card}>
            <Image source={{ uri: student.photoUrl || `https://api.dicebear.com/8.x/initials/png?seed=${student.firstName}%20${student.lastName}` }} style={styles.avatar} />
            <View style={styles.cardBody}>
              <Text style={styles.name}>{student.firstName} {student.lastName}</Text>
              <Text style={styles.meta}>{student.studentCode} · {student.class?.name ?? 'Unassigned'}</Text>
            </View>
            <Text style={styles.status}>{student.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 30, fontWeight: '900' },
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12
  },
  avatar: { width: 48, height: 48, borderRadius: 14 },
  cardBody: { flex: 1 },
  name: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  meta: { color: colors.muted, marginTop: 4 },
  status: { color: colors.success, fontWeight: '800', fontSize: 12 }
});

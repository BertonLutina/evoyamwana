import type { ParentDto } from '@evoyamwana/shared';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { parentsApi } from '../api/parents';
import { AppTextInput } from '../components/AppTextInput';
import { EmptyState, ErrorMessage, LoadingState } from '../components/StateViews';
import { Screen } from '../components/Screen';
import { colors } from '../theme';

export const ParentsScreen = () => {
  const [search, setSearch] = useState('');
  const [parents, setParents] = useState<ParentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setParents((await parentsApi.list(search)).parents);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load parents');
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
      <Text style={styles.title}>Parents</Text>
      <Text style={styles.subtitle}>Family contacts and linked learners for front-office follow-up.</Text>
      <AppTextInput label="Search" value={search} onChangeText={setSearch} placeholder="Name, phone, email, student" />
      <ErrorMessage message={error} />
      {loading ? <LoadingState label="Loading parents..." /> : null}
      {!loading && !parents.length ? <EmptyState title="No parents found" description="Parent records will appear here from the shared backend API." /> : null}
      <View style={styles.list}>
        {parents.map((parent) => (
          <View key={parent.id} style={styles.card}>
            <View style={styles.initials}>
              <Text style={styles.initialsText}>{parent.firstName.slice(0, 1)}{parent.lastName.slice(0, 1)}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.name}>{parent.firstName} {parent.lastName}</Text>
              <Text style={styles.meta}>{parent.phone ?? 'No phone'} · {parent.user?.email ?? 'No email'}</Text>
              <Text style={styles.children}>
                {(parent.children ?? []).length
                  ? parent.children?.map((child) => `${child.student.firstName} ${child.student.lastName}`).join(', ')
                  : 'No linked learners'}
              </Text>
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
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line
  },
  initials: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue
  },
  initialsText: { color: colors.white, fontWeight: '900' },
  cardBody: { flex: 1, gap: 4 },
  name: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  meta: { color: colors.muted, lineHeight: 20 },
  children: { color: colors.blue, fontWeight: '800', lineHeight: 20 }
});

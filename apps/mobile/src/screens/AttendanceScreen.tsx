import type { AttendanceStatus, StudentDto } from '@evoyamwana/shared';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { attendanceApi } from '../api/attendance';
import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { EmptyState, ErrorMessage, LoadingState } from '../components/StateViews';
import { Screen } from '../components/Screen';
import { colors } from '../theme';

const statusColors: Record<AttendanceStatus, string> = {
  PRESENT: colors.success,
  ABSENT: colors.danger,
  LATE: colors.orange,
  EXCUSED: colors.blue
};

const today = new Date().toISOString().slice(0, 10);

export const AttendanceScreen = () => {
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  useEffect(() => {
    if (!classId) {
      setStudents([]);
      setRecords({});
      return;
    }

    let isMounted = true;
    setLoadingRegister(true);
    setError('');
    setMessage('');
    attendanceApi
      .classRegister(classId, date)
      .then((register) => {
        if (!isMounted) return;
        setStudents(register.students);
        const savedStatuses = new Map(register.attendance.map((item) => [item.studentId, item.status]));
        setRecords(Object.fromEntries(register.students.map((student) => [student.id, savedStatuses.get(student.id) ?? 'PRESENT'])));
      })
      .catch((loadError) => {
        if (!isMounted) return;
        setStudents([]);
        setRecords({});
        setError(loadError instanceof Error ? loadError.message : 'Unable to load class register');
      })
      .finally(() => {
        if (isMounted) setLoadingRegister(false);
      });

    return () => {
      isMounted = false;
    };
  }, [classId, date]);

  const totals = useMemo(() => {
    return Object.values(records).reduce<Record<AttendanceStatus, number>>(
      (summary, status) => ({ ...summary, [status]: summary[status] + 1 }),
      { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 }
    );
  }, [records]);

  const save = async () => {
    if (!classId || !students.length) {
      setError('Load a class register before saving attendance.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await attendanceApi.save(classId, date, Object.entries(records).map(([studentId, status]) => ({ studentId, status })));
      setMessage('Attendance saved. Parent notifications are handled by the API.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Attendance</Text>
      <Text style={styles.subtitle}>Fast register for teachers and school admins, synced through the shared API.</Text>
      <AppTextInput label="Class ID" value={classId} onChangeText={setClassId} />
      <AppTextInput label="Date" value={date} onChangeText={setDate} />
      <View style={styles.summary}>
        {Object.entries(totals).map(([status, value]) => (
          <View key={status} style={styles.pill}>
            <Text style={[styles.pillValue, { color: statusColors[status as AttendanceStatus] }]}>{value}</Text>
            <Text style={styles.pillLabel}>{status}</Text>
          </View>
        ))}
      </View>
      {loadingRegister ? <LoadingState label="Loading class roster..." /> : null}
      {!loadingRegister && !students.length ? <EmptyState title="No class loaded" description="Enter a class ID with active students to record attendance." /> : null}
      {students.map((student) => (
        <View key={student.id} style={styles.row}>
          <Text style={styles.name}>{student.firstName} {student.lastName}</Text>
          <Text style={styles.code}>{student.studentCode}</Text>
          <View style={styles.statusRow}>
            {(Object.keys(statusColors) as AttendanceStatus[]).map((status) => (
              <Text
                key={status}
                onPress={() => setRecords((current) => ({ ...current, [student.id]: status }))}
                style={[styles.status, records[student.id] === status && { backgroundColor: statusColors[status], color: colors.white }]}
              >
                {status.slice(0, 1)}
              </Text>
            ))}
          </View>
        </View>
      ))}
      <ErrorMessage message={error} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <AppButton title="Save attendance" loading={loading} onPress={save} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.muted },
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { flex: 1, minWidth: 74, backgroundColor: colors.white, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.line },
  pillValue: { fontWeight: '900', fontSize: 22 },
  pillLabel: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  row: { backgroundColor: colors.white, borderRadius: 18, padding: 14, gap: 12, borderWidth: 1, borderColor: colors.line },
  name: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  code: { color: colors.muted, fontWeight: '700', marginTop: -8 },
  statusRow: { flexDirection: 'row', gap: 8 },
  status: { overflow: 'hidden', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.sky, color: colors.blue, fontWeight: '900' },
  message: { color: colors.success, fontWeight: '800', lineHeight: 21 }
});

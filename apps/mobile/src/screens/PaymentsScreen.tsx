import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { paymentsApi } from '../api/payments';
import { EmptyState, ErrorMessage, LoadingState } from '../components/StateViews';
import { Screen } from '../components/Screen';
import { colors } from '../theme';

type PendingPayment = Awaited<ReturnType<typeof paymentsApi.pending>>['payments'][number];

const formatMoney = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value;
};

export const PaymentsScreen = () => {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    paymentsApi
      .pending()
      .then((data) => {
        if (!isMounted) return;
        setPayments(data.payments);
        setTotal(data.total);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Unable to load payments');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Pending follow-up</Text>
        <Text style={styles.title}>{total.toLocaleString()} payments</Text>
        <Text style={styles.subtitle}>Light mobile view backed by the dashboard payment summary.</Text>
      </View>
      <ErrorMessage message={error} />
      {loading ? <LoadingState label="Loading payments..." /> : null}
      {!loading && !payments.length ? <EmptyState title="No pending payments" description="Outstanding fees will appear here when the API returns them." /> : null}
      <View style={styles.list}>
        {payments.map((payment) => (
          <View key={payment.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.student}>
                {payment.student ? `${payment.student.firstName} ${payment.student.lastName}` : 'Student'}
              </Text>
              <Text style={styles.status}>{payment.status}</Text>
            </View>
            <Text style={styles.code}>{payment.student?.studentCode ?? 'No student code'}</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amount}>{formatMoney(payment.amount)}</Text>
              <Text style={styles.paid}>Paid {formatMoney(payment.amountPaid)}</Text>
            </View>
            <Text style={styles.meta}>Due {payment.dueDate.slice(0, 10)} · {payment.paymentMethod ?? 'No method'}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8
  },
  kicker: { color: colors.success, fontWeight: '900', fontSize: 12 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.muted, lineHeight: 21 },
  list: { gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  student: { flex: 1, color: colors.ink, fontSize: 17, fontWeight: '900' },
  status: {
    overflow: 'hidden',
    backgroundColor: colors.orangeSoft,
    color: colors.orange,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '900'
  },
  code: { color: colors.muted, fontWeight: '700' },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  amount: { color: colors.ink, fontSize: 24, fontWeight: '900' },
  paid: { color: colors.success, fontWeight: '800' },
  meta: { color: colors.muted }
});

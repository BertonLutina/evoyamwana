import type { DashboardSummaryDto, TranslationKey, UserRole } from '@evoyamwana/shared';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { dashboardApi } from '../api/dashboard';
import { MetricCard } from '../components/MetricCard';
import { Screen } from '../components/Screen';
import { ErrorMessage, LoadingState } from '../components/StateViews';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { colors } from '../theme';

const emptySummary: DashboardSummaryDto = {
  totals: { students: 0, teachers: 0, classes: 0, attendanceToday: 0, pendingPayments: 0, notifications: 0 },
  attendance: { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0, rate: 0 },
  pendingPayments: [],
  recentNotifications: []
};

type DashboardMetric = {
  label: string;
  value: (summary: DashboardSummaryDto) => string;
  accent: string;
};

type DashboardContent = {
  subtitle: string;
  loadingLabel: string;
  metrics: DashboardMetric[];
  panelTitle: string;
  panelText: (summary: DashboardSummaryDto) => string;
};

const formatCount = (value: number) => value.toLocaleString();

const attendanceLine = (summary: DashboardSummaryDto) =>
  `Present ${summary.attendance.PRESENT} · Absent ${summary.attendance.ABSENT} · Late ${summary.attendance.LATE}`;

const defaultDashboardContent = (t: (key: TranslationKey) => string): DashboardContent => ({
  subtitle: t('mobile.connected'),
  loadingLabel: 'Loading shared API dashboard...',
  metrics: [
    { label: t('nav.students'), value: (summary) => formatCount(summary.totals.students), accent: colors.blue },
    { label: t('nav.attendance'), value: (summary) => `${summary.attendance.rate}%`, accent: colors.orange },
    { label: t('nav.payments'), value: (summary) => formatCount(summary.totals.pendingPayments), accent: colors.success },
    { label: t('dashboard.recentNotifications'), value: (summary) => formatCount(summary.totals.notifications), accent: colors.blueDark }
  ],
  panelTitle: t('mobile.todayFromDb'),
  panelText: attendanceLine
});

const operationalDashboardContent: Partial<Record<UserRole, DashboardContent>> = {
  DISCIPLINE_OFFICER: {
    subtitle: 'Priorités discipline: présence, retards et alertes élèves.',
    loadingLabel: 'Chargement du suivi disciplinaire...',
    metrics: [
      { label: 'Élèves suivis', value: (summary) => formatCount(summary.totals.students), accent: colors.blue },
      { label: 'Présence', value: (summary) => `${summary.attendance.rate}%`, accent: colors.success },
      { label: 'Retards', value: (summary) => formatCount(summary.attendance.LATE), accent: colors.orange },
      { label: 'Alertes', value: (summary) => formatCount(summary.totals.notifications), accent: colors.blueDark }
    ],
    panelTitle: 'Discipline aujourd’hui',
    panelText: (summary) => `${attendanceLine(summary)} · Excused ${summary.attendance.EXCUSED}`
  },
  LIBRARIAN: {
    subtitle: 'Vue bibliothèque: élèves, classes et communications à traiter.',
    loadingLabel: 'Chargement du tableau bibliothèque...',
    metrics: [
      { label: 'Lecteurs potentiels', value: (summary) => formatCount(summary.totals.students), accent: colors.blue },
      { label: 'Classes', value: (summary) => formatCount(summary.totals.classes), accent: colors.orange },
      { label: 'Enseignants', value: (summary) => formatCount(summary.totals.teachers), accent: colors.success },
      { label: 'Messages', value: (summary) => formatCount(summary.totals.notifications), accent: colors.blueDark }
    ],
    panelTitle: 'Bibliothèque aujourd’hui',
    panelText: (summary) => `${formatCount(summary.totals.classes)} classes actives · ${formatCount(summary.totals.notifications)} communications récentes`
  },
  NURSE: {
    subtitle: 'Vue infirmerie: présence du jour et élèves à surveiller.',
    loadingLabel: 'Chargement du suivi santé...',
    metrics: [
      { label: 'Élèves', value: (summary) => formatCount(summary.totals.students), accent: colors.blue },
      { label: 'Présents', value: (summary) => formatCount(summary.attendance.PRESENT), accent: colors.success },
      { label: 'Absents', value: (summary) => formatCount(summary.attendance.ABSENT), accent: colors.orange },
      { label: 'Alertes santé', value: (summary) => formatCount(summary.totals.notifications), accent: colors.blueDark }
    ],
    panelTitle: 'Infirmerie aujourd’hui',
    panelText: (summary) => `${attendanceLine(summary)} · ${summary.attendance.rate}% de présence`
  },
  TRANSPORT_MANAGER: {
    subtitle: 'Vue transport: élèves, parents et messages de trajet.',
    loadingLabel: 'Chargement du suivi transport...',
    metrics: [
      { label: 'Élèves transportables', value: (summary) => formatCount(summary.totals.students), accent: colors.blue },
      { label: 'Classes desservies', value: (summary) => formatCount(summary.totals.classes), accent: colors.orange },
      { label: 'Présents', value: (summary) => formatCount(summary.attendance.PRESENT), accent: colors.success },
      { label: 'Messages trajet', value: (summary) => formatCount(summary.totals.notifications), accent: colors.blueDark }
    ],
    panelTitle: 'Transport aujourd’hui',
    panelText: (summary) => `${formatCount(summary.attendance.PRESENT)} élèves présents · ${formatCount(summary.attendance.ABSENT)} absents à vérifier avant départ`
  },
  CANTEEN_MANAGER: {
    subtitle: 'Vue cantine: effectifs, présences et paiements à suivre.',
    loadingLabel: 'Chargement du suivi cantine...',
    metrics: [
      { label: 'Repas potentiels', value: (summary) => formatCount(summary.attendance.PRESENT), accent: colors.success },
      { label: 'Élèves', value: (summary) => formatCount(summary.totals.students), accent: colors.blue },
      { label: 'Paiements ouverts', value: (summary) => formatCount(summary.totals.pendingPayments), accent: colors.orange },
      { label: 'Annonces', value: (summary) => formatCount(summary.totals.notifications), accent: colors.blueDark }
    ],
    panelTitle: 'Cantine aujourd’hui',
    panelText: (summary) => `${formatCount(summary.attendance.PRESENT)} présences pour la préparation · ${formatCount(summary.totals.pendingPayments)} paiements à contrôler`
  }
};

export const DashboardScreen = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fallbackContent = defaultDashboardContent(t);
  const content = (user?.role && operationalDashboardContent[user.role]) || fallbackContent;

  useEffect(() => {
    let isMounted = true;
    dashboardApi
      .summary()
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch((summaryError) => {
        if (isMounted) setError(summaryError instanceof Error ? summaryError.message : 'Unable to load dashboard');
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
        <Text style={styles.kicker}>{user?.role ?? 'SCHOOL_ADMIN'}</Text>
        <Text style={styles.title}>{t('mobile.goodDay')}, {user?.fullName?.split(' ')[0] ?? 'Admin'}.</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>
      </View>
      {loading ? <LoadingState label={content.loadingLabel} /> : null}
      <ErrorMessage message={error} />
      <View style={styles.grid}>
        {content.metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value(summary)} accent={metric.accent} />
        ))}
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{content.panelTitle}</Text>
        <Text style={styles.panelText}>{content.panelText(summary)}</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.blue,
    borderRadius: 24,
    padding: 22,
    gap: 9
  },
  kicker: {
    color: colors.orange,
    fontWeight: '900',
    letterSpacing: 1.4
  },
  title: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 31,
    lineHeight: 37
  },
  subtitle: {
    color: '#dbeafe',
    lineHeight: 22
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  panel: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6
  },
  panelTitle: {
    color: colors.ink,
    fontWeight: '900'
  },
  panelText: {
    color: colors.muted,
    lineHeight: 21
  }
});

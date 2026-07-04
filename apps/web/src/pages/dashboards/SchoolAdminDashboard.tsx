import { Bell, CalendarCheck, CreditCard, GraduationCap, MessageSquare, Plus, School, TrendingUp, UserRoundCheck } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import WeekCalendar from '../../components/WeekCalendar';
import { useLocale } from '../../contexts/LocaleContext';
import type { DashboardPageProps } from './types';

const today = new Date().toISOString().slice(0, 10);
const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));

export const SchoolAdminDashboard = ({ summary, isLoading, error, navigate, user, planningEvents }: DashboardPageProps) => {
  const { t } = useLocale();
  const attendanceRows = useMemo(
    () => [
      { label: 'Présent', value: summary.attendance.PRESENT, color: 'bg-canopy' },
      { label: 'Absent', value: summary.attendance.ABSENT, color: 'bg-clay' },
      { label: 'En retard', value: summary.attendance.LATE, color: 'bg-ember' },
      { label: 'Excusé', value: summary.attendance.EXCUSED, color: 'bg-ocean' }
    ],
    [summary.attendance]
  );

  const quickActions = [
    { label: t('dashboard.registerStudent'), path: '/students?action=create' },
    { label: t('dashboard.recordPayment'), path: '/payments?action=create' },
    { label: t('dashboard.sendMessage'), path: '/messages?action=create' },
    { label: t('dashboard.markAttendance'), path: '/attendance' }
  ];

  const exportPendingPayments = () => {
    const headers = ['Student', 'Code', 'Amount', 'Due date', 'Status'];
    const rows = summary.pendingPayments.map((payment) => [
      payment.student ? `${payment.student.firstName} ${payment.student.lastName}` : 'Student',
      payment.student?.studentCode ?? '',
      String(payment.amount),
      payment.dueDate,
      payment.status
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evoyamwana-paiements-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="brand-hero-card overflow-hidden rounded-lg border border-ocean/10 bg-white text-ink shadow-[0_18px_54px_rgba(7,27,58,0.08)]">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_310px] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-ocean/8 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-ocean">
                  <span className="h-2 w-2 rounded-full bg-ember" />
                  {t('dashboard.commandCenter')}
                </div>
                <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-[-0.02em] sm:text-5xl">{t('dashboard.heroTitle')}</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/62">{t('dashboard.heroBody')}</p>
                <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-ocean px-3 py-1.5 text-white">API active</span>
                  <span className="rounded-full bg-maize px-3 py-1.5 text-ink">RDC ready</span>
                  <span className="rounded-full bg-ember px-3 py-1.5 text-white">Multi-langue</span>
                </div>
              </div>
              <div className="rounded-lg border border-ocean/10 bg-sky p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-ocean">{t('dashboard.today')}</p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-ember">Live</span>
                </div>
                <p className="mt-3 font-display text-3xl font-bold">{user?.fullName?.split(' ')[0] ?? 'Admin'}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md bg-white p-3 shadow-sm">
                    <p className="text-ink/55">{t('dashboard.openTasks')}</p>
                    <p className="mt-1 text-2xl font-bold">{isLoading ? '...' : summary.totals.pendingPayments}</p>
                  </div>
                  <div className="rounded-md bg-white p-3 shadow-sm">
                    <p className="text-ink/55">{t('nav.messages')}</p>
                    <p className="mt-1 text-2xl font-bold">{isLoading ? '...' : summary.totals.notifications}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">{t('dashboard.quickActions')}</p>
                <h3 className="mt-2 text-xl font-bold">{t('dashboard.adminShortcuts')}</h3>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-md bg-sky text-ocean">
                <Plus size={20} />
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {quickActions.map((action) => (
                <button key={action.label} type="button" onClick={() => navigate(action.path)} className="flex h-11 items-center justify-between rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink transition hover:border-ocean/30 hover:bg-sky">
                  {action.label}
                  <span className="text-ember">+</span>
                </button>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label={t('dashboard.totalStudents')} value={isLoading ? '...' : summary.totals.students.toLocaleString()} icon={GraduationCap} tone="blue" detail="Apprenants actifs depuis PostgreSQL" />
          <StatCard label={t('dashboard.totalTeachers')} value={isLoading ? '...' : summary.totals.teachers.toLocaleString()} icon={UserRoundCheck} tone="orange" detail="Profils enseignants de cette école" />
          <StatCard label={t('dashboard.totalClasses')} value={isLoading ? '...' : summary.totals.classes.toLocaleString()} icon={School} tone="blue" detail="Groupes de classes configurés" />
          <StatCard label={t('dashboard.attendanceToday')} value={isLoading ? '...' : `${summary.attendance.rate}%`} icon={CalendarCheck} tone="green" detail={`${summary.attendance.PRESENT} présents sur ${summary.attendance.total}`} />
          <StatCard label={t('dashboard.pendingPayments')} value={isLoading ? '...' : summary.totals.pendingPayments.toLocaleString()} icon={CreditCard} tone="orange" detail="Ouverts, partiels ou en retard" />
          <StatCard label={t('dashboard.recentNotifications')} value={isLoading ? '...' : summary.totals.notifications.toLocaleString()} icon={Bell} tone="blue" detail="Non lues pour cet utilisateur" />
        </section>

        {error ? <p className="mt-4 rounded-md bg-orange-50 px-3 py-2 text-sm font-semibold text-ember">{error}</p> : null}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">{t('dashboard.payments')}</p>
                <h3 className="mt-1 text-xl font-bold">{t('dashboard.paymentFollowUp')}</h3>
              </div>
              <Button type="button" variant="secondary" className="bg-ember text-white hover:bg-ocean" onClick={exportPendingPayments}>
                Export
              </Button>
            </div>
            <div className="mt-5">
              <ResponsiveTable
                data={summary.pendingPayments}
                getRowKey={(payment) => payment.id}
                columns={[
                  { key: 'family', header: 'Student', render: (payment) => <span className="font-semibold">{payment.student ? `${payment.student.firstName} ${payment.student.lastName}` : 'Student'}</span> },
                  { key: 'amount', header: 'Amount', render: (payment) => <span className="font-bold text-ocean">{payment.amount}</span> },
                  { key: 'due', header: 'Due', render: (payment) => formatDate(payment.dueDate) },
                  { key: 'status', header: 'Status', render: (payment) => <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-ember">{payment.status}</span> }
                ]}
                emptyState={isLoading ? <LoadingRows rows={3} /> : <EmptyState icon={CreditCard} title="No pending payments" description="Open balances from the shared API will appear here." />}
              />
            </div>
          </article>

          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">{t('dashboard.attendance')}</p>
                <h3 className="mt-1 text-xl font-bold">{t('dashboard.todayByStatus')}</h3>
              </div>
              <TrendingUp className="text-ocean" size={22} />
            </div>
            <div className="mt-6 grid gap-5">
              {attendanceRows.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-sky">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${summary.attendance.total ? (item.value / summary.attendance.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <article className="mt-5 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{t('dashboard.recentNotifications')}</h3>
            <MessageSquare className="text-ember" size={21} />
          </div>
          <div className="mt-5 grid gap-3">
            {summary.recentNotifications.length ? (
              summary.recentNotifications.map((notification) => (
                <div key={notification.id} className="rounded-lg border border-ocean/10 bg-white p-4">
                  <span className="rounded-full bg-ocean/10 px-2.5 py-1 text-xs font-bold text-ocean">{notification.type}</span>
                  <p className="mt-3 font-semibold">{notification.title}</p>
                  <p className="mt-1 text-sm text-ink/55">{notification.body}</p>
                </div>
              ))
            ) : (
              <EmptyState icon={MessageSquare} title={t('dashboard.noNotifications')} description={t('dashboard.noNotificationsDetail')} />
            )}
          </div>
        </article>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Planning administration</p>
              <h3 className="mt-1 text-xl font-bold text-ink">Calendrier de la semaine</h3>
            </div>
            <Button variant="ghost" className="text-ocean" onClick={() => navigate('/planning')}>Voir le planning</Button>
          </div>
          <WeekCalendar
            events={planningEvents}
            onEventClick={() => navigate('/planning')}
          />
        </section>
      </div>
    </div>
  );
};

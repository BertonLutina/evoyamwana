import type { AttendanceDto, AttendanceStatus, StudentDto } from '@evoyamwana/shared';
import { CalendarCheck, CheckCircle2, Clock3, FileWarning, Search, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import WeekCalendar, { type CalendarEvent } from '../../components/WeekCalendar';
import { useLocale } from '../../contexts/LocaleContext';
import { attendanceService } from '../../services/attendance.service';

const ATT_STATUS_MAP: Record<AttendanceStatus, string> = {
  PRESENT: 'confirmed', ABSENT: 'cancelled', LATE: 'in_review', EXCUSED: 'pending'
};

const statusStyles: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-canopy/10 text-canopy',
  ABSENT: 'bg-clay/10 text-clay',
  LATE: 'bg-orange-50 text-ember',
  EXCUSED: 'bg-ocean/10 text-ocean'
};

const localeFormats = {
  fr: 'fr-FR',
  sw: 'sw-CD',
  ln: 'fr-CD',
  lua: 'fr-CD',
  kg: 'fr-CD',
  tll: 'fr-CD'
} as const;

const formatDate = (value: string, locale: keyof typeof localeFormats) =>
  new Intl.DateTimeFormat(localeFormats[locale], {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));

export const StudentAttendancePage = () => {
  const { locale, t } = useLocale();
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [attendance, setAttendance] = useState<AttendanceDto[]>([]);
  const [status, setStatus] = useState<AttendanceStatus | ''>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    attendanceService
      .getMyAttendance()
      .then((data) => {
        if (!isMounted) return;
        setStudent(data.student);
        setAttendance(data.attendance);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : t('student.loadAttendanceError'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(
    () =>
      attendance.reduce(
        (stats, item) => {
          stats[item.status] += 1;
          stats.total += 1;
          return stats;
        },
        { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0 } as Record<AttendanceStatus | 'total', number>
      ),
    [attendance]
  );

  const attendanceRate = summary.total ? Math.round((summary.PRESENT / summary.total) * 100) : 0;
  const statusLabels: Record<AttendanceStatus, string> = {
    PRESENT: t('student.present'),
    ABSENT: t('student.absent'),
    LATE: t('student.late'),
    EXCUSED: t('student.excused')
  };
  const filteredAttendance = attendance.filter((item) => {
    const haystack = `${item.class?.name ?? ''} ${item.note ?? ''} ${statusLabels[item.status]} ${formatDate(item.date, locale)}`.toLowerCase();
    return (!status || item.status === status) && haystack.includes(search.toLowerCase());
  });

  const recentDays = attendance.slice(0, 8).reverse();

  const calendarEvents = useMemo<CalendarEvent[]>(() =>
    attendance.map(item => ({
      id: `att-${item.id}`,
      title: item.class?.name ?? student?.class?.name ?? 'Cours',
      date: new Date(item.date),
      startMinutes: 7 * 60 + 30,
      endMinutes: 12 * 60 + 30,
      status: ATT_STATUS_MAP[item.status],
    })), [attendance, student]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_360px] xl:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">{t('student.space')}</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">{t('student.myAttendance')}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">
                {t('student.myAttendanceDescription')}
              </p>
            </div>
            <article className="rounded-lg border border-ocean/10 bg-sky p-5">
              <CalendarCheck className="text-ocean" size={28} />
              <p className="mt-4 text-sm font-bold text-ink">{student ? `${student.firstName} ${student.lastName}` : 'Profil élève'}</p>
              <p className="mt-1 text-sm text-ink/55">{student?.class ? `${student.class.name} · ${student.studentCode}` : t('student.personalAttendance')}</p>
            </article>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5 grid gap-4 md:grid-cols-4">
          <StatCard label={t('student.attendanceRate')} value={isLoading ? '...' : `${attendanceRate}%`} icon={ShieldCheck} tone="green" detail={t('student.confirmedPresence')} />
          <StatCard label={t('student.present')} value={isLoading ? '...' : String(summary.PRESENT)} icon={CheckCircle2} tone="blue" detail={t('student.presentDays')} />
          <StatCard label={t('student.late')} value={isLoading ? '...' : String(summary.LATE)} icon={Clock3} tone="orange" detail={t('student.lateArrivals')} />
          <StatCard label={t('student.absent')} value={isLoading ? '...' : String(summary.ABSENT)} icon={XCircle} tone="clay" detail={t('student.recordedAbsences')} />
        </section>

        <section className="mt-6">
          <WeekCalendar
            events={calendarEvents}
            focusDate={new Date()}
            onEventClick={(evt) => {
              const d = evt.date instanceof Date ? evt.date : new Date(evt.date);
              setSearch(d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }));
            }}
          />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">{t('student.evolution')}</p>
                <h3 className="mt-1 text-xl font-bold text-ink">{t('student.recentDays')}</h3>
              </div>
              <CalendarCheck className="text-ember" size={22} />
            </div>
            {isLoading ? (
              <div className="mt-5">
                <LoadingRows rows={4} />
              </div>
            ) : recentDays.length ? (
              <div className="mt-6 flex items-end gap-2">
                {recentDays.map((item) => {
                  const height = item.status === 'PRESENT' ? 'h-28' : item.status === 'EXCUSED' ? 'h-20' : item.status === 'LATE' ? 'h-16' : 'h-10';
                  return (
                    <div key={item.id} className="flex flex-1 flex-col items-center gap-2">
                      <div className={`w-full rounded-t-md ${height} ${statusStyles[item.status].split(' ')[0]}`} />
                      <span className="text-[10px] font-bold uppercase text-ink/45">{new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={CalendarCheck} title={t('student.noAttendance')} description={t('student.noAttendanceDetail')} />
            )}
            <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-bold sm:grid-cols-4">
              {Object.entries(statusLabels).map(([key, label]) => (
                <span key={key} className={`rounded-full px-2.5 py-1 ${statusStyles[key as AttendanceStatus]}`}>
                  {label}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="grid gap-3 lg:grid-cols-[1fr_190px]">
              <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
                <Search size={18} className="text-ocean/55" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
                  placeholder={t('student.searchAttendance')}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean" value={status} onChange={(event) => setStatus(event.target.value as AttendanceStatus | '')}>
                <option value="">{t('student.allStatuses')}</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              {isLoading ? (
                <LoadingRows rows={7} />
              ) : filteredAttendance.length ? (
                <ResponsiveTable<AttendanceDto>
                  data={filteredAttendance}
                  getRowKey={(item) => item.id}
                  columns={[
                    { key: 'date', header: t('student.date'), render: (item) => <span className="font-bold">{formatDate(item.date, locale)}</span> },
                    { key: 'class', header: t('student.class'), render: (item) => item.class?.name ?? student?.class?.name ?? '-' },
                    {
                      key: 'status',
                      header: t('student.status'),
                      render: (item) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[item.status]}`}>{statusLabels[item.status]}</span>
                    },
                    { key: 'note', header: t('student.observation'), render: (item) => item.note || t('student.noComment') }
                  ]}
                />
              ) : (
                <EmptyState icon={FileWarning} title={t('student.noAttendanceFound')} description={t('student.noAttendanceFoundDetail')} />
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

import type { AttendanceDto, AttendanceStatus, StudentDto } from '@evoyamwana/shared';
import { CalendarCheck, CheckCircle2, Clock3, FileWarning, GraduationCap, Search, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import WeekCalendar, { type CalendarEvent } from '../../components/WeekCalendar';
import { useAuth } from '../../hooks/useAuth';
import { attendanceService } from '../../services/attendance.service';
import { studentsService } from '../../services/students.service';

const P_STATUS_MAP: Record<AttendanceStatus, string> = {
  PRESENT: 'confirmed', ABSENT: 'cancelled', LATE: 'in_review', EXCUSED: 'pending'
};

type ChildAttendance = {
  student: StudentDto;
  attendance: AttendanceDto[];
};

const statusLabels: Record<AttendanceStatus, string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  LATE: 'Retard',
  EXCUSED: 'Excusé'
};

const statusStyles: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-canopy/10 text-canopy',
  ABSENT: 'bg-clay/10 text-clay',
  LATE: 'bg-orange-50 text-ember',
  EXCUSED: 'bg-ocean/10 text-ocean'
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));

const fullName = (student: StudentDto) => `${student.firstName} ${student.lastName}`.trim();

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Impossible de charger les présences des enfants.');

export const ParentAttendancePage = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildAttendance[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AttendanceStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadAttendance = async () => {
      try {
        setIsLoading(true);
        setError('');
        const result = await studentsService.list({ page: 1, pageSize: 100, status: 'all' });
        const rows = await Promise.all(
          result.students.map(async (student) => ({
            student,
            attendance: await attendanceService.getStudentAttendance(student.id)
          }))
        );
        if (mounted) setChildren(rows);
      } catch (loadError) {
        if (mounted) setError(getErrorMessage(loadError));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadAttendance();

    return () => {
      mounted = false;
    };
  }, []);

  const allAttendance = useMemo(
    () =>
      children.flatMap(({ student, attendance }) =>
        attendance.map((item) => ({
          ...item,
          student
        }))
      ),
    [children]
  );

  const summary = useMemo(
    () =>
      allAttendance.reduce(
        (stats, item) => {
          stats[item.status] += 1;
          stats.total += 1;
          return stats;
        },
        { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0 } as Record<AttendanceStatus | 'total', number>
      ),
    [allAttendance]
  );

  const attendanceRate = summary.total ? Math.round((summary.PRESENT / summary.total) * 100) : 0;
  const filteredAttendance = allAttendance.filter((item) => {
    const studentName = fullName(item.student);
    const haystack = `${studentName} ${item.student.studentCode} ${item.class?.name ?? item.student.class?.name ?? ''} ${item.note ?? ''} ${statusLabels[item.status]} ${formatDate(item.date)}`.toLowerCase();
    return (!status || item.status === status) && haystack.includes(search.toLowerCase());
  });
  const recentAttendance = allAttendance.slice(0, 8).reverse();

  const calendarEvents = useMemo<CalendarEvent[]>(() =>
    allAttendance.map(item => ({
      id: `att-${item.id}`,
      title: fullName(item.student),
      subtitle: item.class?.name ?? item.student.class?.name ?? '-',
      date: new Date(item.date),
      startMinutes: 7 * 60 + 30,
      endMinutes: 12 * 60 + 30,
      status: P_STATUS_MAP[item.status],
    })), [allAttendance]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="premium-card overflow-hidden p-0">
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_320px] md:p-8">
            <div className="flex min-w-0 flex-col justify-center">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-ember">Espace parent</p>
              <h1 className="mt-3 font-display text-4xl font-black text-ink md:text-5xl">Présences de mes enfants</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-ink/62">
                Historique réel des présences rattachées au compte de {user?.fullName ?? 'ce parent'}.
              </p>
            </div>
            <div className="rounded-lg border border-ocean/15 bg-sky/70 p-5">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-ocean shadow-sm">
                <CalendarCheck size={22} />
              </span>
              <p className="mt-4 text-sm font-bold text-ink">Données école</p>
              <p className="mt-2 text-sm leading-6 text-ink/60">Les lignes viennent de la table des présences, filtrées sur vos enfants uniquement.</p>
            </div>
          </div>
        </section>

        {error ? <p className="rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Taux de présence" value={isLoading ? '...' : `${attendanceRate}%`} icon={ShieldCheck} tone="green" detail="Présences confirmées" />
          <StatCard label="Présents" value={isLoading ? '...' : String(summary.PRESENT)} icon={CheckCircle2} tone="blue" detail="Jours enregistrés" />
          <StatCard label="Retards" value={isLoading ? '...' : String(summary.LATE)} icon={Clock3} tone="orange" detail="Arrivées tardives" />
          <StatCard label="Absences" value={isLoading ? '...' : String(summary.ABSENT)} icon={XCircle} tone="clay" detail="Absences enregistrées" />
        </section>

        <section>
          <WeekCalendar
            events={calendarEvents}
            focusDate={new Date()}
            onEventClick={(evt) => {
              const d = evt.date instanceof Date ? evt.date : new Date(evt.date);
              setSearch(d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }));
            }}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.68fr_1.32fr]">
          <article className="premium-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Enfants suivis</p>
                <h2 className="mt-1 text-xl font-bold text-ink">{children.length} profil(s)</h2>
              </div>
              <GraduationCap className="text-ember" size={22} />
            </div>

            <div className="mt-5 space-y-3">
              {isLoading ? (
                <LoadingRows rows={4} />
              ) : children.length ? (
                children.map(({ student, attendance }) => {
                  const present = attendance.filter((item) => item.status === 'PRESENT').length;
                  const total = attendance.length;
                  const rate = total ? Math.round((present / total) * 100) : 0;

                  return (
                    <div key={student.id} className="rounded-lg border border-ocean/10 bg-sky/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-black text-ink">{fullName(student)}</p>
                          <p className="mt-1 text-xs font-semibold text-ink/50">{student.class?.name ?? 'Classe non assignée'} · {student.studentCode}</p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-ocean">{rate}%</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-ocean" style={{ width: `${rate}%` }} />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-ink/50">{total} présence(s) enregistrée(s)</p>
                    </div>
                  );
                })
              ) : (
                <EmptyState icon={GraduationCap} title="Aucun enfant lié" description="Les présences apparaîtront dès qu'un enfant sera rattaché à ce compte parent." />
              )}
            </div>

            {recentAttendance.length ? (
              <div className="mt-6">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Derniers jours</p>
                <div className="mt-4 flex items-end gap-2">
                  {recentAttendance.map((item) => {
                    const height = item.status === 'PRESENT' ? 'h-24' : item.status === 'EXCUSED' ? 'h-20' : item.status === 'LATE' ? 'h-14' : 'h-10';
                    return (
                      <div key={item.id} className="flex flex-1 flex-col items-center gap-2">
                        <div className={`w-full rounded-t-md ${height} ${statusStyles[item.status].split(' ')[0]}`} />
                        <span className="text-[10px] font-bold uppercase text-ink/45">{new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </article>

          <article className="premium-card p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
              <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
                <Search size={18} className="text-ocean/55" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
                  placeholder="Rechercher enfant, classe, statut ou note"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean" value={status} onChange={(event) => setStatus(event.target.value as AttendanceStatus | '')}>
                <option value="">Tous les statuts</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              {isLoading ? (
                <LoadingRows rows={7} />
              ) : filteredAttendance.length ? (
                <ResponsiveTable<AttendanceDto & { student: StudentDto }>
                  data={filteredAttendance}
                  getRowKey={(item) => item.id}
                  columns={[
                    { key: 'date', header: 'Date', render: (item) => <span className="font-bold">{formatDate(item.date)}</span> },
                    { key: 'student', header: 'Enfant', render: (item) => <span className="font-bold">{fullName(item.student)}</span> },
                    { key: 'class', header: 'Classe', render: (item) => item.class?.name ?? item.student.class?.name ?? '-' },
                    {
                      key: 'status',
                      header: 'Statut',
                      render: (item) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[item.status]}`}>{statusLabels[item.status]}</span>
                    },
                    { key: 'note', header: 'Observation', render: (item) => item.note || 'Aucun commentaire' }
                  ]}
                />
              ) : (
                <EmptyState icon={FileWarning} title="Aucune présence trouvée" description="Les présences enregistrées pour vos enfants apparaîtront ici." />
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

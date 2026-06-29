import type { AttendanceStatus, ClassDto, StudentDto } from '@evoyamwana/shared';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { BarChart2, CalendarCheck, Check, Clock, MinusCircle, Save, Search, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { OfflineSyncBanner } from '../../components/OfflineSyncBanner';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import WeekCalendar, { type CalendarEvent } from '../../components/WeekCalendar';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { attendanceService } from '../../services/attendance.service';
import { classesService } from '../../services/classes.service';
import { offlineAttendanceService } from '../../services/offlineAttendance.service';

function weekStart(dateStr: string): Date {
  const d = new Date(dateStr); const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0, 0, 0, 0); return d;
}
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const statuses: Array<{ value: AttendanceStatus; label: string; className: string }> = [
  { value: 'PRESENT', label: 'Présent', className: 'bg-canopy text-white' },
  { value: 'ABSENT', label: 'Absent', className: 'bg-clay text-white' },
  { value: 'LATE', label: 'Retard', className: 'bg-ember text-white' },
  { value: 'EXCUSED', label: 'Excusé', className: 'bg-ocean text-white' }
];

const today = new Date().toISOString().slice(0, 10);

export const TeacherAttendancePage = () => {
  const isOnline = useNetworkStatus();
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState('');
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [message, setMessage] = useState('');
  const [isClassLoading, setIsClassLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(() => offlineAttendanceService.getPendingCount());
  const [viewMode, setViewMode] = useState<'register' | 'chart'>('register');
  const [trendData, setTrendData] = useState<{ date: string; PRESENT: number; ABSENT: number; LATE: number; EXCUSED: number }[]>([]);
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const [weekEvents, setWeekEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setIsClassLoading(true);
    classesService
      .list({ academicYear: '2026', page: 1, pageSize: 100 })
      .then((data) => {
        setClasses(data.classes);
        setClassId((current) => current || data.classes[0]?.id || '');
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Impossible de charger vos classes.'))
      .finally(() => setIsClassLoading(false));
  }, []);

  useEffect(() => {
    if (!classId) {
      setStudents([]);
      setRecords({});
      return;
    }
    let isMounted = true;
    setIsLoading(true);
    setMessage('');
    attendanceService
      .getClassAttendance(classId, date)
      .then((register) => {
        if (!isMounted) return;
        setStudents(register.students);
        const savedStatuses = new Map(register.attendance.map((item) => [item.studentId, item.status]));
        setRecords(Object.fromEntries(register.students.map((student) => [student.id, savedStatuses.get(student.id) ?? 'PRESENT'])));
        if ('fromOfflineCache' in register && register.fromOfflineCache) {
          setMessage('Connexion instable : registre chargé depuis le cache local.');
        }
      })
      .catch((error) => {
        if (isMounted) setMessage(error instanceof Error ? error.message : 'Impossible de charger le registre.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [classId, date]);

  useEffect(() => {
    if (viewMode !== 'chart' || !classId) return;
    setIsTrendLoading(true);
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
    void Promise.all(
      last7.map((d) =>
        attendanceService.getClassAttendance(classId, d)
          .then((register) => {
            const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
            register.attendance.forEach((item) => { counts[item.status as keyof typeof counts] += 1; });
            return { date: d, ...counts };
          })
          .catch(() => ({ date: d, PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 }))
      )
    ).then(setTrendData).finally(() => setIsTrendLoading(false));
  }, [viewMode, classId]);

  // Load week attendance events for the calendar
  const weekKey = useMemo(() => weekStart(date).toISOString().slice(0, 10), [date]);
  useEffect(() => {
    if (!classId) { setWeekEvents([]); return; }
    const className = classes.find(c => c.id === classId)?.name ?? 'Classe';
    const ws = weekStart(date);
    const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    void Promise.all(
      days.map(day => {
        const dateStr = day.toISOString().slice(0, 10);
        return attendanceService.getClassAttendance(classId, dateStr)
          .then(register => {
            const present = register.attendance.filter(a => a.status === 'PRESENT').length;
            const absent  = register.attendance.filter(a => a.status === 'ABSENT').length;
            const late    = register.attendance.filter(a => a.status === 'LATE').length;
            const total   = register.students.length;
            const taken   = register.attendance.length > 0;
            return {
              id: `att-${classId}-${dateStr}`,
              title: className,
              subtitle: taken ? `${present}✓  ${absent > 0 ? absent + '✗  ' : ''}${late > 0 ? late + '↺  ' : ''}/ ${total}` : 'Appel non fait',
              date: day,
              startMinutes: 7 * 60 + 30,
              endMinutes: 8 * 60 + 30,
              status: taken ? (absent > 0 || late > 0 ? 'in_review' : 'confirmed') : 'available',
            } satisfies CalendarEvent;
          })
          .catch(() => null);
      })
    ).then(evts => setWeekEvents(evts.filter(Boolean) as CalendarEvent[]));
  }, [classId, weekKey, classes]);

  const filteredStudents = students.filter((student) => `${student.firstName} ${student.lastName} ${student.studentCode}`.toLowerCase().includes(search.toLowerCase()));
  const summary = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    Object.values(records).forEach((status) => {
      counts[status] += 1;
    });
    return counts;
  }, [records]);

  const markAll = (status: AttendanceStatus) => {
    setRecords((current) => ({ ...current, ...Object.fromEntries(filteredStudents.map((student) => [student.id, status])) }));
  };

  const saveAttendance = async () => {
    if (!classId || !students.length) {
      setMessage('Sélectionnez une classe avec des élèves avant d’enregistrer.');
      return;
    }
    setIsSaving(true);
    setMessage('');
    try {
      const result = await attendanceService.saveClassAttendanceResilient(classId, date, Object.entries(records).map(([studentId, status]) => ({ studentId, status })));
      setPendingCount(result.pendingCount);
      setMessage(
        result.mode === 'online'
          ? 'Présences enregistrées. Les notifications parents sont traitées par l’API.'
          : 'Connexion faible : registre gardé localement. Il sera synchronisé dès que le réseau revient.'
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Impossible d’enregistrer les présences.');
    } finally {
      setIsSaving(false);
    }
  };

  const syncPending = async () => {
    setIsSyncing(true);
    setMessage('');
    try {
      const result = await attendanceService.syncPendingAttendance();
      setPendingCount(result.pendingCount);
      setMessage(result.synced ? `${result.synced} registre(s) synchronisé(s) avec l’API.` : 'Aucun registre en attente.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Synchronisation impossible pour le moment.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Appel quotidien</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink">Présences</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">Choisissez une classe, marquez rapidement chaque élève, puis sauvegardez le registre.</p>
          </div>
          <Button className="gap-2 bg-ocean hover:bg-ink" onClick={() => void saveAttendance()} disabled={isSaving}>
            <Save size={18} />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>

        <div className="mt-6">
          <OfflineSyncBanner isOnline={isOnline} pendingCount={pendingCount} isSyncing={isSyncing} onSync={() => void syncPending()} />
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Présents" value={String(summary.PRESENT)} icon={Check} tone="green" detail="Marqués aujourd’hui" />
          <StatCard label="Absents" value={String(summary.ABSENT)} icon={ShieldAlert} tone="clay" detail="Parents notifiés" />
          <StatCard label="Retards" value={String(summary.LATE)} icon={Clock} tone="orange" detail="À suivre" />
          <StatCard label="Excusés" value={String(summary.EXCUSED)} icon={MinusCircle} tone="blue" detail="Justifiés" />
        </section>

        <section className="mt-6">
          <WeekCalendar
            events={weekEvents}
            focusDate={date}
            onEventClick={(evt) => {
              const d = evt.date instanceof Date ? evt.date : new Date(evt.date);
              setDate(d.toISOString().slice(0, 10));
            }}
          />
        </section>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-bold text-ink/50 uppercase tracking-widest">{viewMode === 'register' ? 'Registre du jour' : 'Évolution 7 jours'}</p>
          <button
            onClick={() => setViewMode((v) => v === 'register' ? 'chart' : 'register')}
            className="flex items-center gap-3 rounded-full border border-ocean/10 bg-white px-4 py-2 shadow-card transition hover:shadow-soft"
            aria-label="Basculer entre registre et graphique"
          >
            <span className={`text-xs font-bold transition-colors ${viewMode === 'register' ? 'text-ink' : 'text-ink/35'}`}>Registre</span>
            <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${viewMode === 'chart' ? 'bg-ocean' : 'bg-ink/15'}`}>
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${viewMode === 'chart' ? 'translate-x-5' : 'translate-x-0'}`} />
            </span>
            <BarChart2 size={15} className={`transition-colors ${viewMode === 'chart' ? 'text-ocean' : 'text-ink/35'}`} />
            <span className={`text-xs font-bold transition-colors ${viewMode === 'chart' ? 'text-ink' : 'text-ink/35'}`}>Graphique</span>
          </button>
        </div>

        {viewMode === 'register' ? (
          <>
            <section className="mt-4 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
              <div className="grid gap-3 lg:grid-cols-[1fr_180px_1fr]">
                <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean" value={classId} onChange={(event) => setClassId(event.target.value)} disabled={isClassLoading}>
                  <option value="">{isClassLoading ? 'Chargement...' : 'Sélectionner une classe'}</option>
                  {classes.map((classRecord) => <option key={classRecord.id} value={classRecord.id}>{classRecord.name} · {classRecord.level}</option>)}
                </select>
                <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm outline-none focus:border-ocean" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
                  <Search size={18} className="text-ocean/55" />
                  <input className="w-full bg-transparent text-sm outline-none" placeholder="Rechercher dans le registre" value={search} onChange={(event) => setSearch(event.target.value)} />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {statuses.map((status) => <button key={status.value} className={`rounded-md px-3 py-2 text-xs font-bold ${status.className}`} onClick={() => markAll(status.value)}>Tout {status.label}</button>)}
              </div>
            </section>

            {message ? <p className="mt-4 rounded-md bg-sky px-3 py-2 text-sm font-semibold text-ocean">{message}</p> : null}

            <section className="mt-6">
              {isLoading ? <LoadingRows rows={6} /> : filteredStudents.length ? (
                <ResponsiveTable<StudentDto>
                  data={filteredStudents}
                  getRowKey={(student) => student.id}
                  columns={[
                    { key: 'student', header: 'Élève', render: (student) => <div><p className="font-bold">{student.firstName} {student.lastName}</p><p className="text-xs text-ink/50">{student.studentCode}</p></div> },
                    { key: 'status', header: 'Statut', render: (student) => <div className="flex flex-wrap gap-1">{statuses.map((status) => <button key={status.value} className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition ${records[student.id] === status.value ? status.className : 'bg-sky text-ocean hover:bg-ocean/10'}`} onClick={() => setRecords((current) => ({ ...current, [student.id]: status.value }))}>{status.label}</button>)}</div> }
                  ]}
                />
              ) : (
                <EmptyState icon={CalendarCheck} title="Aucun élève dans ce registre" description="Sélectionnez une classe assignée avec des élèves actifs." />
              )}
            </section>
          </>
        ) : (
          <section className="mt-4 rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
            <div className="mb-4 flex items-center gap-3">
              <select className="h-10 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean" value={classId} onChange={(event) => setClassId(event.target.value)} disabled={isClassLoading}>
                <option value="">{isClassLoading ? 'Chargement...' : 'Sélectionner une classe'}</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.level}</option>)}
              </select>
              <p className="text-xs text-ink/50 font-semibold">7 derniers jours</p>
            </div>
            {isTrendLoading ? (
              <div className="flex h-72 items-center justify-center">
                <span className="animate-pulse text-sm text-ink/40">Chargement du graphique…</span>
              </div>
            ) : (
              <div className="h-72">
                <Line
                  data={{
                    labels: trendData.map((d) => {
                      const [, m, day] = d.date.split('-');
                      return `${day}/${m}`;
                    }),
                    datasets: [
                      { label: 'Présents', data: trendData.map((d) => d.PRESENT), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.12)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 5, pointHoverRadius: 7, pointBackgroundColor: '#22c55e' },
                      { label: 'Absents', data: trendData.map((d) => d.ABSENT), borderColor: '#ce1021', backgroundColor: 'rgba(206,16,33,0.08)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 5, pointHoverRadius: 7, pointBackgroundColor: '#ce1021' },
                      { label: 'Retards', data: trendData.map((d) => d.LATE), borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 5, pointHoverRadius: 7, pointBackgroundColor: '#f97316' },
                      { label: 'Excusés', data: trendData.map((d) => d.EXCUSED), borderColor: '#007fff', backgroundColor: 'rgba(0,127,255,0.08)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 5, pointHoverRadius: 7, pointBackgroundColor: '#007fff' }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { intersect: false, mode: 'index' },
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, color: '#071b3a', font: { size: 12, weight: 700 }, padding: 16, usePointStyle: true } },
                      tooltip: { backgroundColor: 'rgba(7,27,58,0.92)', bodyFont: { size: 13, weight: 700 }, borderColor: 'rgba(255,255,255,0.16)', borderWidth: 1, cornerRadius: 14, padding: 12, titleFont: { size: 13, weight: 800 } }
                    },
                    scales: {
                      x: { border: { display: false }, grid: { display: false }, ticks: { color: 'rgba(7,27,58,0.55)', font: { size: 12, weight: 700 } } },
                      y: { border: { display: false }, grid: { color: 'rgba(0,127,255,0.08)' }, ticks: { color: 'rgba(7,27,58,0.48)', font: { size: 12, weight: 700 }, stepSize: 1 }, beginAtZero: true }
                    }
                  }}
                />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

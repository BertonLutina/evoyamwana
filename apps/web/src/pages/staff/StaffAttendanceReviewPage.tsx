import type { AttendanceStatus, ClassDto, StudentDto, UserRole } from '@evoyamwana/shared';
import { CalendarCheck, HeartPulse, Search, ShieldAlert, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import WeekCalendar, { type CalendarEvent } from '../../components/WeekCalendar';

function staffWeekStart(dateStr: string): Date {
  const d = new Date(dateStr); const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0, 0, 0, 0); return d;
}
function staffAddDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { attendanceService } from '../../services/attendance.service';
import { classesService } from '../../services/classes.service';

type ReviewRole = Extract<UserRole, 'NURSE' | 'DISCIPLINE_OFFICER'>;

const roleCopy: Record<ReviewRole, { eyebrow: string; title: string; description: string }> = {
  DISCIPLINE_OFFICER: {
    eyebrow: 'Suivi discipline',
    title: 'Présences et retards',
    description: 'Contrôlez les absences, retards et élèves à suivre depuis les registres existants.'
  },
  NURSE: {
    eyebrow: 'Infirmerie',
    title: 'Présences utiles santé',
    description: 'Consultez les présences par classe pour repérer les absences et retards liés au suivi santé.'
  }
};

const today = new Date().toISOString().slice(0, 10);
const statusLabels: Record<AttendanceStatus, string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  LATE: 'Retard',
  EXCUSED: 'Excusé'
};

export const StaffAttendanceReviewPage = ({ role }: { role: ReviewRole }) => {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [weekEvents, setWeekEvents] = useState<CalendarEvent[]>([]);
  const copy = roleCopy[role];

  useEffect(() => {
    let isMounted = true;
    classesService
      .list({ academicYear: '2026', page: 1, pageSize: 100 })
      .then((data) => {
        if (!isMounted) return;
        setClasses(data.classes);
        setClassId((current) => current || data.classes[0]?.id || '');
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les classes.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!classId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError('');
    attendanceService
      .getClassAttendance(classId, date)
      .then((register) => {
        if (!isMounted) return;
        setStudents(register.students);
        setAttendance(Object.fromEntries(register.attendance.map((item) => [item.studentId, item.status])));
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les présences.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [classId, date]);

  const weekKey = useMemo(() => staffWeekStart(date).toISOString().slice(0, 10), [date]);
  useEffect(() => {
    if (!classId) { setWeekEvents([]); return; }
    const className = classes.find(c => c.id === classId)?.name ?? 'Classe';
    const ws = staffWeekStart(date);
    const days = Array.from({ length: 7 }, (_, i) => staffAddDays(ws, i));
    void Promise.all(
      days.map(day => {
        const dateStr = day.toISOString().slice(0, 10);
        return attendanceService.getClassAttendance(classId, dateStr)
          .then(register => {
            const present = register.attendance.filter(a => a.status === 'PRESENT').length;
            const absent  = register.attendance.filter(a => a.status === 'ABSENT').length;
            const taken   = register.attendance.length > 0;
            return {
              id: `rev-${classId}-${dateStr}`,
              title: className,
              subtitle: taken ? `${present} présents · ${absent} absents` : 'Non fait',
              date: day,
              startMinutes: 7 * 60 + 30,
              endMinutes: 8 * 60 + 30,
              status: taken ? (absent > 0 ? 'in_review' : 'confirmed') : 'available',
            } satisfies CalendarEvent;
          })
          .catch(() => null);
      })
    ).then(evts => setWeekEvents(evts.filter(Boolean) as CalendarEvent[]));
  }, [classId, weekKey, classes]);

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return students;
    return students.filter((student) => `${student.firstName} ${student.lastName} ${student.studentCode}`.toLowerCase().includes(value));
  }, [search, students]);

  const counts = useMemo(() => {
    const values = Object.values(attendance);
    return {
      present: values.filter((status) => status === 'PRESENT').length,
      absent: values.filter((status) => status === 'ABSENT').length,
      late: values.filter((status) => status === 'LATE').length
    };
  }, [attendance]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">{copy.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">{copy.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">{copy.description}</p>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Présents" value={isLoading ? '...' : String(counts.present)} icon={CalendarCheck} tone="green" detail="Registre du jour" />
          <StatCard label="Absents" value={isLoading ? '...' : String(counts.absent)} icon={ShieldAlert} tone="orange" detail="À vérifier" />
          <StatCard label="Retards" value={isLoading ? '...' : String(counts.late)} icon={HeartPulse} tone="blue" detail="Suivi ciblé" />
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

        <section className="mt-6 grid gap-3 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel xl:grid-cols-[1fr_220px_1fr]">
          <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none" value={classId} onChange={(event) => setClassId(event.target.value)}>
            <option value="">Sélectionner une classe</option>
            {classes.map((classRecord) => <option key={classRecord.id} value={classRecord.id}>{classRecord.name}</option>)}
          </select>
          <input className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
            <Search size={18} className="text-ocean/55" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Rechercher dans le registre" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5">
          {isLoading ? (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <LoadingRows rows={7} />
            </article>
          ) : filteredStudents.length ? (
            <ResponsiveTable
              data={filteredStudents}
              getRowKey={(student) => student.id}
              columns={[
                { key: 'student', header: 'Élève', render: (student) => <div><p className="font-bold">{student.firstName} {student.lastName}</p><p className="text-xs text-ink/50">{student.studentCode}</p></div> },
                { key: 'class', header: 'Classe', render: (student) => student.class?.name ?? 'Non assigné' },
                { key: 'status', header: 'Statut', render: (student) => <span className="rounded-full bg-sky px-2.5 py-1 text-xs font-bold text-ocean">{statusLabels[attendance[student.id]] ?? 'Non marqué'}</span> },
                { key: 'parents', header: 'Responsables', render: (student) => student.parents?.map((item) => `${item.parent.firstName} ${item.parent.lastName}`).join(', ') || 'Aucun' }
              ]}
            />
          ) : (
            <EmptyState icon={UsersRound} title="Aucun élève dans ce registre" description="Choisissez une classe ou une date différente." />
          )}
        </section>
      </div>
    </div>
  );
};

import type { AttendanceDto, AttendanceStatus, ClassDto, StudentDto, UserRole } from '@evoyamwana/shared';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingRows } from '../components/LoadingRows';
import WeekCalendar, { type CalendarEvent } from '../components/WeekCalendar';
import { useAuth } from '../hooks/useAuth';
import { attendanceService } from '../services/attendance.service';
import { classesService } from '../services/classes.service';
import { studentsService } from '../services/students.service';

// ===== helpers =====
function planMonday(): Date {
  const d = new Date(); const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0, 0, 0, 0); return d;
}
function planAddDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function planWeekStart(dateStr: string): Date {
  const d = new Date(dateStr); const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0, 0, 0, 0); return d;
}

const ATT_MAP: Record<AttendanceStatus, string> = {
  PRESENT: 'confirmed', ABSENT: 'cancelled', LATE: 'in_review', EXCUSED: 'pending'
};

const TODAY_ISO = new Date().toISOString().slice(0, 10);

// ===== shared header =====
const PageHeader = ({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) => (
  <section className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:p-8">
    <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">{eyebrow}</p>
    <h1 className="mt-3 font-display text-4xl font-bold text-ink">{title}</h1>
    <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">{description}</p>
  </section>
);

// ===== live class attendance calendar (Teacher, ClassTutor, Discipline, Nurse) =====
const ClassWeekCalendar = ({
  eyebrow, title, description, clickPath,
}: {
  eyebrow: string; title: string; description: string; clickPath: string;
}) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(TODAY_ISO);
  const [weekEvents, setWeekEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    classesService
      .list({ academicYear: '2026', page: 1, pageSize: 100 })
      .then((data) => {
        if (!isMounted) return;
        setClasses(data.classes);
        setClassId((prev) => prev || data.classes[0]?.id || '');
      })
      .catch((e) => { if (isMounted) setError(e instanceof Error ? e.message : 'Erreur chargement classes'); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const weekKey = useMemo(() => planWeekStart(date).toISOString().slice(0, 10), [date]);

  useEffect(() => {
    if (!classId) { setWeekEvents([]); return; }
    const className = classes.find((c) => c.id === classId)?.name ?? 'Classe';
    const ws = planWeekStart(date);
    const days = Array.from({ length: 7 }, (_, i) => planAddDays(ws, i));
    void Promise.all(
      days.map((day) => {
        const ds = day.toISOString().slice(0, 10);
        return attendanceService
          .getClassAttendance(classId, ds)
          .then((reg) => {
            const present = reg.attendance.filter((a) => a.status === 'PRESENT').length;
            const absent = reg.attendance.filter((a) => a.status === 'ABSENT').length;
            const taken = reg.attendance.length > 0;
            return {
              id: `plan-${classId}-${ds}`,
              title: className,
              subtitle: taken ? `${present} presents - ${absent} absents` : 'Non fait',
              date: day,
              startMinutes: 7 * 60 + 30,
              endMinutes: 8 * 60 + 30,
              status: taken ? (absent > 0 ? 'in_review' : 'confirmed') : 'available',
            } satisfies CalendarEvent;
          })
          .catch(() => null);
      })
    ).then((evts) => setWeekEvents(evts.filter(Boolean) as CalendarEvent[]));
  }, [classId, weekKey, classes]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader eyebrow={eyebrow} title={title} description={description} />
        {error ? <p className="rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}
        <section className="flex flex-wrap gap-3">
          <select
            className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Toutes les classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            type="date"
            className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </section>
        {isLoading ? (
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <LoadingRows rows={4} />
          </article>
        ) : (
          <WeekCalendar
            events={weekEvents}
            focusDate={date}
            onEventClick={(evt) => {
              const d = evt.date instanceof Date ? evt.date : new Date(evt.date);
              setDate(d.toISOString().slice(0, 10));
              navigate(clickPath);
            }}
          />
        )}
      </div>
    </div>
  );
};

// ===== STUDENT planning =====
const StudentPlanning = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<AttendanceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    attendanceService
      .getMyAttendance()
      .then((data) => { if (mounted) setAttendance(data.attendance); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const events = useMemo<CalendarEvent[]>(
    () => attendance.map((item) => ({
      id: `stu-${item.id}`,
      title: item.class?.name ?? 'Cours',
      date: new Date(item.date),
      startMinutes: 7 * 60 + 30,
      endMinutes: 12 * 60 + 30,
      status: ATT_MAP[item.status],
    })),
    [attendance]
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader
          eyebrow="Espace eleve"
          title="Mon planning scolaire"
          description="Retrouvez votre historique de presences et votre emploi du temps sur la semaine."
        />
        {isLoading ? (
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <LoadingRows rows={4} />
          </article>
        ) : (
          <WeekCalendar events={events} focusDate={new Date()} onEventClick={() => navigate('/attendance')} />
        )}
      </div>
    </div>
  );
};

// ===== PARENT planning =====
type ChildAtt = { student: StudentDto; attendance: AttendanceDto[] };

const ParentPlanning = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildAtt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    studentsService
      .list({ page: 1, pageSize: 100, status: 'all' })
      .then((result) =>
        Promise.all(
          result.students.map(async (student) => ({
            student,
            attendance: await attendanceService.getStudentAttendance(student.id),
          }))
        )
      )
      .then((rows) => { if (mounted) setChildren(rows); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const events = useMemo<CalendarEvent[]>(
    () =>
      children.flatMap(({ student, attendance }) =>
        attendance.map((item) => ({
          id: `par-${item.id}`,
          title: `${student.firstName} ${student.lastName}`.trim(),
          subtitle: item.class?.name ?? student.class?.name ?? '-',
          date: new Date(item.date),
          startMinutes: 7 * 60 + 30,
          endMinutes: 12 * 60 + 30,
          status: ATT_MAP[item.status],
        }))
      ),
    [children]
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader
          eyebrow="Espace parent"
          title="Planning de mes enfants"
          description="Retrouvez les presences de vos enfants sur la semaine et consultez leur suivi scolaire."
        />
        {isLoading ? (
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <LoadingRows rows={4} />
          </article>
        ) : (
          <WeekCalendar events={events} focusDate={new Date()} onEventClick={() => navigate('/attendance')} />
        )}
      </div>
    </div>
  );
};

// ===== GENERIC planning (static events per role) =====
type GenericCfg = {
  eyebrow: string;
  title: string;
  description: string;
  events: (mon: Date) => CalendarEvent[];
  clickPath: string;
};

const GENERIC: Partial<Record<UserRole, GenericCfg>> = {
  SUPER_ADMIN: {
    eyebrow: 'Pilotage plateforme',
    title: 'Planning plateforme',
    description: 'Supervision hebdomadaire des ecoles et activites EVOYAMWANA.',
    clickPath: '/classes',
    events: (mon) => [
      { id: 'sp-0', title: 'Audit ecoles', subtitle: 'Qualite des donnees', date: planAddDays(mon, 0), startMinutes: 8 * 60, endMinutes: 9 * 60, status: 'confirmed' },
      { id: 'sp-1', title: 'Revue admins', subtitle: 'Permissions et activite', date: planAddDays(mon, 1), startMinutes: 10 * 60, endMinutes: 11 * 60, status: 'confirmed' },
      { id: 'sp-2', title: 'Support technique', subtitle: 'Incidents et tickets', date: planAddDays(mon, 2), startMinutes: 8 * 60, endMinutes: 9 * 60 + 30, status: 'in_review' },
      { id: 'sp-3', title: 'Analyse adoption', subtitle: 'Metriques hebdo', date: planAddDays(mon, 3), startMinutes: 14 * 60, endMinutes: 15 * 60, status: 'confirmed' },
      { id: 'sp-4', title: 'Rapport semaine', subtitle: 'Bilan et planification', date: planAddDays(mon, 4), startMinutes: 9 * 60, endMinutes: 10 * 60, status: 'confirmed' },
    ],
  },
  DIRECTOR: {
    eyebrow: 'Direction',
    title: 'Planning direction',
    description: 'Pilotage hebdomadaire de votre ecole - suivi des presences, resultats et communications.',
    clickPath: '/attendance',
    events: (mon) => [
      { id: 'dr-0', title: 'Revue presences', subtitle: 'Direction', date: planAddDays(mon, 0), startMinutes: 7 * 60 + 30, endMinutes: 8 * 60 + 30, status: 'confirmed' },
      { id: 'dr-1', title: 'Suivi pedagogique', subtitle: 'Direction', date: planAddDays(mon, 1), startMinutes: 10 * 60, endMinutes: 11 * 60, status: 'confirmed' },
      { id: 'dr-2', title: 'Reunion staff', subtitle: 'Direction', date: planAddDays(mon, 2), startMinutes: 8 * 60, endMinutes: 9 * 60, status: 'in_review' },
      { id: 'dr-3', title: 'Analyse resultats', subtitle: 'Direction', date: planAddDays(mon, 3), startMinutes: 14 * 60, endMinutes: 15 * 60, status: 'confirmed' },
      { id: 'dr-4', title: 'Bilan de semaine', subtitle: 'Direction', date: planAddDays(mon, 4), startMinutes: 9 * 60, endMinutes: 10 * 60, status: 'confirmed' },
    ],
  },
  SCHOOL_ADMIN: {
    eyebrow: 'Administration',
    title: 'Planning administratif',
    description: "Agenda hebdomadaire de l'administration scolaire.",
    clickPath: '/attendance',
    events: (mon) => [
      { id: 'sa-0', title: 'Inscriptions', subtitle: 'Administration', date: planAddDays(mon, 0), startMinutes: 8 * 60, endMinutes: 10 * 60, status: 'confirmed' },
      { id: 'sa-1', title: 'Paiements du jour', subtitle: 'Administration', date: planAddDays(mon, 1), startMinutes: 8 * 60, endMinutes: 9 * 60, status: 'confirmed' },
      { id: 'sa-2', title: 'Messages parents', subtitle: 'Administration', date: planAddDays(mon, 2), startMinutes: 9 * 60, endMinutes: 10 * 60, status: 'in_review' },
      { id: 'sa-3', title: 'Suivi presences', subtitle: 'Administration', date: planAddDays(mon, 3), startMinutes: 8 * 60, endMinutes: 9 * 60, status: 'confirmed' },
      { id: 'sa-4', title: 'Rapport hebdo', subtitle: 'Administration', date: planAddDays(mon, 4), startMinutes: 14 * 60, endMinutes: 15 * 60, status: 'confirmed' },
    ],
  },
  SECRETARY: {
    eyebrow: 'Secretariat',
    title: 'Planning secretariat',
    description: 'Organisation hebdomadaire du secretariat - dossiers, accueil et suivi administratif.',
    clickPath: '/students',
    events: (mon) => [
      { id: 'sec-0', title: 'Accueil parents', subtitle: 'Secretariat', date: planAddDays(mon, 0), startMinutes: 8 * 60, endMinutes: 10 * 60, status: 'confirmed' },
      { id: 'sec-1', title: 'Dossiers eleves', subtitle: 'Secretariat', date: planAddDays(mon, 1), startMinutes: 9 * 60, endMinutes: 11 * 60, status: 'confirmed' },
      { id: 'sec-2', title: 'Inscriptions', subtitle: 'Secretariat', date: planAddDays(mon, 2), startMinutes: 8 * 60, endMinutes: 12 * 60, status: 'pending' },
      { id: 'sec-3', title: 'Suivi administratif', subtitle: 'Secretariat', date: planAddDays(mon, 3), startMinutes: 9 * 60, endMinutes: 11 * 60, status: 'confirmed' },
      { id: 'sec-4', title: 'Archivage hebdo', subtitle: 'Secretariat', date: planAddDays(mon, 4), startMinutes: 14 * 60, endMinutes: 16 * 60, status: 'confirmed' },
    ],
  },
  ACCOUNTANT: {
    eyebrow: 'Comptabilite',
    title: 'Planning financier',
    description: 'Suivi des paiements et gestion financiere hebdomadaire.',
    clickPath: '/payments',
    events: (mon) => [
      { id: 'ac-0', title: 'Collecte paiements', subtitle: 'Comptabilite', date: planAddDays(mon, 0), startMinutes: 8 * 60, endMinutes: 10 * 60, status: 'pending' },
      { id: 'ac-1', title: 'Relances familles', subtitle: 'Comptabilite', date: planAddDays(mon, 1), startMinutes: 10 * 60, endMinutes: 12 * 60, status: 'in_review' },
      { id: 'ac-2', title: 'Recus et soldes', subtitle: 'Comptabilite', date: planAddDays(mon, 2), startMinutes: 8 * 60, endMinutes: 10 * 60, status: 'confirmed' },
      { id: 'ac-3', title: 'Rapport mensuel', subtitle: 'Comptabilite', date: planAddDays(mon, 3), startMinutes: 14 * 60, endMinutes: 16 * 60, status: 'confirmed' },
      { id: 'ac-4', title: 'Bilan paiements', subtitle: 'Comptabilite', date: planAddDays(mon, 4), startMinutes: 9 * 60, endMinutes: 11 * 60, status: 'confirmed' },
    ],
  },
  LIBRARIAN: {
    eyebrow: 'Bibliotheque',
    title: 'Planning bibliotheque',
    description: 'Organisation hebdomadaire des emprunts, retours et gestion des ressources.',
    clickPath: '/students',
    events: (mon) => [
      { id: 'lb-0', title: 'Emprunts & retours', subtitle: 'Bibliotheque', date: planAddDays(mon, 0), startMinutes: 8 * 60, endMinutes: 12 * 60, status: 'confirmed' },
      { id: 'lb-1', title: 'Inventaire rayons', subtitle: 'Bibliotheque', date: planAddDays(mon, 1), startMinutes: 8 * 60, endMinutes: 10 * 60, status: 'available' },
      { id: 'lb-2', title: 'Accueil lecteurs', subtitle: 'Bibliotheque', date: planAddDays(mon, 2), startMinutes: 10 * 60, endMinutes: 14 * 60, status: 'confirmed' },
      { id: 'lb-3', title: 'Commandes livres', subtitle: 'Bibliotheque', date: planAddDays(mon, 3), startMinutes: 9 * 60, endMinutes: 11 * 60, status: 'pending' },
      { id: 'lb-4', title: 'Rapport emprunts', subtitle: 'Bibliotheque', date: planAddDays(mon, 4), startMinutes: 14 * 60, endMinutes: 16 * 60, status: 'confirmed' },
    ],
  },
  TRANSPORT_MANAGER: {
    eyebrow: 'Transport',
    title: 'Planning transport',
    description: 'Gestion hebdomadaire des trajets scolaires et suivi des eleves transportes.',
    clickPath: '/students',
    events: (mon) =>
      [0, 1, 2, 3, 4].flatMap((i) => [
        { id: `tr-${i}a`, title: 'Trajet matin', subtitle: 'Transport', date: planAddDays(mon, i), startMinutes: 6 * 60 + 30, endMinutes: 7 * 60 + 30, status: 'confirmed' as const },
        { id: `tr-${i}b`, title: 'Trajet retour', subtitle: 'Transport', date: planAddDays(mon, i), startMinutes: 12 * 60 + 30, endMinutes: 13 * 60 + 30, status: 'confirmed' as const },
      ]),
  },
  CANTEEN_MANAGER: {
    eyebrow: 'Cantine',
    title: 'Planning cantine',
    description: 'Menu et gestion hebdomadaire de la restauration scolaire.',
    clickPath: '/payments',
    events: (mon) =>
      [0, 1, 2, 3, 4].map((i) => ({
        id: `cn-${i}`,
        title: 'Service repas',
        subtitle: 'Cantine',
        date: planAddDays(mon, i),
        startMinutes: 12 * 60,
        endMinutes: 14 * 60,
        status: 'confirmed' as const,
      })),
  },
};

const GenericPlanning = ({ role }: { role: UserRole }) => {
  const navigate = useNavigate();
  const config = GENERIC[role];
  const mon = useMemo(planMonday, []);
  const events = useMemo(() => config?.events(mon) ?? [], [config, mon]);
  if (!config) return null;
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader eyebrow={config.eyebrow} title={config.title} description={config.description} />
        <WeekCalendar events={events} focusDate={new Date()} onEventClick={() => navigate(config.clickPath)} />
      </div>
    </div>
  );
};

// ===== main entry =====
export const PlanningPage = () => {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case 'TEACHER':
      return (
        <ClassWeekCalendar
          eyebrow="Espace enseignant"
          title="Planning de mes classes"
          description="Visualisez les presences de vos classes sur la semaine et naviguez vers le registre d'appel."
          clickPath="/attendance"
        />
      );
    case 'CLASS_TUTOR':
      return (
        <ClassWeekCalendar
          eyebrow="Titulaire"
          title="Planning de ma classe"
          description="Suivez les presences de votre classe principale et consultez le registre d'appel."
          clickPath="/attendance"
        />
      );
    case 'STUDENT':
      return <StudentPlanning />;
    case 'PARENT':
      return <ParentPlanning />;
    case 'DISCIPLINE_OFFICER':
      return (
        <ClassWeekCalendar
          eyebrow="Suivi discipline"
          title="Planning presences & discipline"
          description="Controlez les absences et retards par classe sur la semaine."
          clickPath="/attendance"
        />
      );
    case 'NURSE':
      return (
        <ClassWeekCalendar
          eyebrow="Infirmerie"
          title="Planning presences sante"
          description="Consultez les presences par classe pour reperer les absences liees au suivi sante."
          clickPath="/attendance"
        />
      );
    default:
      return <GenericPlanning role={user.role} />;
  }
};

import type { ClassDto, StudentGradeSummaryDto, TeacherDto } from '@evoyamwana/shared';
import { BookOpen, CalendarCheck, ClipboardList, GraduationCap, MessageSquare, ShieldCheck, TrendingUp, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { StatCard } from '../../components/StatCard';
import WeekCalendar, { type CalendarEvent } from '../../components/WeekCalendar';
import { classesService } from '../../services/classes.service';
import { gradesService } from '../../services/grades.service';
import { messagesService, type MessageContactDto } from '../../services/messages.service';
import { teachersService } from '../../services/teachers.service';
import type { DashboardPageProps } from './types';

const STATUS_BY_INDEX = ['confirmed', 'available', 'pending', 'in_review', 'completed', 'reserved'] as const;
const HOUR_BY_INDEX   = [8, 10, 12, 14, 7, 9, 11];

function mondayOfCurrentWeek(): Date {
  const d = new Date(); const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0, 0, 0, 0); return d;
}
function addDaysLocal(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

export const TeacherDashboard = ({ user, summary, isLoading, error, navigate }: DashboardPageProps) => {
  const [teacher, setTeacher] = useState<TeacherDto | null>(null);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [gradeSummaries, setGradeSummaries] = useState<StudentGradeSummaryDto[]>([]);
  const [contacts, setContacts] = useState<MessageContactDto[]>([]);
  const [isTeacherLoading, setIsTeacherLoading] = useState(true);
  const [teacherError, setTeacherError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsTeacherLoading(true);
    setTeacherError('');

    Promise.all([
      teachersService.getMe(),
      classesService.list({ academicYear: '2026', page: 1, pageSize: 100 }),
      gradesService.summaries({ term: 'Trimestre 2', page: 1, pageSize: 100 }),
      messagesService.listContacts()
    ])
      .then(([teacherProfile, classResult, gradeResult, messageContacts]) => {
        if (!isMounted) return;
        setTeacher(teacherProfile);
        setClasses(classResult.classes);
        setGradeSummaries(gradeResult.summaries);
        setContacts(messageContacts);
      })
      .catch((loadError) => {
        if (isMounted) setTeacherError(loadError instanceof Error ? loadError.message : 'Impossible de charger votre espace enseignant.');
      })
      .finally(() => {
        if (isMounted) setIsTeacherLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const monday = mondayOfCurrentWeek();
    return classes.flatMap((cls, idx) => {
      const hour = HOUR_BY_INDEX[idx % HOUR_BY_INDEX.length];
      const status = STATUS_BY_INDEX[idx % STATUS_BY_INDEX.length];
      // Mon–Fri (0–4)
      return Array.from({ length: 5 }, (_, dayOffset) => ({
        id: `cls-${cls.id}-d${dayOffset}`,
        title: cls.name,
        subtitle: cls.subjects?.map(s => s.name).join(', ') || cls.level,
        date: addDaysLocal(monday, dayOffset),
        startMinutes: hour * 60,
        endMinutes: hour * 60 + 90,
        status,
      }));
    });
  }, [classes]);

  const studentCount = useMemo(() => classes.reduce((total, classRecord) => total + (classRecord.students?.length ?? classRecord._count?.students ?? 0), 0), [classes]);
  const subjectNames = useMemo(() => {
    const subjects = new Map<string, string>();
    classes.forEach((classRecord) => classRecord.subjects?.forEach((subject) => subjects.set(subject.id, subject.name)));
    teacher?.subjects?.forEach((subject) => subjects.set(subject.id, subject.name));
    return Array.from(subjects.values());
  }, [classes, teacher]);
  const average = gradeSummaries.length ? Math.round(gradeSummaries.reduce((total, item) => total + item.weightedAveragePercent, 0) / gradeSummaries.length) : 0;
  const parentContacts = contacts.filter((contact) => contact.role === 'PARENT').length;
  const topClasses = classes.slice(0, 3);
  const topStudents = gradeSummaries.slice(0, 5);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_360px] xl:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">Tableau enseignant</p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
                Bonjour {teacher?.firstName ?? user.fullName.split(' ')[0]}, vos classes sont prêtes.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/62">
                Suivez vos groupes assignés, faites l’appel, saisissez les notes et gardez le lien avec les parents depuis le même espace.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {subjectNames.slice(0, 5).map((subject) => (
                  <span key={subject} className="rounded-full bg-sky px-3 py-1.5 text-xs font-bold text-ocean">
                    {subject}
                  </span>
                ))}
                {subjectNames.length > 5 ? <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-ember">+{subjectNames.length - 5} cours</span> : null}
              </div>
            </div>

            <article className="rounded-lg border border-ocean/10 bg-[linear-gradient(135deg,#eef6ff,#ffffff)] p-5">
              <div className="flex items-start gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-lg bg-ocean text-lg font-black text-white">
                  {(teacher?.firstName ?? user.fullName)[0]}{(teacher?.lastName ?? 'E')[0]}
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-ember">Profil connecté</p>
                  <h3 className="mt-1 text-xl font-bold text-ink">{teacher ? `${teacher.firstName} ${teacher.lastName}` : user.fullName}</h3>
                  <p className="mt-1 text-sm text-ink/55">{teacher?.employeeNumber ?? 'Espace enseignant'}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => navigate('/attendance')} className="rounded-md bg-ocean px-3 py-3 text-sm font-bold text-white transition hover:bg-ink">
                  Faire l’appel
                </button>
                <button type="button" onClick={() => navigate('/grades')} className="rounded-md border border-ocean/15 bg-white px-3 py-3 text-sm font-bold text-ocean transition hover:bg-sky">
                  Saisir notes
                </button>
              </div>
            </article>
          </div>
        </section>

        {error || teacherError ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error || teacherError}</p> : null}

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Classes assignées" value={isLoading || isTeacherLoading ? '...' : String(classes.length || summary.totals.classes)} icon={BookOpen} tone="blue" detail="Depuis le backend" />
          <StatCard label="Élèves suivis" value={isLoading || isTeacherLoading ? '...' : String(studentCount || summary.totals.students)} icon={GraduationCap} tone="orange" detail="Dans vos classes" />
          <StatCard label="Moyenne classe" value={isTeacherLoading ? '...' : `${average}%`} icon={TrendingUp} tone="green" detail="Trimestre 2" />
          <StatCard label="Contacts parents" value={isTeacherLoading ? '...' : String(parentContacts)} icon={MessageSquare} tone="clay" detail="Familles accessibles" />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Mes classes</p>
                <h3 className="mt-1 text-xl font-bold">Groupes assignés</h3>
              </div>
              <Button variant="ghost" className="text-ocean" onClick={() => navigate('/classes')}>Tout voir</Button>
            </div>
            <div className="mt-5 grid gap-3">
              {isTeacherLoading ? <LoadingRows rows={4} /> : topClasses.length ? topClasses.map((classRecord) => (
                <button key={classRecord.id} type="button" onClick={() => navigate(`/classes/${classRecord.id}`)} className="rounded-lg border border-ocean/10 bg-sky/55 p-4 text-left transition hover:border-ocean/30 hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-ink">{classRecord.name}</p>
                      <p className="mt-1 text-sm text-ink/55">{classRecord.level} · {classRecord.room ?? 'Salle non définie'}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ocean">{classRecord.students?.length ?? classRecord._count?.students ?? 0} élèves</span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-ink/50">{classRecord.subjects?.map((subject) => subject.name).join(' · ') || 'Aucun cours lié'}</p>
                </button>
              )) : <EmptyState icon={BookOpen} title="Aucune classe assignée" description="Les classes rattachées à votre profil apparaîtront ici." />}
            </div>
          </article>

          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Aujourd’hui</p>
                <h3 className="mt-1 text-xl font-bold">Priorités</h3>
              </div>
              <ShieldCheck className="text-ocean" size={22} />
            </div>
            <div className="mt-5 grid gap-3">
              <QuickAction icon={CalendarCheck} label="Présences du jour" value={`${summary.attendance.rate}%`} onClick={() => navigate('/attendance')} />
              <QuickAction icon={ClipboardList} label="Notes à saisir" value={`${gradeSummaries.length} élèves`} onClick={() => navigate('/grades')} />
              <QuickAction icon={UsersRound} label="Messages parents" value={`${parentContacts} contacts`} onClick={() => navigate('/messages')} />
            </div>
          </article>
        </section>

        <section className="mt-5 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Performance</p>
              <h3 className="mt-1 text-xl font-bold">Élèves à suivre</h3>
            </div>
            <Button variant="ghost" className="text-ocean" onClick={() => navigate('/grades')}>Ouvrir les notes</Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {isTeacherLoading ? <LoadingRows rows={5} /> : topStudents.length ? topStudents.map((student) => (
              <article key={student.studentId} className="rounded-lg border border-ocean/10 bg-sky/45 p-4">
                <p className="font-bold text-ink">{student.student.firstName} {student.student.lastName}</p>
                <p className="mt-1 text-xs text-ink/50">{student.class?.name ?? 'Classe'} · {student.subjectCount} cours</p>
                <p className="mt-3 font-display text-3xl font-bold text-ocean">{student.weightedAveragePercent}%</p>
              </article>
            )) : <EmptyState icon={TrendingUp} title="Aucune note enregistrée" description="Les moyennes apparaîtront après la première évaluation." />}
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Planning</p>
              <h3 className="mt-1 text-xl font-bold text-ink">Calendrier de la semaine</h3>
            </div>
            <Button variant="ghost" className="text-ocean" onClick={() => navigate('/attendance')}>Faire l'appel</Button>
          </div>
          <WeekCalendar
            events={calendarEvents}
            onEventClick={() => navigate('/attendance')}
          />
        </section>
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, value, onClick }: { icon: typeof CalendarCheck; label: string; value: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="flex items-center justify-between rounded-lg border border-ocean/10 bg-sky/60 p-4 text-left transition hover:border-ocean/30 hover:bg-white">
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-ocean">
        <Icon size={19} />
      </span>
      <span className="font-bold text-ink">{label}</span>
    </div>
    <span className="font-display text-2xl font-bold text-ink">{value}</span>
  </button>
);

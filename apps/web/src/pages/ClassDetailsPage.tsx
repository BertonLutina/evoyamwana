import type { ClassDto } from '@evoyamwana/shared';
import { ArrowLeft, BookOpen, CalendarDays, GraduationCap, MapPin, School, Timer, UserRoundCheck, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { LoadingRows } from '../components/LoadingRows';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { StatCard } from '../components/StatCard';
import { classesService } from '../services/classes.service';

export const ClassDetailsPage = () => {
  const { id } = useParams();
  const [classRecord, setClassRecord] = useState<ClassDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    setError('');
    classesService
      .get(id)
      .then(setClassRecord)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load class');
        setClassRecord(null);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
          <LoadingRows rows={8} />
        </div>
      </div>
    );
  }

  if (!classRecord) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <EmptyState icon={School} title="Class not found" description={error || 'This class is unavailable.'} />
      </div>
    );
  }

  const teacherName = classRecord.teacher ? `${classRecord.teacher.firstName} ${classRecord.teacher.lastName}` : 'Unassigned';
  const students = classRecord.students ?? [];
  const subjects = classRecord.subjects ?? [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/classes" className="inline-flex items-center gap-2 text-sm font-bold text-ocean">
          <ArrowLeft size={16} />
          Back to classes
        </Link>

        <section className="mt-5 overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="brand-hero-card p-6 sm:p-8">
            <div className="grid gap-6 xl:grid-cols-[1fr_320px] xl:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-ember">Class profile</p>
                <h2 className="mt-2 font-display text-5xl font-bold leading-tight text-ink">{classRecord.name}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
                  {classRecord.level} · Section {classRecord.section ?? 'not set'} · Academic year {classRecord.academicYear}
                </p>
              </div>
              <div className="rounded-lg border border-ocean/10 bg-white/80 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ocean">Main teacher</p>
                {classRecord.teacher ? (
                  <Link to={`/teachers/${classRecord.teacher.id}`} className="mt-2 block text-2xl font-bold text-ink transition hover:text-ocean">
                    {teacherName}
                  </Link>
                ) : (
                  <p className="mt-2 text-2xl font-bold text-ink">Unassigned</p>
                )}
                <p className="mt-1 text-sm text-ink/55">{classRecord.teacher?.user?.email ?? 'No teacher email'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Students" value={String(classRecord._count?.students ?? students.length)} icon={GraduationCap} tone="blue" detail="Learners assigned to this class" />
          <StatCard label="Subjects" value={String(classRecord._count?.subjects ?? subjects.length)} icon={BookOpen} tone="orange" detail="Subject loads configured" />
          <StatCard label="Academic year" value={classRecord.academicYear} icon={CalendarDays} tone="blue" detail="Current planning cycle" />
          <StatCard label="Teacher" value={classRecord.teacher ? '1' : '0'} icon={UserRoundCheck} tone="green" detail={teacherName} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.75fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center gap-2">
              <School size={20} className="text-ocean" />
              <h3 className="text-xl font-bold text-ink">Informations complètes</h3>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ['Nom', classRecord.name],
                ['Niveau', classRecord.level],
                ['Section', classRecord.section ?? 'Non défini'],
                ['Cycle', classRecord.cycle ?? 'Non défini'],
                ['Option / Filière', classRecord.option ?? 'Non défini'],
                ['Année académique', classRecord.academicYear],
                ['Salle', classRecord.room ?? 'Non définie'],
                ['Capacité', classRecord.capacity ? `${students.length}/${classRecord.capacity} élèves` : 'Non définie'],
                ['Vacation', classRecord.shift ?? 'Non définie'],
                ['Teacher principal', teacherName]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-ocean/10 bg-sky p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-ocean/70">{label}</p>
                  <p className="mt-1 font-bold text-ink">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-ocean/10 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-ocean/70">Description</p>
              <p className="mt-2 text-sm leading-6 text-ink/60">{classRecord.description ?? 'Aucune description enregistrée.'}</p>
            </div>
          </article>

          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <h3 className="text-xl font-bold text-ink">Organisation</h3>
            <div className="mt-5 grid gap-3">
              <div className="flex items-center gap-3 rounded-lg bg-sky p-4">
                <MapPin className="text-ocean" size={20} />
                <div>
                  <p className="text-sm font-bold">Salle de classe</p>
                  <p className="text-sm text-ink/55">{classRecord.room ?? 'Non définie'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-sky p-4">
                <UsersRound className="text-ember" size={20} />
                <div>
                  <p className="text-sm font-bold">Capacité</p>
                  <p className="text-sm text-ink/55">{classRecord.capacity ? `${classRecord.capacity} places` : 'Non définie'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-sky p-4">
                <Timer className="text-ocean" size={20} />
                <div>
                  <p className="text-sm font-bold">Vacation</p>
                  <p className="text-sm text-ink/55">{classRecord.shift ?? 'Non définie'}</p>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-ember" />
              <h3 className="text-xl font-bold text-ink">Subjects</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {subjects.length ? subjects.map((subject) => (
                <div key={subject.id} className="rounded-lg border border-ocean/10 bg-sky p-4">
                  <p className="font-bold text-ink">{subject.name}</p>
                  <p className="mt-1 text-sm text-ink/55">{subject.code}</p>
                </div>
              )) : (
                <p className="text-sm text-ink/55">No subjects assigned yet.</p>
              )}
            </div>
          </article>

          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Roster</p>
                <h3 className="mt-1 text-xl font-bold text-ink">Students in this class</h3>
              </div>
              <span className="rounded-full bg-sky px-3 py-1 text-xs font-bold text-ocean">{students.length} learners</span>
            </div>
            <ResponsiveTable
              data={students}
              getRowKey={(student) => student.id}
              emptyState={<EmptyState icon={GraduationCap} title="No students" description="Students assigned to this class will appear here." />}
              columns={[
                {
                  key: 'student',
                  header: 'Student',
                  render: (student) => (
                    <Link to={`/students/${student.id}`} className="font-bold text-ink transition hover:text-ocean">
                      {student.firstName} {student.lastName}
                    </Link>
                  )
                },
                { key: 'code', header: 'Code', render: (student) => student.studentCode },
                {
                  key: 'profile',
                  header: 'Profile',
                  render: (student) => <Link className="font-bold text-ocean hover:text-ember" to={`/students/${student.id}`}>Open</Link>
                }
              ]}
            />
          </article>
        </section>
      </div>
    </div>
  );
};

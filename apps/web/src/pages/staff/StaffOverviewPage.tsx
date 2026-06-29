import type { ClassDto, ParentDto, StudentDto, TeacherDto } from '@evoyamwana/shared';
import { BookOpen, CalendarCheck, GraduationCap, Search, ShieldCheck, UserRoundCheck, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { classesService } from '../../services/classes.service';
import { parentsService } from '../../services/parents.service';
import { studentsService } from '../../services/students.service';
import { teachersService } from '../../services/teachers.service';

type StaffMode = 'director' | 'secretary';

const copy = {
  director: {
    eyebrow: 'Pilotage direction',
    title: 'Supervision scolaire',
    description: 'Vue consolidée des élèves, classes, enseignants et familles pour piloter l’école avec des données réelles.',
    search: 'Rechercher élèves, classes, enseignants',
    empty: 'Les données de supervision apparaîtront ici.'
  },
  secretary: {
    eyebrow: 'Secrétariat',
    title: 'Dossiers administratifs',
    description: 'Inscriptions, contacts parents, classes et informations utiles au secrétariat de l’école.',
    search: 'Rechercher dossier élève, parent ou classe',
    empty: 'Les dossiers administratifs apparaîtront ici.'
  }
};

export const StaffOverviewPage = ({ mode }: { mode: StaffMode }) => {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [parents, setParents] = useState<ParentDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const texts = copy[mode];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');
    Promise.all([
      studentsService.list({ page: 1, pageSize: 100, status: 'active' }),
      parentsService.list({ page: 1, pageSize: 100 }),
      classesService.list({ academicYear: '2026', page: 1, pageSize: 100 }),
      teachersService.list({ page: 1, pageSize: 100 })
    ])
      .then(([studentResult, parentResult, classResult, teacherResult]) => {
        if (!isMounted) return;
        setStudents(studentResult.students);
        setParents(parentResult.parents);
        setClasses(classResult.classes);
        setTeachers(teacherResult.teachers);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les données.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase();
    return students.filter((student) => `${student.firstName} ${student.lastName} ${student.studentCode} ${student.class?.name ?? ''}`.toLowerCase().includes(query)).slice(0, 12);
  }, [search, students]);
  const assignedStudents = classes.reduce((total, item) => total + (item._count?.students ?? item.students?.length ?? 0), 0);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_320px] xl:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">{texts.eyebrow}</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">{texts.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">{texts.description}</p>
            </div>
            <article className="rounded-lg border border-ocean/10 bg-sky p-5">
              <ShieldCheck className="text-ocean" size={28} />
              <p className="mt-4 text-sm font-bold text-ink">Accès sécurisé</p>
              <p className="mt-1 text-sm text-ink/55">Données isolées par école via l’API.</p>
            </article>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5 grid gap-4 md:grid-cols-4">
          <StatCard label="Élèves" value={isLoading ? '...' : String(students.length)} icon={GraduationCap} tone="blue" detail="Dossiers actifs" />
          <StatCard label="Parents" value={isLoading ? '...' : String(parents.length)} icon={UsersRound} tone="orange" detail="Responsables liés" />
          <StatCard label="Classes" value={isLoading ? '...' : String(classes.length)} icon={BookOpen} tone="green" detail={`${assignedStudents} places occupées`} />
          <StatCard label="Enseignants" value={isLoading ? '...' : String(teachers.length)} icon={UserRoundCheck} tone="clay" detail="Profils pédagogiques" />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
            <Search size={18} className="text-ocean/55" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder={texts.search} value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Élèves</p>
                <h3 className="mt-1 text-xl font-bold">Dossiers récents</h3>
              </div>
              <GraduationCap className="text-ember" size={22} />
            </div>
            <div className="mt-5">
              {isLoading ? (
                <LoadingRows rows={6} />
              ) : (
                <ResponsiveTable
                  data={filteredStudents}
                  getRowKey={(student) => student.id}
                  columns={[
                    { key: 'name', header: 'Élève', render: (student) => <span className="font-bold">{student.firstName} {student.lastName}</span> },
                    { key: 'code', header: 'Code', render: (student) => student.studentCode },
                    { key: 'class', header: 'Classe', render: (student) => student.class?.name ?? 'Non assigné' },
                    { key: 'status', header: 'Statut', render: (student) => student.isActive ? 'Actif' : 'Inactif' }
                  ]}
                  emptyState={<EmptyState icon={GraduationCap} title="Aucun dossier" description={texts.empty} />}
                />
              )}
            </div>
          </article>

          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Priorités</p>
                <h3 className="mt-1 text-xl font-bold">Suivi école</h3>
              </div>
              <CalendarCheck className="text-ocean" size={22} />
            </div>
            <div className="mt-5 grid gap-3">
              {classes.slice(0, 5).map((classRecord) => (
                <div key={classRecord.id} className="rounded-lg border border-ocean/10 bg-sky/55 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-ink">{classRecord.name}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ocean">{classRecord._count?.students ?? 0} élèves</span>
                  </div>
                  <p className="mt-1 text-sm text-ink/55">{classRecord.teacher ? `${classRecord.teacher.firstName} ${classRecord.teacher.lastName}` : 'Enseignant non assigné'}</p>
                </div>
              ))}
              {!classes.length && !isLoading ? <EmptyState icon={BookOpen} title="Aucune classe" description="Les classes configurées apparaîtront ici." /> : null}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

export const DirectorOverviewPage = () => <StaffOverviewPage mode="director" />;
export const SecretaryOverviewPage = () => <StaffOverviewPage mode="secretary" />;

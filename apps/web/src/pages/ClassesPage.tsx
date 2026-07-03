import type { ClassDto, TeacherDto } from '@evoyamwana/shared';
import { BookOpen, GraduationCap, Plus, School, Search, UserRoundCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ClassFormModal } from '../components/ClassFormModal';
import { EmptyState } from '../components/EmptyState';
import { LoadingRows } from '../components/LoadingRows';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { classesService, type ClassFormPayload, type ClassListResponse } from '../services/classes.service';
import { teachersService } from '../services/teachers.service';

export const ClassesPage = () => {
  const [search, setSearch] = useState('');
  const [academicYear, setAcademicYear] = useState('2026');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ClassListResponse | null>(null);
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useMemo(() => ({ search, academicYear, page, pageSize: 10 }), [search, academicYear, page]);

  const loadClasses = async () => {
    setIsLoading(true);
    setError('');
    try {
      setResult(await classesService.list(params));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les classes');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadClasses();
  }, [params]);

  useEffect(() => {
    teachersService
      .list({ page: 1, pageSize: 100 })
      .then((data) => setTeachers(data.teachers))
      .catch(() => setTeachers([]));
  }, []);

  const handleSubmit = async (payload: ClassFormPayload) => {
    setIsSubmitting(true);
    try {
      await classesService.create(payload);
      setIsCreateOpen(false);
      await loadClasses();
    } finally {
      setIsSubmitting(false);
    }
  };

  const classes = result?.classes ?? [];
  const pagination = result?.pagination;
  const studentCount = classes.reduce((total, classRecord) => total + (classRecord._count?.students ?? classRecord.students?.length ?? 0), 0);
  const subjectCount = classes.reduce((total, classRecord) => total + (classRecord._count?.subjects ?? classRecord.subjects?.length ?? 0), 0);
  const assignedTeachers = classes.filter((classRecord) => classRecord.teacher).length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Structure académique</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink">Classes</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
              Créez des classes, affectez les enseignants titulaires et consultez les listes d'élèves.
            </p>
          </div>
          <Button className="gap-2 bg-ocean hover:bg-ink" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} />
            Créer une classe
          </Button>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <School className="text-ocean" size={22} />
            <p className="mt-4 text-sm font-semibold text-ink/55">Classes</p>
            <p className="mt-1 text-3xl font-bold text-ink">{pagination?.total ?? classes.length}</p>
          </article>
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <GraduationCap className="text-ember" size={22} />
            <p className="mt-4 text-sm font-semibold text-ink/55">Élèves visibles</p>
            <p className="mt-1 text-3xl font-bold text-ink">{studentCount}</p>
          </article>
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <UserRoundCheck className="text-ocean" size={22} />
            <p className="mt-4 text-sm font-semibold text-ink/55">Enseignants affectés</p>
            <p className="mt-1 text-3xl font-bold text-ink">{assignedTeachers}</p>
          </article>
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <BookOpen className="text-ember" size={22} />
            <p className="mt-4 text-sm font-semibold text-ink/55">Matières</p>
            <p className="mt-1 text-3xl font-bold text-ink">{subjectCount}</p>
          </article>
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
            <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
              <Search size={18} className="text-ocean/55" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
                placeholder="Rechercher une classe, un niveau, une section ou un enseignant"
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
              />
            </label>
            <input
              className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean"
              value={academicYear}
              onChange={(event) => {
                setPage(1);
                setAcademicYear(event.target.value);
              }}
            />
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5">
          {isLoading ? (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <LoadingRows rows={7} />
            </article>
          ) : classes.length ? (
            <ResponsiveTable<ClassDto>
              data={classes}
              getRowKey={(classRecord) => classRecord.id}
              columns={[
                {
                  key: 'class',
                  header: 'Classe',
                  render: (classRecord) => (
                    <Link to={`/classes/${classRecord.id}`} className="flex items-center gap-3 rounded-md transition hover:text-ocean">
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-ocean text-sm font-black text-white">
                        {classRecord.section || classRecord.name.slice(-1)}
                      </span>
                      <div>
                        <p className="font-bold">{classRecord.name}</p>
                        <p className="text-xs text-ink/50">{classRecord.level} · {classRecord.academicYear}</p>
                      </div>
                    </Link>
                  )
                },
                { key: 'teacher', header: 'Enseignant', render: (classRecord) => classRecord.teacher ? `${classRecord.teacher.firstName} ${classRecord.teacher.lastName}` : 'Non assigné' },
                { key: 'room', header: 'Salle', render: (classRecord) => classRecord.room ?? 'Non renseignée' },
                { key: 'capacity', header: 'Capacité', render: (classRecord) => classRecord.capacity ? `${classRecord._count?.students ?? 0}/${classRecord.capacity}` : 'Non renseignée' },
                { key: 'students', header: 'Élèves', render: (classRecord) => classRecord._count?.students ?? classRecord.students?.length ?? 0 },
                {
                  key: 'subjects',
                  header: 'Matières',
                  render: (classRecord) => classRecord.subjects?.length ? classRecord.subjects.map((subject) => subject.name).join(', ') : 'Aucune matière'
                },
                {
                  key: 'roster',
                  header: 'Liste',
                  render: (classRecord) => classRecord.students?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {classRecord.students.slice(0, 3).map((student) => (
                        <span key={student.id} className="rounded-full bg-sky px-2.5 py-1 text-xs font-bold text-ocean">
                          {student.firstName} {student.lastName}
                        </span>
                      ))}
                      {classRecord.students.length > 3 ? <span className="text-xs font-bold text-ink/45">+{classRecord.students.length - 3}</span> : null}
                    </div>
                  ) : 'Aucun élève'
                },
                {
                  key: 'profile',
                  header: 'Profil',
                  render: (classRecord) => <Link className="font-bold text-ocean hover:text-ember" to={`/classes/${classRecord.id}`}>Ouvrir</Link>
                }
              ]}
            />
          ) : (
            <EmptyState
              icon={School}
              title="Aucune classe trouvée"
              description="Créez des classes pour cette école ou ajustez les filtres pour voir les groupes existants."
            />
          )}
        </section>

        {pagination ? (
          <div className="mt-5 flex flex-col justify-between gap-3 rounded-lg border border-ocean/10 bg-white px-4 py-3 text-sm shadow-panel sm:flex-row sm:items-center">
            <p className="text-ink/60">
              Page <span className="font-bold text-ink">{pagination.page}</span> sur <span className="font-bold text-ink">{pagination.totalPages}</span> · {pagination.total} classes
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
                Précédent
              </Button>
              <Button variant="ghost" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
                Suivant
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {isCreateOpen ? (
        <ClassFormModal
          teachers={teachers}
          isSubmitting={isSubmitting}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
};

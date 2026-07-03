import type { TeacherDto } from '@evoyamwana/shared';
import { BookOpen, GraduationCap, Pencil, Plus, Search, Trash2, UserRoundCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { LoadingRows } from '../components/LoadingRows';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { TeacherFormModal } from '../components/TeacherFormModal';
import { teachersService, type TeacherFormPayload, type TeacherListResponse } from '../services/teachers.service';

export const TeachersPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<TeacherListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useMemo(() => ({ search, page, pageSize: 10 }), [search, page]);

  const loadTeachers = async () => {
    setIsLoading(true);
    setError('');
    try {
      setResult(await teachersService.list(params));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les enseignants');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTeachers();
  }, [params]);

  const handleSubmit = async (payload: TeacherFormPayload) => {
    setIsSubmitting(true);
    try {
      if (editingTeacher) {
        await teachersService.update(editingTeacher.id, payload);
        setEditingTeacher(null);
      } else {
        await teachersService.create(payload);
        setIsCreateOpen(false);
      }
      await loadTeachers();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (teacher: TeacherDto) => {
    if (!window.confirm(`Désactiver ${teacher.firstName} ${teacher.lastName} ?`)) return;
    setIsSubmitting(true);
    try {
      await teachersService.remove(teacher.id);
      await loadTeachers();
    } finally {
      setIsSubmitting(false);
    }
  };

  const teachers = result?.teachers ?? [];
  const pagination = result?.pagination;
  const totalClasses = teachers.reduce((total, teacher) => total + (teacher.classes?.length ?? 0), 0);
  const totalSubjects = teachers.reduce((total, teacher) => total + (teacher.subjects?.length ?? 0), 0);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Personnel enseignant</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink">Enseignants</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
              Gérez les enseignants, les matricules, l'affectation aux classes et les matières enseignées.
            </p>
          </div>
          <Button className="gap-2 bg-ocean hover:bg-ink" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} />
            Ajouter un enseignant
          </Button>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <UserRoundCheck className="text-ocean" size={22} />
            <p className="mt-4 text-sm font-semibold text-ink/55">Enseignants dans cette école</p>
            <p className="mt-1 text-3xl font-bold text-ink">{pagination?.total ?? teachers.length}</p>
          </article>
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <GraduationCap className="text-ember" size={22} />
            <p className="mt-4 text-sm font-semibold text-ink/55">Classes affectées</p>
            <p className="mt-1 text-3xl font-bold text-ink">{totalClasses}</p>
          </article>
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <BookOpen className="text-ocean" size={22} />
            <p className="mt-4 text-sm font-semibold text-ink/55">Matières enseignées</p>
            <p className="mt-1 text-3xl font-bold text-ink">{totalSubjects}</p>
          </article>
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
            <Search size={18} className="text-ocean/55" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
              placeholder="Rechercher par nom, email ou matricule"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
          </label>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5">
          {isLoading ? (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <LoadingRows rows={7} />
            </article>
          ) : teachers.length ? (
            <ResponsiveTable<TeacherDto>
              data={teachers}
              getRowKey={(teacher) => teacher.id}
              columns={[
                {
                  key: 'teacher',
                  header: 'Enseignant',
                  render: (teacher) => (
                    <Link to={`/teachers/${teacher.id}`} className="flex items-center gap-3 rounded-md transition hover:text-ocean">
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-ocean text-sm font-black text-white">
                        {teacher.firstName[0]}{teacher.lastName[0]}
                      </span>
                      <div>
                        <p className="font-bold">{teacher.firstName} {teacher.lastName}</p>
                        <p className="text-xs text-ink/50">{teacher.user?.email}</p>
                      </div>
                    </Link>
                  )
                },
                { key: 'employeeNumber', header: 'Matricule', render: (teacher) => teacher.employeeNumber },
                { key: 'phone', header: 'Téléphone', render: (teacher) => teacher.phone ?? 'Non renseigné' },
                { key: 'classes', header: 'Classes', render: (teacher) => teacher.classes?.map((item) => item.name).join(', ') || 'Non assignée' },
                { key: 'subjects', header: 'Matières', render: (teacher) => teacher.subjects?.map((item) => item.name).join(', ') || 'Aucune matière' },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (teacher) => (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="inline-flex items-center gap-1 font-bold text-ocean hover:text-ember" onClick={() => setEditingTeacher(teacher)}>
                        <Pencil size={14} />
                        Modifier
                      </button>
                      <button type="button" className="inline-flex items-center gap-1 font-bold text-clay hover:text-ink" onClick={() => void handleDeactivate(teacher)}>
                        <Trash2 size={14} />
                        Désactiver
                      </button>
                    </div>
                  )
                }
              ]}
            />
          ) : (
            <EmptyState
              icon={UserRoundCheck}
              title="Aucun enseignant trouvé"
              description="Ajoutez des enseignants pour cette école ou ajustez la recherche pour voir le personnel existant."
            />
          )}
        </section>

        {pagination ? (
          <div className="mt-5 flex flex-col justify-between gap-3 rounded-lg border border-ocean/10 bg-white px-4 py-3 text-sm shadow-panel sm:flex-row sm:items-center">
            <p className="text-ink/60">
              Page <span className="font-bold text-ink">{pagination.page}</span> sur <span className="font-bold text-ink">{pagination.totalPages}</span> · {pagination.total} enseignants
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
        <TeacherFormModal
          isSubmitting={isSubmitting}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {editingTeacher ? (
        <TeacherFormModal
          mode="edit"
          teacher={editingTeacher}
          isSubmitting={isSubmitting}
          onClose={() => setEditingTeacher(null)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
};

import type { StudentDto } from '@evoyamwana/shared';
import { Edit3, Eye, Filter, GraduationCap, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { LoadingRows } from '../components/LoadingRows';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { StudentFormModal } from '../components/StudentFormModal';
import { studentsService, type StudentFormPayload, type StudentListResponse } from '../services/students.service';

const statusOptions = [
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
  { label: 'Tous', value: 'all' }
] as const;

const genderOptions = [
  { value: '', label: 'Tous les genres' },
  { value: 'Female', label: 'Féminin' },
  { value: 'Male', label: 'Masculin' }
];

export const StudentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'all'>('active');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<StudentListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formStudent, setFormStudent] = useState<StudentDto | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useMemo(() => ({ search, gender, status, page, pageSize: 8 }), [search, gender, status, page]);

  const loadStudents = async () => {
    setIsLoading(true);
    setError('');
    try {
      setResult(await studentsService.list(params));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les élèves');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, [params]);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreateOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (payload: StudentFormPayload) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (formStudent) {
        await studentsService.update(formStudent.id, payload);
        setSuccess('Inscription mise à jour.');
      } else {
        await studentsService.create(payload);
        setSuccess('Inscription enregistrée.');
      }
      setFormStudent(null);
      setIsCreateOpen(false);
      await loadStudents();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (student: StudentDto) => {
    setError('');
    try {
      await studentsService.deactivate(student.id);
      await loadStudents();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Impossible de désactiver l’élève');
    }
  };

  const students = result?.students ?? [];
  const pagination = result?.pagination;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Dossiers élèves</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink">Élèves</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
              Gérez les inscriptions, l’affectation aux classes, les responsables et les profils des élèves de votre école.
            </p>
          </div>
          <Button className="gap-2 bg-ocean hover:bg-ink" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} />
            Inscrire un élève
          </Button>
        </div>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
            <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
              <Search size={18} className="text-ocean/55" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
                placeholder="Rechercher par nom ou code élève"
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
              />
            </label>
            <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-white px-3">
              <Filter size={17} className="text-ocean/55" />
              <select
                className="w-full bg-transparent text-sm font-semibold outline-none"
                value={gender}
                onChange={(event) => {
                  setPage(1);
                  setGender(event.target.value);
                }}
              >
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <select
              className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none"
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as 'active' | 'inactive' | 'all');
              }}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}
        {success ? <p className="mt-4 rounded-md bg-canopy/10 px-3 py-2 text-sm font-semibold text-canopy">{success}</p> : null}

        <section className="mt-5">
          {isLoading ? (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <LoadingRows rows={7} />
            </article>
          ) : students.length ? (
            <ResponsiveTable
              data={students}
              getRowKey={(student) => student.id}
              columns={[
                {
                  key: 'student',
                  header: 'Élève',
                  render: (student) => (
                    <div className="flex items-center gap-3">
                      <img
                        className="h-10 w-10 rounded-md object-cover"
                        src={student.photoUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${student.firstName}%20${student.lastName}`}
                        alt=""
                      />
                      <div>
                        <p className="font-bold">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-ink/50">{student.studentCode}</p>
                      </div>
                    </div>
                  )
                },
                { key: 'gender', header: 'Genre', render: (student) => student.gender ?? 'Non renseigné' },
                { key: 'class', header: 'Classe', render: (student) => student.class?.name ?? 'Non assignée' },
                {
                  key: 'parents',
                  header: 'Parents',
                  render: (student) => student.parents?.map((item) => `${item.parent.firstName} ${item.parent.lastName}`).join(', ') || 'Aucun'
                },
                {
                  key: 'status',
                  header: 'Statut',
                  render: (student) => (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${student.isActive ? 'bg-canopy/10 text-canopy' : 'bg-clay/10 text-clay'}`}>
                      {student.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  )
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (student) => (
                    <div className="flex justify-end gap-1">
                      <Link className="grid h-9 w-9 place-items-center rounded-md text-ocean hover:bg-sky" to={`/students/${student.id}`} aria-label="Voir l’élève">
                        <Eye size={17} />
                      </Link>
                      <button className="grid h-9 w-9 place-items-center rounded-md text-ember hover:bg-orange-50" onClick={() => setFormStudent(student)} aria-label="Modifier l’élève">
                        <Edit3 size={17} />
                      </button>
                      <button className="grid h-9 w-9 place-items-center rounded-md text-clay hover:bg-clay/10" onClick={() => void handleDeactivate(student)} aria-label="Désactiver l’élève">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  )
                }
              ]}
            />
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="Aucun élève trouvé"
              description="Créez une fiche élève ou ajustez les filtres actuels pour voir des résultats."
            />
          )}
        </section>

        {pagination ? (
          <div className="mt-5 flex flex-col justify-between gap-3 rounded-lg border border-ocean/10 bg-white px-4 py-3 text-sm shadow-panel sm:flex-row sm:items-center">
            <p className="text-ink/60">
              Page <span className="font-bold text-ink">{pagination.page}</span> sur <span className="font-bold text-ink">{pagination.totalPages}</span> · {pagination.total} élèves
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

      {isCreateOpen || formStudent ? (
        <StudentFormModal
          mode={formStudent ? 'edit' : 'create'}
          student={formStudent ?? undefined}
          isSubmitting={isSubmitting}
          onClose={() => {
            setIsCreateOpen(false);
            setFormStudent(null);
          }}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
};

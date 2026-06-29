import type { ClassDto, GradeDto, StudentGradeSummaryDto } from '@evoyamwana/shared';
import { Award, BookOpen, ClipboardList, Pencil, Plus, Search, Trash2, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { GradeFormModal } from '../../components/GradeFormModal';
import { IconActionButton } from '../../components/IconActionButton';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { classesService } from '../../services/classes.service';
import { gradesService, type GradeFormPayload, type StudentGradeSummaryResponse } from '../../services/grades.service';
import { buildGradeMatrixRows, formatGradePoints, termColumns, type GradeMatrixRow } from '../../utils/gradeMatrix';

export const TeacherGradesPage = () => {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('Trimestre 2');
  const [result, setResult] = useState<StudentGradeSummaryResponse | null>(null);
  const [grades, setGrades] = useState<GradeDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const params = useMemo(() => ({ search, term, page: 1, pageSize: 100 }), [search, term]);

  const loadGrades = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [summaryResult, gradeResult] = await Promise.all([
        gradesService.summaries(params),
        gradesService.list(params)
      ]);
      setResult(summaryResult);
      setGrades(gradeResult.grades);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les notes.');
      setResult(null);
      setGrades([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadGrades();
  }, [params]);

  useEffect(() => {
    classesService.list({ academicYear: '2026', page: 1, pageSize: 100 }).then((data) => setClasses(data.classes)).catch(() => setClasses([]));
  }, []);

  const handleSubmit = async (payload: GradeFormPayload) => {
    setIsSubmitting(true);
    try {
      if (editingGrade) {
        await gradesService.update(editingGrade.id, payload);
      } else {
        await gradesService.create(payload);
      }
      setIsCreateOpen(false);
      setEditingGrade(null);
      await loadGrades();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (grade: GradeDto) => {
    const studentName = grade.student ? `${grade.student.firstName} ${grade.student.lastName}` : 'cet élève';
    if (!window.confirm(`Supprimer la note de ${studentName} ?`)) return;
    setDeletingId(grade.id);
    try {
      await gradesService.remove(grade.id);
      await loadGrades();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Impossible de supprimer cette note.');
    } finally {
      setDeletingId('');
    }
  };

  const summaries = result?.summaries ?? [];
  const average = summaries.length ? Math.round(summaries.reduce((total, summary) => total + summary.weightedAveragePercent, 0) / summaries.length) : 0;
  const studentCount = classes.reduce((total, item) => total + (item.students?.length ?? item._count?.students ?? 0), 0);
  const gradeRows = useMemo(() => buildGradeMatrixRows(grades, 'student-subject'), [grades]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Carnet enseignant</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink">Notes à saisir</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">Saisissez les évaluations de vos classes et suivez les moyennes par élève.</p>
          </div>
          <Button className="gap-2 bg-ocean hover:bg-ink" onClick={() => {
            setEditingGrade(null);
            setIsCreateOpen(true);
          }}>
            <Plus size={18} />
            Ajouter une note
          </Button>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Élèves suivis" value={isLoading ? '...' : String(studentCount)} icon={Award} tone="blue" detail="Dans vos classes" />
          <StatCard label="Moyenne" value={`${average}%`} icon={TrendingUp} tone="green" detail="Notes enregistrées" />
          <StatCard label="Classes" value={String(classes.length)} icon={BookOpen} tone="orange" detail="Groupes assignés" />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
              <Search size={18} className="text-ocean/55" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Rechercher un élève, une classe ou un cours" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean" value={term} onChange={(event) => setTerm(event.target.value)}>
              <option value="Trimestre 1">Trimestre 1</option>
              <option value="Trimestre 2">Trimestre 2</option>
              <option value="Trimestre 3">Trimestre 3</option>
            </select>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5">
          {isLoading ? (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel"><LoadingRows rows={7} /></article>
          ) : summaries.length ? (
            <ResponsiveTable<StudentGradeSummaryDto>
              data={summaries}
              getRowKey={(summary) => summary.studentId}
              columns={[
                { key: 'student', header: 'Élève', render: (summary) => <Link to={`/students/${summary.studentId}`} className="font-bold text-ink transition hover:text-ocean">{summary.student.firstName} {summary.student.lastName}</Link> },
                { key: 'class', header: 'Classe', render: (summary) => summary.class?.name ?? '-' },
                { key: 'subjects', header: 'Cours', render: (summary) => `${summary.subjectCount} cours` },
                { key: 'assessments', header: 'Notes', render: (summary) => `${summary.gradeCount} notes` },
                { key: 'score', header: 'Moyenne', render: (summary) => <span className="font-bold text-ocean">{summary.weightedAveragePercent}%</span> }
              ]}
            />
          ) : (
            <EmptyState icon={ClipboardList} title="Aucune note à afficher" description="Ajoutez une évaluation pour vos classes assignées." />
          )}
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">CRUD notes</p>
              <h3 className="mt-1 text-xl font-bold text-ink">Dernières notes saisies</h3>
            </div>
            <Button className="gap-2 bg-ocean hover:bg-ink" onClick={() => {
              setEditingGrade(null);
              setIsCreateOpen(true);
            }}>
              <Plus size={18} />
              Nouvelle note
            </Button>
          </div>

          <div className="mt-5">
            {isLoading ? (
              <LoadingRows rows={5} />
            ) : gradeRows.length ? (
              <ResponsiveTable
                data={gradeRows}
                getRowKey={(row) => row.id}
                columns={[
                  { key: 'student', header: 'Élève', render: (row) => <span className="font-bold">{row.studentName}</span> },
                  { key: 'subject', header: 'Cours', render: (row) => row.subjectName },
                  { key: 'class', header: 'Classe', render: (row) => row.className },
                  ...termColumns.map((termItem) => ({
                    key: termItem.key,
                    header: termItem.label,
                    render: (row: GradeMatrixRow) => {
                      const grade = row.terms[termItem.key];
                      return (
                        <div className="flex items-center gap-2">
                          <span className="min-w-14 font-bold text-ocean">{formatGradePoints(grade)}</span>
                          {grade ? (
                            <span className="flex gap-1">
                              <IconActionButton
                                icon={Pencil}
                                label={`Modifier ${termItem.label}`}
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingGrade(grade);
                                  setIsCreateOpen(true);
                                }}
                              />
                              <IconActionButton
                                icon={Trash2}
                                label={deletingId === grade.id ? 'Suppression...' : `Supprimer ${termItem.label}`}
                                tone="red"
                                className="h-8 w-8"
                                onClick={() => void handleDelete(grade)}
                                disabled={deletingId === grade.id}
                              />
                            </span>
                          ) : null}
                        </div>
                      );
                    }
                  }))
                ]}
              />
            ) : (
              <EmptyState icon={ClipboardList} title="Aucune note saisie" description="Créez une note, puis vous pourrez la modifier ou la supprimer ici." />
            )}
          </div>
        </section>
      </div>

      {isCreateOpen ? <GradeFormModal classes={classes} initialGrade={editingGrade} isSubmitting={isSubmitting} onClose={() => {
        setIsCreateOpen(false);
        setEditingGrade(null);
      }} onSubmit={handleSubmit} /> : null}
    </div>
  );
};

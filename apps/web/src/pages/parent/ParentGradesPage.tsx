import type { GradeDto, StudentGradeSummaryDto } from '@evoyamwana/shared';
import { Award, BookOpen, CalendarDays, FileWarning, GraduationCap, Search, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { gradesService } from '../../services/grades.service';
import { buildGradeMatrixRows, formatGradePoints, termColumns, type GradeMatrixRow } from '../../utils/gradeMatrix';

const studentName = (student?: { firstName: string; lastName: string }) => (student ? `${student.firstName} ${student.lastName}`.trim() : 'Élève');

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Impossible de charger les notes des enfants.');

const weightedAverage = (grades: GradeDto[]) => {
  const total = grades.reduce((sum, grade) => sum + Number(grade.score) * Number(grade.coefficient), 0);
  const max = grades.reduce((sum, grade) => sum + Number(grade.maxScore) * Number(grade.coefficient), 0);
  return max ? Math.round((total / max) * 100) : 0;
};

export const ParentGradesPage = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<GradeDto[]>([]);
  const [summaries, setSummaries] = useState<StudentGradeSummaryDto[]>([]);
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadGrades = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [gradeResult, summaryResult] = await Promise.all([
          gradesService.list({ page: 1, pageSize: 100, term }),
          gradesService.summaries({ page: 1, pageSize: 100, term })
        ]);
        if (!mounted) return;
        setGrades(gradeResult.grades);
        setSummaries(summaryResult.summaries);
      } catch (loadError) {
        if (mounted) setError(getErrorMessage(loadError));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadGrades();

    return () => {
      mounted = false;
    };
  }, [term]);

  const terms = useMemo(() => Array.from(new Set(grades.map((grade) => grade.term))).sort(), [grades]);
  const courses = useMemo(() => new Set(grades.map((grade) => grade.subjectId)), [grades]);
  const average = useMemo(() => weightedAverage(grades), [grades]);

  const filteredGrades = grades.filter((grade) => {
    const haystack = `${studentName(grade.student)} ${grade.student?.studentCode ?? ''} ${grade.class?.name ?? ''} ${grade.subject?.name ?? ''} ${grade.term} ${grade.comment ?? ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const gradeRows = useMemo(() => buildGradeMatrixRows(filteredGrades, 'student-subject'), [filteredGrades]);
  const termTrend = useMemo(
    () =>
      ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'].map((label) => {
        const termGrades = grades.filter((grade) => grade.term === label);
        return { label, value: weightedAverage(termGrades) };
      }),
    [grades]
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="premium-card overflow-hidden p-0">
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_320px] md:p-8">
            <div className="flex min-w-0 flex-col justify-center">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-ember">Espace parent</p>
              <h1 className="mt-3 font-display text-4xl font-black text-ink md:text-5xl">Notes de mes enfants</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-ink/62">
                Résultats réels par enfant, cours et trimestre pour le compte de {user?.fullName ?? 'ce parent'}.
              </p>
            </div>
            <div className="rounded-lg border border-ocean/15 bg-sky/70 p-5">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-ocean shadow-sm">
                <Award size={22} />
              </span>
              <p className="mt-4 text-sm font-bold text-ink">Données notes</p>
              <p className="mt-2 text-sm leading-6 text-ink/60">Les résultats viennent de la table des notes, filtrés sur vos enfants uniquement.</p>
            </div>
          </div>
        </section>

        {error ? <p className="rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Moyenne globale" value={isLoading ? '...' : `${average}%`} icon={TrendingUp} tone="green" detail="Avec coefficients" />
          <StatCard label="Enfants évalués" value={isLoading ? '...' : String(summaries.length)} icon={GraduationCap} tone="blue" detail="Avec au moins une note" />
          <StatCard label="Cours évalués" value={isLoading ? '...' : String(courses.size)} icon={BookOpen} tone="orange" detail="Matières avec points" />
          <StatCard label="Notes" value={isLoading ? '...' : String(grades.length)} icon={Award} tone="gold" detail="Évaluations enregistrées" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.68fr_1.32fr]">
          <article className="premium-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Enfants évalués</p>
                <h2 className="mt-1 text-xl font-bold text-ink">{summaries.length} profil(s)</h2>
              </div>
              <GraduationCap className="text-ember" size={22} />
            </div>

            <div className="mt-5 space-y-3">
              {isLoading ? (
                <LoadingRows rows={4} />
              ) : summaries.length ? (
                summaries.map((summary) => (
                  <div key={summary.studentId} className="rounded-lg border border-ocean/10 bg-sky/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-black text-ink">{studentName(summary.student)}</p>
                        <p className="mt-1 text-xs font-semibold text-ink/50">
                          {summary.class?.name ?? 'Classe non assignée'} · {summary.student.studentCode}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-ocean">{summary.weightedAveragePercent}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-ocean" style={{ width: `${summary.weightedAveragePercent}%` }} />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-ink/50">
                      {summary.gradeCount} note(s) · {summary.subjectCount} cours
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState icon={GraduationCap} title="Aucune note liée" description="Les notes apparaîtront dès qu’un enseignant les enregistrera pour vos enfants." />
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Évolution</p>
                <CalendarDays className="text-ember" size={20} />
              </div>
              <div className="mt-4 grid gap-3">
                {termTrend.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-sky">
                      <div className="h-full rounded-full bg-ocean" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="premium-card p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
              <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
                <Search size={18} className="text-ocean/55" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
                  placeholder="Rechercher enfant, cours, classe ou commentaire"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean" value={term} onChange={(event) => setTerm(event.target.value)}>
                <option value="">Tous les trimestres</option>
                {terms.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              {isLoading ? (
                <LoadingRows rows={7} />
              ) : gradeRows.length ? (
                <ResponsiveTable
                  data={gradeRows}
                  getRowKey={(row) => row.id}
                  columns={[
                    { key: 'student', header: 'Enfant', render: (row: GradeMatrixRow) => <span className="font-bold">{row.studentName}</span> },
                    { key: 'subject', header: 'Cours', render: (row: GradeMatrixRow) => row.subjectName },
                    ...termColumns.map((termItem) => ({
                      key: termItem.key,
                      header: termItem.label,
                      render: (row: GradeMatrixRow) => <span className="font-bold text-ocean">{formatGradePoints(row.terms[termItem.key])}</span>
                    })),
                    { key: 'coefficient', header: 'Coefficient', render: (row: GradeMatrixRow) => row.coefficient },
                    {
                      key: 'performance',
                      header: 'Performance',
                      render: (row: GradeMatrixRow) => {
                        const value = weightedAverage(row.grades);
                        return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${value >= 70 ? 'bg-canopy/10 text-canopy' : value >= 50 ? 'bg-orange-50 text-ember' : 'bg-clay/10 text-clay'}`}>{value}%</span>;
                      }
                    }
                  ]}
                />
              ) : (
                <EmptyState icon={FileWarning} title="Aucune note trouvée" description="Les notes enregistrées pour vos enfants apparaîtront ici." />
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

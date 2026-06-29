import type { ClassDto, StudentGradeMetricsDto, StudentGradeSummaryDto, UserRole } from '@evoyamwana/shared';
import { BarChart3, BookOpen, GraduationCap, Layers3, Search, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { classesService } from '../../services/classes.service';
import { gradesService } from '../../services/grades.service';

type StaffRole = Extract<UserRole, 'DIRECTOR' | 'SECRETARY' | 'DISCIPLINE_OFFICER'>;

const emptyMetrics: StudentGradeMetricsDto = {
  evaluatedStudents: 0,
  gradeCount: 0,
  subjectCount: 0,
  classCount: 0,
  averagePercent: null
};

export const StaffGradesReportPage = ({ role }: { role: StaffRole }) => {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [summaries, setSummaries] = useState<StudentGradeSummaryDto[]>([]);
  const [metrics, setMetrics] = useState<StudentGradeMetricsDto>(emptyMetrics);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isClassLoading, setIsClassLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsClassLoading(true);
    classesService
      .list({ page: 1, pageSize: 100 })
      .then((data) => {
        if (isMounted) setClasses(data.classes);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les classes.');
      })
      .finally(() => {
        if (isMounted) setIsClassLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');
    gradesService
      .summaries({ search, term, classId, page: 1, pageSize: 100 })
      .then((data) => {
        if (!isMounted) return;
        setSummaries(data.summaries);
        setMetrics(data.metrics ?? emptyMetrics);
        setTotal(data.pagination.total);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les rapports de notes.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, term, classId]);

  const copy = {
    eyebrow: role === 'DIRECTOR' ? 'Performance élèves' : role === 'DISCIPLINE_OFFICER' ? 'Rapports discipline' : 'Suivi administratif',
    title: role === 'DIRECTOR' ? 'Performance élèves' : role === 'DISCIPLINE_OFFICER' ? 'Suivi des élèves' : 'Lecture des résultats',
    description:
      role === 'DIRECTOR'
        ? 'Lecture des notes réellement enregistrées: élèves évalués, matières notées, classes concernées et moyennes pondérées par coefficient.'
        : 'Synthèse par élève basée sur les notes déjà enregistrées.'
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">{copy.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">{copy.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">{copy.description}</p>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Élèves évalués" value={isLoading ? '...' : String(metrics.evaluatedStudents)} icon={GraduationCap} tone="blue" detail="Avec au moins une note" />
          <StatCard label="Moyenne pondérée" value={isLoading ? '...' : metrics.averagePercent === null ? 'Non évalué' : `${metrics.averagePercent}%`} icon={TrendingUp} tone="green" detail="Toutes les notes filtrées" />
          <StatCard label="Notes enregistrées" value={isLoading ? '...' : String(metrics.gradeCount)} icon={BookOpen} tone="orange" detail="Lignes de notes réelles" />
          <StatCard label="Classes concernées" value={isLoading ? '...' : String(metrics.classCount)} icon={Layers3} tone="blue" detail={`${metrics.subjectCount} matière(s) notée(s)`} />
        </section>

        <section className="mt-6 grid gap-3 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel xl:grid-cols-[1fr_220px_220px]">
          <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
            <Search size={18} className="text-ocean/55" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Rechercher élève, classe ou code" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none" value={classId} onChange={(event) => setClassId(event.target.value)} disabled={isClassLoading}>
            <option value="">{isClassLoading ? 'Chargement classes...' : 'Toutes les classes'}</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
          <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none" value={term} onChange={(event) => setTerm(event.target.value)}>
            <option value="">Tous les trimestres</option>
            <option value="Trimestre 1">Trimestre 1</option>
            <option value="Trimestre 2">Trimestre 2</option>
            <option value="Trimestre 3">Trimestre 3</option>
          </select>
        </section>

        <section className="mt-5 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Méthode de calcul</p>
              <p className="mt-1 text-sm leading-6 text-ink/60">
                La moyenne pondérée utilise les notes enregistrées, le total possible et les coefficients. Les élèves sans note ne sont pas comptés comme évalués.
              </p>
            </div>
            <span className="w-fit rounded-md bg-sky px-3 py-2 text-sm font-black text-ocean">{total} dossier(s) élève filtré(s)</span>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5">
          {isLoading ? (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <LoadingRows rows={7} />
            </article>
          ) : summaries.length ? (
            <ResponsiveTable
              data={summaries}
              getRowKey={(summary) => summary.studentId}
              columns={[
                {
                  key: 'student',
                  header: 'Élève',
                  render: (summary) => (
                    <div>
                      <p className="font-bold">{summary.student.firstName} {summary.student.lastName}</p>
                      <p className="text-xs text-ink/50">{summary.student.studentCode}</p>
                    </div>
                  )
                },
                { key: 'class', header: 'Classe', render: (summary) => summary.class?.name ?? 'Non assigné' },
                { key: 'subjects', header: 'Cours', render: (summary) => summary.subjectCount },
                { key: 'grades', header: 'Notes', render: (summary) => summary.gradeCount },
                { key: 'average', header: 'Moyenne pondérée', render: (summary) => `${Math.round(summary.weightedAveragePercent)}%` },
                { key: 'action', header: 'Action', render: (summary) => <Link className="font-bold text-ocean hover:text-ember" to={`/students/${summary.studentId}`}>Dossier</Link> }
              ]}
            />
          ) : (
            <EmptyState icon={BarChart3} title="Aucun résultat" description="Les synthèses apparaîtront dès que des notes seront enregistrées." />
          )}
        </section>
      </div>
    </div>
  );
};

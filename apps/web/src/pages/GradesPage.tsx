import type { ClassDto, StudentGradeSummaryDto } from '@evoyamwana/shared';
import { Award, BookOpen, GraduationCap, Plus, Search, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { GradeFormModal } from '../components/GradeFormModal';
import { LoadingRows } from '../components/LoadingRows';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { StatCard } from '../components/StatCard';
import { useLocale } from '../contexts/LocaleContext';
import { classesService } from '../services/classes.service';
import { gradesService, type GradeFormPayload, type StudentGradeSummaryResponse } from '../services/grades.service';

export const GradesPage = () => {
  const { t } = useLocale();
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('Trimestre 2');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<StudentGradeSummaryResponse | null>(null);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useMemo(() => ({ search, term, page, pageSize: 10 }), [search, term, page]);

  const loadGrades = async () => {
    setIsLoading(true);
    setError('');
    try {
      setResult(await gradesService.summaries(params));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('grades.loadError'));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadGrades();
  }, [params]);

  useEffect(() => {
    classesService
      .list({ academicYear: '2026', page: 1, pageSize: 100 })
      .then((data) => setClasses(data.classes))
      .catch(() => setClasses([]));
  }, []);

  const handleSubmit = async (payload: GradeFormPayload) => {
    setIsSubmitting(true);
    try {
      await gradesService.create(payload);
      setIsCreateOpen(false);
      await loadGrades();
    } finally {
      setIsSubmitting(false);
    }
  };

  const summaries = result?.summaries ?? [];
  const pagination = result?.pagination;
  const average = summaries.length ? Math.round(summaries.reduce((total, summary) => total + summary.averagePercent, 0) / summaries.length) : 0;
  const weightedAverage = summaries.length ? Math.round(summaries.reduce((total, summary) => total + summary.weightedAveragePercent, 0) / summaries.length) : 0;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">{t('grades.workspace')}</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink">{t('grades.title')}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
              {t('grades.description')}
            </p>
          </div>
          <Button className="gap-2 bg-ocean hover:bg-ink" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} />
            {t('grades.add')}
          </Button>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label={t('grades.learners')} value={String(pagination?.total ?? summaries.length)} icon={Award} tone="blue" detail={t('grades.learnersDetail')} />
          <StatCard label={t('grades.average')} value={`${average}%`} icon={TrendingUp} tone="green" detail={t('grades.averageDetail')} />
          <StatCard label={t('grades.weightedAverage')} value={`${weightedAverage}%`} icon={BookOpen} tone="orange" detail={t('grades.weightedDetail')} />
          <StatCard label={t('grades.term')} value={term || t('grades.all')} icon={GraduationCap} tone="blue" detail={t('grades.termDetail')} />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
              <Search size={18} className="text-ocean/55" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
                placeholder={t('grades.searchPlaceholder')}
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
              />
            </label>
            <input
              className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean"
              value={term}
              onChange={(event) => {
                setPage(1);
                setTerm(event.target.value);
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
          ) : summaries.length ? (
            <ResponsiveTable<StudentGradeSummaryDto>
              data={summaries}
              getRowKey={(summary) => summary.studentId}
              columns={[
                {
                  key: 'student',
                  header: t('grades.student'),
                  render: (summary) => (
                    <Link to={`/students/${summary.studentId}`} className="font-bold text-ink transition hover:text-ocean">
                      {summary.student.firstName} {summary.student.lastName}
                    </Link>
                  )
                },
                { key: 'class', header: t('grades.class'), render: (summary) => summary.class?.name ?? '-' },
                { key: 'subjects', header: t('grades.courses'), render: (summary) => `${summary.subjectCount} ${t('grades.courses').toLowerCase()}` },
                { key: 'assessments', header: t('grades.notes'), render: (summary) => `${summary.gradeCount} ${t('grades.notes').toLowerCase()}` },
                { key: 'score', header: t('grades.avgPoints'), render: (summary) => <span className="font-bold text-ocean">{summary.totalScore.toFixed(1)}/{summary.totalMaxScore.toFixed(1)}</span> },
                {
                  key: 'performance',
                  header: t('grades.performance'),
                  render: (summary) => (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${summary.weightedAveragePercent >= 70 ? 'bg-canopy/10 text-canopy' : summary.weightedAveragePercent >= 50 ? 'bg-orange-50 text-ember' : 'bg-clay/10 text-clay'}`}>
                      {summary.weightedAveragePercent}%
                    </span>
                  )
                },
                {
                  key: 'profile',
                  header: t('grades.profile'),
                  render: (summary) => <Link className="font-bold text-ocean hover:text-ember" to={`/students/${summary.studentId}`}>{t('grades.viewNotes')}</Link>
                }
              ]}
            />
          ) : (
            <EmptyState icon={Award} title={t('grades.emptyTitle')} description={t('grades.emptyDescription')} />
          )}
        </section>

        {pagination ? (
          <div className="mt-5 flex flex-col justify-between gap-3 rounded-lg border border-ocean/10 bg-white px-4 py-3 text-sm shadow-panel sm:flex-row sm:items-center">
            <p className="text-ink/60">
              {t('grades.page')} <span className="font-bold text-ink">{pagination.page}</span> {t('grades.of')} <span className="font-bold text-ink">{pagination.totalPages}</span> · {pagination.total} {t('grades.learners').toLowerCase()}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>{t('grades.previous')}</Button>
              <Button variant="ghost" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>{t('grades.next')}</Button>
            </div>
          </div>
        ) : null}
      </div>

      {isCreateOpen ? (
        <GradeFormModal classes={classes} isSubmitting={isSubmitting} onClose={() => setIsCreateOpen(false)} onSubmit={handleSubmit} />
      ) : null}
    </div>
  );
};

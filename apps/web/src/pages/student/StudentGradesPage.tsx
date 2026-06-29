import type { GradeDto } from '@evoyamwana/shared';
import { Award, BookOpen, CalendarDays, Search, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { useLocale } from '../../contexts/LocaleContext';
import { gradesService } from '../../services/grades.service';
import { buildGradeMatrixRows, formatGradePoints, termColumns, type GradeMatrixRow } from '../../utils/gradeMatrix';

export const StudentGradesPage = () => {
  const { t } = useLocale();
  const [grades, setGrades] = useState<GradeDto[]>([]);
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');
    gradesService
      .list({ page: 1, pageSize: 100, term })
      .then((data) => {
        if (isMounted) setGrades(data.grades);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : t('student.loadGradesError'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [term]);

  const filteredGrades = grades.filter((grade) => `${grade.subject?.name ?? ''} ${grade.term} ${grade.comment ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const gradeRows = useMemo(() => buildGradeMatrixRows(filteredGrades, 'subject'), [filteredGrades]);

  const average = useMemo(() => {
    const total = grades.reduce((sum, grade) => sum + Number(grade.score) * Number(grade.coefficient), 0);
    const max = grades.reduce((sum, grade) => sum + Number(grade.maxScore) * Number(grade.coefficient), 0);
    return max ? Math.round((total / max) * 100) : 0;
  }, [grades]);

  const courses = new Set(grades.map((grade) => grade.subjectId));
  const terms = Array.from(new Set(grades.map((grade) => grade.term))).sort();
  const termTrend = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'].map((label) => {
    const termGrades = grades.filter((grade) => grade.term === label);
    const total = termGrades.reduce((sum, grade) => sum + Number(grade.score) * Number(grade.coefficient), 0);
    const max = termGrades.reduce((sum, grade) => sum + Number(grade.maxScore) * Number(grade.coefficient), 0);
    return { label, value: max ? Math.round((total / max) * 100) : 0 };
  });

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_340px] xl:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">{t('student.space')}</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">{t('student.myGrades')}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">
                {t('student.myGradesDescription')}
              </p>
            </div>
            <article className="rounded-lg border border-ocean/10 bg-sky p-5">
              <Award className="text-ocean" size={28} />
              <p className="mt-4 text-sm font-bold text-ink">{t('student.currentAverage')}</p>
              <p className="mt-1 font-display text-4xl font-bold text-ocean">{isLoading ? '...' : `${average}%`}</p>
            </article>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label={t('student.average')} value={isLoading ? '...' : `${average}%`} icon={TrendingUp} tone="green" detail={t('student.averageDetail')} />
          <StatCard label={t('student.evaluatedCourses')} value={isLoading ? '...' : String(courses.size)} icon={BookOpen} tone="blue" detail={t('student.subjectsWithPoints')} />
          <StatCard label={t('grades.notes')} value={isLoading ? '...' : String(grades.length)} icon={Award} tone="orange" detail={t('student.recordedAssessments')} />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
              <Search size={18} className="text-ocean/55" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder={t('student.searchCourseComment')} value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean" value={term} onChange={(event) => setTerm(event.target.value)}>
              <option value="">{t('student.allTerms')}</option>
              {terms.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">{t('student.evolution')}</p>
                <h3 className="mt-1 text-xl font-bold">{t('student.averageByTerm')}</h3>
              </div>
              <CalendarDays className="text-ember" size={22} />
            </div>
            <div className="mt-5 grid gap-3">
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
          </article>

          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            {isLoading ? (
              <LoadingRows rows={7} />
            ) : gradeRows.length ? (
              <ResponsiveTable
                data={gradeRows}
                getRowKey={(row) => row.id}
                columns={[
                  { key: 'subject', header: t('student.course'), render: (row) => <span className="font-bold">{row.subjectName}</span> },
                  ...termColumns.map((termItem) => ({ key: termItem.key, header: termItem.label, render: (row: GradeMatrixRow) => <span className="font-bold text-ocean">{formatGradePoints(row.terms[termItem.key])}</span> })),
                  { key: 'coefficient', header: t('student.coefficient'), render: (row) => row.coefficient },
                  {
                    key: 'performance',
                    header: t('grades.performance'),
                    render: (row) => {
                      const totalScore = row.grades.reduce((sum, grade) => sum + Number(grade.score) * Number(grade.coefficient), 0);
                      const totalMax = row.grades.reduce((sum, grade) => sum + Number(grade.maxScore) * Number(grade.coefficient), 0);
                      const value = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
                      return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${value >= 70 ? 'bg-canopy/10 text-canopy' : value >= 50 ? 'bg-orange-50 text-ember' : 'bg-clay/10 text-clay'}`}>{value}%</span>;
                    }
                  }
                ]}
              />
            ) : (
              <EmptyState icon={Award} title={t('student.noGradesFound')} description={t('student.noGradesDetail')} />
            )}
          </article>
        </section>
      </div>
    </div>
  );
};

import type { ClassDto, GradeDto, StudentDto } from '@evoyamwana/shared';
import { ArrowLeft, Calendar, GraduationCap, Mail, Plus, TrendingUp, UserRoundCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { GradeFormModal } from '../components/GradeFormModal';
import { LoadingRows } from '../components/LoadingRows';
import { PremiumLineChart } from '../components/PremiumChart';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { StatCard } from '../components/StatCard';
import { useLocale } from '../contexts/LocaleContext';
import { classesService } from '../services/classes.service';
import { gradesService, type GradeFormPayload } from '../services/grades.service';
import { studentsService } from '../services/students.service';
import { buildGradeMatrixRows, formatGradePoints, termColumns, type GradeMatrixRow } from '../utils/gradeMatrix';

type AssessmentKind = 'Interro' | 'Devoir' | 'Examen';

interface CourseAssessmentRow {
  id: string;
  subjectName: string;
  continuousCount: number;
  continuousAverage20: number;
  continuousPercent: number;
  exams: Record<string, GradeDto | undefined>;
  termAverage20: number;
  termPercent: number;
}

const formatDate = (value: string | null | undefined, fallback: string) => {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat('fr', { dateStyle: 'medium' }).format(new Date(value));
};

export const StudentDetailsPage = () => {
  const { t } = useLocale();
  const { id } = useParams();
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [grades, setGrades] = useState<GradeDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGradeFormOpen, setIsGradeFormOpen] = useState(false);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const loadGrades = async (studentId: string) => {
    const gradesData = await gradesService.list({ studentId, page: 1, pageSize: 100 });
    setGrades(gradesData.grades);
  };

  useEffect(() => {
    const loadStudent = async () => {
      if (!id) {
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const [studentData, gradesData, classListData] = await Promise.all([
          studentsService.get(id),
          gradesService.list({ studentId: id, page: 1, pageSize: 100 }),
          classesService.list({ academicYear: '2026', page: 1, pageSize: 100 }).catch(() => ({ classes: [] }))
        ]);
        const currentClass = studentData.class?.id ? await classesService.get(studentData.class.id).catch(() => null) : null;
        const classOptions = currentClass ? [currentClass, ...classListData.classes.filter((classRecord) => classRecord.id !== currentClass.id)] : classListData.classes;
        setStudent(studentData);
        setGrades(gradesData.grades);
        setClasses(classOptions);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t('student.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadStudent();
  }, [id]);

  const handleGradeSubmit = async (payload: GradeFormPayload) => {
    if (!id) return;
    setIsSubmittingGrade(true);
    try {
      await gradesService.create(payload);
      setIsGradeFormOpen(false);
      await loadGrades(id);
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const gradeAverage = useMemo(() => {
    const totalScore = grades.reduce((total, grade) => total + Number(grade.score) * Number(grade.coefficient), 0);
    const totalMax = grades.reduce((total, grade) => total + Number(grade.maxScore) * Number(grade.coefficient), 0);
    return totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
  }, [grades]);

  const termTrend = useMemo(() => {
    const terms = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
    return terms.map((term) => {
      const termGrades = grades.filter((grade) => grade.term === term);
      const score = termGrades.reduce((total, grade) => total + Number(grade.score) * Number(grade.coefficient), 0);
      const max = termGrades.reduce((total, grade) => total + Number(grade.maxScore) * Number(grade.coefficient), 0);
      return { term, value: max ? Math.round((score / max) * 100) : 0 };
    });
  }, [grades]);

  const gradeRows = useMemo(() => buildGradeMatrixRows(grades, 'subject'), [grades]);
  const courseAssessmentRows = useMemo(() => buildCourseAssessmentRows(grades), [grades]);

  return (
    <div className="px-3 py-5 sm:px-4 lg:px-5">
      <div className="mx-auto max-w-none">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-ocean hover:text-ember" to="/students">
          <ArrowLeft size={17} />
          {t('student.back')}
        </Link>

        {isLoading ? (
          <article className="mt-6 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <LoadingRows rows={6} />
          </article>
        ) : error || !student ? (
          <div className="mt-6">
            <EmptyState icon={GraduationCap} title={t('student.unavailable')} description={error || t('student.notFound')} />
          </div>
        ) : (
          <div className="mt-5 grid gap-5">
            <article className="self-start rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <img
                    className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
                    src={student.photoUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${student.firstName}%20${student.lastName}`}
                    alt=""
                  />
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl font-black leading-tight text-ink">{student.firstName} {student.lastName}</h2>
                    <p className="mt-1 text-sm font-black text-ocean">{student.studentCode}</p>
                    <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${student.isActive ? 'bg-canopy/10 text-canopy' : 'bg-clay/10 text-clay'}`}>
                      {student.isActive ? t('student.active') : t('student.inactive')}
                    </span>
                  </div>
                </div>
                <Button type="button" className="gap-2 self-start sm:self-center" onClick={() => setIsGradeFormOpen(true)}>
                  <Plus size={18} />
                  Ajouter une note
                </Button>
              </div>
            </article>

            <section className="grid gap-5">
              <section className="grid gap-4 md:grid-cols-3">
                <StatCard label={t('student.average')} value={`${gradeAverage}%`} icon={TrendingUp} tone="green" detail={t('student.averageDetail')} />
                <StatCard label={t('student.coursesEvaluated')} value={String(new Set(grades.map((grade) => grade.subjectId)).size)} icon={GraduationCap} tone="blue" detail={t('student.coursesDetail')} />
                <StatCard label={t('grades.notes')} value={String(grades.length)} icon={Calendar} tone="orange" detail={t('student.notesDetail')} />
              </section>

              <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
                <h3 className="text-xl font-bold">{t('student.details')}</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Detail icon={UserRoundCheck} label={t('student.gender')} value={student.gender ?? t('student.notSet')} />
                  <Detail icon={Calendar} label={t('student.birthDate')} value={formatDate(student.birthDate, t('student.notSet'))} />
                  <Detail icon={GraduationCap} label={t('student.class')} value={student.class?.name ?? t('student.unassigned')} />
                  <Detail icon={Mail} label={t('student.schoolId')} value={student.schoolId} />
                </div>
              </article>

              <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
                <h3 className="text-xl font-bold">{t('student.parents')}</h3>
                <div className="mt-5 grid gap-3">
                  {student.parents?.length ? (
                    student.parents.map((item) => (
                      <div key={item.parent.id} className="rounded-lg border border-ocean/10 bg-sky p-4">
                        <p className="font-bold">{item.parent.firstName} {item.parent.lastName}</p>
                        <p className="mt-1 text-sm text-ink/55">{item.parent.phone ?? t('student.noPhone')}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState icon={UserRoundCheck} title={t('student.noGuardian')} description={t('student.noGuardianDetail')} />
                  )}
                </div>
              </article>

              <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">{t('student.annualEvolution')}</p>
                    <h3 className="mt-1 text-xl font-bold">{t('student.termAverage')}</h3>
                  </div>
                  <span className="rounded-full bg-sky px-3 py-1 text-xs font-bold text-ocean">{gradeAverage}% {t('student.annual')}</span>
                </div>
                <div className="mt-5">
                  <PremiumLineChart labels={termTrend.map((item) => item.term.replace('Trimestre ', 'T'))} values={termTrend.map((item) => item.value)} label={t('student.termAverage')} />
                </div>
              </article>

              <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">{t('student.pointsByCourse')}</p>
                    <h3 className="mt-1 text-xl font-bold">{t('student.allGrades')}</h3>
                  </div>
                  <Button type="button" className="h-10 gap-2 px-4" onClick={() => setIsGradeFormOpen(true)}>
                    <Plus size={16} />
                    Interro / examen
                  </Button>
                </div>
                <div className="mb-5 rounded-lg border border-ocean/10 bg-sky p-4">
                  <p className="text-sm font-black text-ink">Structure du trimestre</p>
                  <p className="mt-1 text-sm leading-6 text-ink/60">
                    Par cours: plusieurs interros/devoirs donnent une moyenne journalière, puis les examens sont saisis par période. Chaque résultat est ramené sur 20 et en pourcentage.
                  </p>
                </div>
                <ResponsiveTable
                  data={courseAssessmentRows}
                  getRowKey={(row) => row.id}
                  emptyState={<EmptyState icon={GraduationCap} title="Aucun cours calculable" description="Ajoutez une interro, un devoir ou un examen pour voir les moyennes par cours." />}
                  columns={[
                    { key: 'course', header: 'Cours', render: (row) => <span className="font-black text-ink">{row.subjectName}</span> },
                    {
                      key: 'daily',
                      header: 'Interros / devoirs',
                      render: (row) => row.continuousCount ? (
                        <div>
                          <p className="font-black text-ocean">{formatOutOf20(row.continuousAverage20)}</p>
                          <p className="text-xs text-ink/50">{row.continuousCount} notes · {row.continuousPercent}%</p>
                        </div>
                      ) : <span className="text-ink/40">À saisir</span>
                    },
                    { key: 'exam1', header: 'Examen P1', render: (row) => renderExamCell(row.exams['Période 1']) },
                    { key: 'exam2', header: 'Examen P2', render: (row) => renderExamCell(row.exams['Période 2']) },
                    { key: 'exam3', header: 'Examen P3', render: (row) => renderExamCell(row.exams['Période 3']) },
                    {
                      key: 'final',
                      header: 'Moyenne cours',
                      render: (row) => row.termAverage20 ? (
                        <div>
                          <p className="font-black text-ink">{formatOutOf20(row.termAverage20)}</p>
                          <p className="text-xs font-black text-ocean">{row.termPercent}%</p>
                        </div>
                      ) : <span className="text-ink/40">À saisir</span>
                    }
                  ]}
                />
              </article>

              <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
                <div className="mb-4">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Détail des points</p>
                  <h3 className="mt-1 text-xl font-bold">{t('student.allGrades')}</h3>
                </div>
                <ResponsiveTable
                  data={gradeRows}
                  getRowKey={(row) => row.id}
                  emptyState={<EmptyState icon={GraduationCap} title={t('student.emptyGrades')} description={t('student.emptyGradesDetail')} />}
                  columns={[
                    { key: 'subject', header: t('student.course'), render: (row) => row.subjectName },
                    ...termColumns.map((term) => ({ key: term.key, header: term.label, render: (row: GradeMatrixRow) => <span className="font-bold text-ocean">{formatGradePoints(row.terms[term.key])}</span> })),
                    { key: 'coefficient', header: t('gradeForm.coefficient'), render: (row) => row.coefficient },
                    {
                      key: 'performance',
                      header: t('grades.performance'),
                      render: (row) => {
                        const totalScore = row.grades.reduce((sum, grade) => sum + Number(grade.score) * Number(grade.coefficient), 0);
                        const totalMax = row.grades.reduce((sum, grade) => sum + Number(grade.maxScore) * Number(grade.coefficient), 0);
                        const value = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
                        return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${value >= 70 ? 'bg-canopy/10 text-canopy' : value >= 50 ? 'bg-orange-50 text-ember' : 'bg-clay/10 text-clay'}`}>{value}%</span>;
                      }
                    },
                    { key: 'comment', header: t('gradeForm.comment'), render: (row) => row.comments.join(', ') || '-' }
                  ]}
                />
              </article>
            </section>
          </div>
        )}
      </div>
      {isGradeFormOpen && student ? (
        <GradeFormModal
          classes={classes}
          defaultClassId={student.class?.id}
          defaultClassLabel={student.class?.name}
          defaultStudentId={student.id}
          defaultStudentLabel={`${student.firstName} ${student.lastName} · ${student.studentCode}`}
          isSubmitting={isSubmittingGrade}
          onClose={() => setIsGradeFormOpen(false)}
          onSubmit={handleGradeSubmit}
        />
      ) : null}
    </div>
  );
};

const parseAssessment = (grade: GradeDto): { kind: AssessmentKind; period?: string } => {
  const comment = grade.comment ?? '';
  if (comment.startsWith('Examen Période 3')) return { kind: 'Examen', period: 'Période 3' };
  if (comment.startsWith('Examen Période 2')) return { kind: 'Examen', period: 'Période 2' };
  if (comment.startsWith('Examen Période 1') || comment.startsWith('Examen')) return { kind: 'Examen', period: 'Période 1' };
  if (comment.startsWith('Devoir')) return { kind: 'Devoir' };
  return { kind: 'Interro' };
};

const gradeToPercent = (grade: GradeDto) => {
  const score = Number(grade.score);
  const maxScore = Number(grade.maxScore);
  return maxScore > 0 ? (score / maxScore) * 100 : 0;
};

const gradeToOutOf20 = (grade: GradeDto) => (gradeToPercent(grade) / 100) * 20;

const averageNumber = (values: number[]) => {
  const validValues = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!validValues.length) return 0;
  return validValues.reduce((total, value) => total + value, 0) / validValues.length;
};

const buildCourseAssessmentRows = (grades: GradeDto[]): CourseAssessmentRow[] => {
  const bySubject = new Map<string, GradeDto[]>();
  grades.forEach((grade) => {
    const key = grade.subjectId;
    bySubject.set(key, [...(bySubject.get(key) ?? []), grade]);
  });

  return Array.from(bySubject.entries()).map(([subjectId, subjectGrades]) => {
    const continuousGrades = subjectGrades.filter((grade) => parseAssessment(grade).kind !== 'Examen');
    const examGrades = subjectGrades.filter((grade) => parseAssessment(grade).kind === 'Examen');
    const exams: Record<string, GradeDto | undefined> = {};
    examGrades.forEach((grade) => {
      const period = parseAssessment(grade).period ?? 'Période 1';
      const current = exams[period];
      exams[period] = !current || new Date(grade.createdAt).getTime() > new Date(current.createdAt).getTime() ? grade : current;
    });

    const continuousAverage20 = averageNumber(continuousGrades.map(gradeToOutOf20));
    const examAverages20 = Object.values(exams).filter(Boolean).map((grade) => gradeToOutOf20(grade as GradeDto));
    const termAverage20 = averageNumber([continuousAverage20, ...examAverages20]);

    return {
      id: subjectId,
      subjectName: subjectGrades[0]?.subject?.name ?? 'Cours',
      continuousCount: continuousGrades.length,
      continuousAverage20: Math.round(continuousAverage20 * 10) / 10,
      continuousPercent: Math.round((continuousAverage20 / 20) * 100),
      exams,
      termAverage20: Math.round(termAverage20 * 10) / 10,
      termPercent: Math.round((termAverage20 / 20) * 100)
    };
  }).sort((a, b) => a.subjectName.localeCompare(b.subjectName));
};

const formatOutOf20 = (value: number) => `${value.toFixed(value % 1 ? 1 : 0)}/20`;

const renderExamCell = (grade: GradeDto | undefined) => {
  if (!grade) return <span className="text-ink/40">À saisir</span>;
  const outOf20 = Math.round(gradeToOutOf20(grade) * 10) / 10;
  return (
    <div>
      <p className="font-black text-ocean">{formatOutOf20(outOf20)}</p>
      <p className="text-xs text-ink/50">{Math.round(gradeToPercent(grade))}%</p>
    </div>
  );
};

const Detail = ({ icon: Icon, label, value }: { icon: typeof GraduationCap; label: string; value: string }) => {
  return (
    <div className="rounded-lg border border-ocean/10 bg-white p-4">
      <Icon className="text-ember" size={20} />
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-ink/45">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-ink">{value}</p>
    </div>
  );
};

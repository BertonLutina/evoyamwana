import type { ClassDto, GradeDto, StudentGradeMetricsDto, TeacherDto } from '@evoyamwana/shared';
import { AlertTriangle, Archive, ArrowRight, BookOpenCheck, CheckCircle2, ClipboardList, GraduationCap, Pencil, PlayCircle, Plus, RefreshCw, Search, Sparkles, Target, TrendingUp, UsersRound, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { PremiumGroupedBarChart } from '../../components/PremiumChart';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { classesService } from '../../services/classes.service';
import { gradesService, type GradeListParams } from '../../services/grades.service';
import { schoolHealthService, type SchoolHealthPayload, type SchoolHealthRecordDto, type SchoolHealthSeverity, type SchoolHealthStatus } from '../../services/schoolHealth.service';
import { teachersService } from '../../services/teachers.service';

interface SubjectQualityRow {
  id: string;
  subject: string;
  subjectCode?: string | null;
  gradeCount: number;
  classCount: number;
  classNames: string[];
  teacherNames: string[];
  average: number;
  weakGradeCount: number;
  risk: 'Faible' | 'Moyen' | 'Élevé';
}

const statuses: Array<{ value: SchoolHealthStatus; label: string }> = [
  { value: 'OPEN', label: 'À lancer' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'RESOLVED', label: 'Clôturé' },
  { value: 'ARCHIVED', label: 'Archivé' }
];

const severities: Array<{ value: SchoolHealthSeverity; label: string }> = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGH', label: 'Élevé' },
  { value: 'CRITICAL', label: 'Critique' }
];

const initialForm: SchoolHealthPayload = {
  title: '',
  description: '',
  category: 'PEDAGOGY',
  status: 'OPEN',
  severity: 'MEDIUM',
  owner: 'Direction pédagogique',
  dueDate: ''
};

const emptyMetrics: StudentGradeMetricsDto = {
  evaluatedStudents: 0,
  gradeCount: 0,
  subjectCount: 0,
  classCount: 0,
  averagePercent: null
};

const loadAllGrades = async (params: GradeListParams) => {
  const firstPage = await gradesService.list({ ...params, page: 1, pageSize: 100 });
  if (firstPage.pagination.totalPages <= 1) return firstPage.grades;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.pagination.totalPages - 1 }, (_, index) => gradesService.list({ ...params, page: index + 2, pageSize: 100 }))
  );

  return [...firstPage.grades, ...remainingPages.flatMap((page) => page.grades)];
};

export const DirectorPedagogyQualityPage = () => {
  const [metrics, setMetrics] = useState<StudentGradeMetricsDto>(emptyMetrics);
  const [grades, setGrades] = useState<GradeDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [plans, setPlans] = useState<SchoolHealthRecordDto[]>([]);
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SchoolHealthRecordDto | null>(null);
  const [form, setForm] = useState<SchoolHealthPayload>(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const gradeParams = { search, classId, term };
      const [summaryResponse, gradeRows, classResponse, teacherResponse, planResponse] = await Promise.all([
        gradesService.summaries({ search, classId, term, page: 1, pageSize: 100 }),
        loadAllGrades(gradeParams),
        classesService.list({ page: 1, pageSize: 100 }),
        teachersService.list({ page: 1, pageSize: 100 }),
        schoolHealthService.list({
          search,
          category: 'PEDAGOGY',
          status: status as SchoolHealthStatus | undefined,
          page: 1,
          pageSize: 100
        })
      ]);
      setMetrics(summaryResponse.metrics ?? emptyMetrics);
      setGrades(gradeRows);
      setClasses(classResponse.classes);
      setTeachers(teacherResponse.teachers);
      setPlans(planResponse.records);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger la qualité pédagogique.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [search, classId, term, status]);

  const qualityRows = useMemo(() => buildSubjectQualityRows(grades), [grades]);
  const overallAverage = metrics.averagePercent;
  const weakLearners = useMemo(() => countWeakLearners(grades), [grades]);
  const supportedTeachers = useMemo(() => teachers.filter((teacher) => (teacher.subjects?.length ?? 0) > 0 || (teacher.classes?.length ?? 0) > 0).length, [teachers]);
  const activePlans = useMemo(() => plans.filter((plan) => plan.status === 'OPEN' || plan.status === 'IN_PROGRESS').length, [plans]);
  const chartRows = qualityRows.slice(0, 8);

  const openForm = (plan?: SchoolHealthRecordDto) => {
    setEditingPlan(plan ?? null);
    setForm(plan ? {
      title: plan.title,
      description: plan.description,
      category: 'PEDAGOGY',
      status: plan.status,
      severity: plan.severity,
      owner: plan.owner ?? 'Direction pédagogique',
      dueDate: plan.dueDate ? plan.dueDate.slice(0, 10) : ''
    } : initialForm);
    setIsFormOpen(true);
  };

  const openPlanForSubject = (row: SubjectQualityRow) => {
    const classText = row.classNames.length ? row.classNames.join(', ') : 'Classes non renseignées';
    const teacherText = row.teacherNames.length ? row.teacherNames.join(', ') : 'enseignant à préciser';
    const periodText = term || 'tous les trimestres';
    setEditingPlan(null);
    setForm({
      title: `Remédiation ${row.subject} - ${classText}`,
      description: [
        `Diagnostic: ${row.subject}${row.subjectCode ? ` (${row.subjectCode})` : ''}, ${classText}, ${periodText}.`,
        `Moyenne: ${row.average}% sur ${row.gradeCount} note(s) analysée(s).`,
        `Évaluations sous 60%: ${row.weakGradeCount}.`,
        `Responsable proposé: ${teacherText}.`,
        'Actions: identifier les élèves en difficulté dans la classe concernée, organiser une correction dirigée, reprendre les notions non acquises, planifier une nouvelle évaluation formative.',
        'Indicateur: remonter la moyenne du cours au-dessus de 70%.'
      ].join(' '),
      category: 'PEDAGOGY',
      status: 'OPEN',
      severity: row.risk === 'Élevé' ? 'HIGH' : row.risk === 'Moyen' ? 'MEDIUM' : 'LOW',
      owner: row.teacherNames[0] ?? 'Direction pédagogique',
      dueDate: ''
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPlan(null);
    setForm(initialForm);
  };

  const save = async () => {
    setIsSaving(true);
    setError('');
    try {
      const payload = { ...form, category: 'PEDAGOGY' as const };
      if (editingPlan) {
        await schoolHealthService.update(editingPlan.id, payload);
      } else {
        await schoolHealthService.create(payload);
      }
      closeForm();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer le plan pédagogique.');
    } finally {
      setIsSaving(false);
    }
  };

  const resolvePlan = async (plan: SchoolHealthRecordDto) => {
    setError('');
    try {
      await schoolHealthService.update(plan.id, { status: 'RESOLVED', category: 'PEDAGOGY' });
      await load();
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : 'Impossible de clôturer le plan.');
    }
  };

  const startPlan = async (plan: SchoolHealthRecordDto) => {
    setError('');
    try {
      await schoolHealthService.update(plan.id, { status: 'IN_PROGRESS', category: 'PEDAGOGY' });
      await load();
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Impossible de mettre le plan en cours.');
    }
  };

  const archivePlan = async (plan: SchoolHealthRecordDto) => {
    setError('');
    try {
      await schoolHealthService.archive(plan.id);
      await load();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Impossible d’archiver le plan.');
    }
  };

  return (
    <div className="px-3 py-5 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        <section className="premium-card overflow-hidden">
          <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1fr_360px] xl:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Suivi des apprentissages</p>
              <h2 className="mt-2 font-display text-4xl font-black text-ink">Matières, difficultés et remédiation</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-ink/60">
                Cette page sert à voir quelles matières sont faibles, quels élèves passent sous 60%, et quelles actions pédagogiques lancer avant le prochain bulletin.
              </p>
            </div>
            <div className="rounded-xl border border-ocean/10 bg-sky p-4 text-ink shadow-card">
              <Sparkles size={24} className="text-ocean" />
              <h3 className="mt-4 text-xl font-black">Décision à prendre</h3>
              <p className="mt-2 text-sm leading-6 text-ink/62">
                Commencez par les matières sous 60%, ouvrez un plan de remédiation, puis contrôlez si les résultats progressent après les reprises.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Moyenne générale" value={isLoading ? '...' : overallAverage === null ? 'Non évalué' : `${overallAverage}%`} icon={TrendingUp} tone="blue" detail="Notes filtrées avec coefficients" />
          <StatCard label="À accompagner" value={isLoading ? '...' : String(weakLearners)} icon={AlertTriangle} tone="orange" detail="Élèves sous 60%" />
          <StatCard label="Matières évaluées" value={isLoading ? '...' : String(metrics.subjectCount)} icon={BookOpenCheck} tone="green" detail={`${metrics.gradeCount} note(s) enregistrée(s)`} />
          <StatCard label="Plans actifs" value={isLoading ? '...' : String(activePlans)} icon={GraduationCap} tone="clay" detail="Actions de remédiation" />
        </section>

        <section className="mt-4 grid gap-3 rounded-xl border border-ocean/10 bg-white p-4 shadow-card xl:grid-cols-[1fr_220px_220px_220px]">
          <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
            <Search size={18} className="text-ocean/55" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Rechercher élève, classe, matière ou plan" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink" value={classId} onChange={(event) => setClassId(event.target.value)}>
            <option value="">Toutes les classes</option>
            {classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.name}</option>)}
          </select>
          <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink" value={term} onChange={(event) => setTerm(event.target.value)}>
            <option value="">Tous les trimestres</option>
            <option value="Trimestre 1">Trimestre 1</option>
            <option value="Trimestre 2">Trimestre 2</option>
            <option value="Trimestre 3">Trimestre 3</option>
          </select>
          <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Tous plans</option>
            {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </section>

        <section className="mt-4 grid gap-3 lg:grid-cols-3">
          <PedagogyStep icon={Search} title="1. Diagnostiquer" detail="Repérer les matières sous 60% et les cours sans notes suffisantes." action="Voir matières" />
          <PedagogyStep icon={ClipboardList} title="2. Créer un plan" detail="Cliquer sur Plan dans une matière faible, ou Nouveau plan pour une action manuelle." action="Créer / modifier" />
          <PedagogyStep icon={Target} title="3. Suivre le plan" detail="Mettre en cours, clôturer quand la remédiation est faite, archiver si le plan n’est plus utile." action="CRUD complet" />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
          <article className="premium-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Diagnostic</p>
                <h3 className="mt-1 text-2xl font-black text-ink">Moyenne par matière</h3>
              </div>
              <span className="rounded-full bg-sky px-3 py-1 text-sm font-black text-ocean">{overallAverage === null ? 'Non évalué' : `${overallAverage}% global`}</span>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <LoadingRows rows={4} />
              ) : chartRows.length ? (
                <PremiumGroupedBarChart
                  labels={chartRows.map((row) => row.subject)}
                  datasets={[
                    { label: 'Moyenne', values: chartRows.map((row) => row.average), color: 'rgba(0, 127, 255, 0.82)' },
                    { label: 'Seuil attendu', values: chartRows.map(() => 70), color: 'rgba(247, 214, 24, 0.82)' }
                  ]}
                />
              ) : (
                <EmptyState icon={BookOpenCheck} title="Aucune note analysable" description="Saisissez des interros, devoirs ou examens pour voir les matières faibles." />
              )}
            </div>
          </article>

          <article className="premium-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Couverture</p>
                <h3 className="mt-1 text-2xl font-black text-ink">Données disponibles</h3>
              </div>
              <UsersRound className="text-ocean" size={26} />
            </div>
            <div className="mt-5 space-y-3">
              <CoverageRow label="Classes concernées" value={metrics.classCount} detail="Avec au moins une note filtrée" />
              <CoverageRow label="Enseignants liés" value={supportedTeachers} detail="Avec matières ou classes" />
              <CoverageRow label="Matières urgentes" value={qualityRows.filter((row) => row.risk === 'Élevé').length} detail="Moyenne sous 60%" danger />
            </div>
          </article>
        </section>

        <section className="mt-4 grid gap-4 2xl:grid-cols-[1fr_1fr]">
          <article className="premium-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Actions par cours</p>
                <h3 className="mt-1 text-2xl font-black text-ink">Matières à remédier</h3>
              </div>
              <span className="rounded-full bg-sky px-3 py-1 text-sm font-black text-ocean">{qualityRows.length} matières</span>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <LoadingRows rows={5} />
              ) : (
                <ResponsiveTable<SubjectQualityRow>
                  data={qualityRows}
                  getRowKey={(row) => row.id}
                  columns={[
                    { key: 'subject', header: 'Cours', render: (row) => <p className="font-black">{row.subject}</p> },
                    { key: 'average', header: 'Moyenne', render: (row) => <span className="font-black text-ocean">{row.average}%</span> },
                    { key: 'classes', header: 'Classes', render: (row) => <div><p className="font-bold">{row.classCount}</p><p className="text-xs text-ink/50">{row.classNames.join(', ') || 'Non renseigné'}</p></div> },
                    { key: 'weak', header: 'Sous 60%', render: (row) => row.weakGradeCount },
                    { key: 'risk', header: 'Priorité', render: (row) => <RiskBadge risk={row.risk} /> },
                    {
                      key: 'action',
                      header: 'Remédier',
                      render: (row) => (
                        <button type="button" onClick={() => openPlanForSubject(row)} className="inline-flex h-9 items-center gap-2 rounded-md bg-ocean px-3 text-xs font-black text-white transition hover:bg-ink">
                          Plan
                          <ArrowRight size={14} />
                        </button>
                      )
                    }
                  ]}
                  emptyState={<EmptyState icon={BookOpenCheck} title="Aucune matière" description="Les matières à remédier apparaîtront après la saisie des notes." />}
                />
              )}
            </div>
          </article>

          <article className="premium-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">CRUD pédagogique</p>
                <h3 className="mt-1 text-2xl font-black text-ink">Créer, modifier et suivre les plans</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="ghost" onClick={() => void load()} className="gap-2">
                  <RefreshCw size={17} />
                  Actualiser
                </Button>
                <Button type="button" onClick={() => openForm()} className="gap-2">
                  <Plus size={18} />
                  Créer un plan
                </Button>
              </div>
            </div>

            {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-bold text-clay">{error}</p> : null}

            <div className="mt-4">
              {isLoading ? (
                <LoadingRows rows={5} />
              ) : (
                <ResponsiveTable<SchoolHealthRecordDto>
                  data={plans}
                  getRowKey={(plan) => plan.id}
                  columns={[
                    { key: 'title', header: 'Plan', render: (plan) => <div><p className="font-black">{plan.title}</p><p className="text-xs leading-5 text-ink/50">{plan.description}</p></div> },
                    { key: 'owner', header: 'Responsable', render: (plan) => plan.owner || 'Direction pédagogique' },
                    { key: 'status', header: 'Statut', render: (plan) => statusLabel(plan.status) },
                    { key: 'severity', header: 'Priorité', render: (plan) => severityLabel(plan.severity) },
                    {
                      key: 'actions',
                      header: 'CRUD',
                      render: (plan) => (
                        <div className="flex flex-wrap gap-2">
                          <PlanActionButton icon={Pencil} label="Modifier" onClick={() => openForm(plan)} />
                          {plan.status === 'OPEN' ? <PlanActionButton icon={PlayCircle} label="En cours" onClick={() => void startPlan(plan)} /> : null}
                          {plan.status !== 'RESOLVED' && plan.status !== 'ARCHIVED' ? <PlanActionButton icon={CheckCircle2} label="Clôturer" tone="green" onClick={() => void resolvePlan(plan)} /> : null}
                          {plan.status !== 'ARCHIVED' ? <PlanActionButton icon={Archive} label="Archiver" tone="red" onClick={() => void archivePlan(plan)} /> : null}
                        </div>
                      )
                    }
                  ]}
                  emptyState={<EmptyState icon={GraduationCap} title="Aucun plan pédagogique" description="Cliquez sur Créer un plan ou sur Plan dans une matière faible pour démarrer le CRUD." />}
                />
              )}
            </div>
          </article>
        </section>
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Plan pédagogique</p>
                <h3 className="text-2xl font-black text-ink">{editingPlan ? 'Modifier le plan' : 'Nouveau plan'}</h3>
              </div>
              <button type="button" onClick={closeForm} className="grid h-10 w-10 place-items-center rounded-lg bg-sky text-ocean">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean" placeholder="Titre du plan" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              <textarea className="min-h-28 rounded-md border border-ocean/10 px-3 py-3 text-sm font-semibold outline-none focus:border-ocean" placeholder="Objectif, diagnostic, actions pédagogiques et indicateurs de réussite" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-ink/45">
                  Priorité
                  <select className="h-11 cursor-pointer rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-ink outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/10" value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value as SchoolHealthSeverity }))}>
                    {severities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-ink/45">
                  Statut
                  <select className="h-11 cursor-pointer rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-ink outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/10" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as SchoolHealthStatus }))}>
                    {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean" placeholder="Responsable" value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
                <input type="date" className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeForm}>Annuler</Button>
              <Button type="button" onClick={() => void save()} disabled={isSaving}>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const buildSubjectQualityRows = (grades: GradeDto[]): SubjectQualityRow[] => {
  const buckets = new Map<string, { subject: string; subjectCode?: string | null; total: number; count: number; weakGradeCount: number; classes: Set<string>; classNames: Set<string>; teacherNames: Set<string> }>();

  grades.forEach((grade) => {
    const subject = grade.subject?.name ?? 'Cours non renseigné';
    const current = buckets.get(grade.subjectId) ?? { subject, subjectCode: grade.subject?.code, total: 0, count: 0, weakGradeCount: 0, classes: new Set<string>(), classNames: new Set<string>(), teacherNames: new Set<string>() };
    const score = Number(grade.score);
    const maxScore = Number(grade.maxScore);
    const percent = maxScore > 0 ? (score / maxScore) * 100 : 0;
    current.total += percent;
    current.count += 1;
    if (percent < 60) current.weakGradeCount += 1;
    current.classes.add(grade.classId);
    if (grade.class?.name) current.classNames.add(grade.class.name);
    if (grade.teacher) current.teacherNames.add(`${grade.teacher.firstName} ${grade.teacher.lastName}`);
    buckets.set(grade.subjectId, current);
  });

  return Array.from(buckets.entries())
    .map(([id, bucket]) => {
      const averagePercent = Math.round(bucket.total / Math.max(1, bucket.count));
      const risk: SubjectQualityRow['risk'] = averagePercent < 60 ? 'Élevé' : averagePercent < 70 ? 'Moyen' : 'Faible';
      return {
        id,
        subject: bucket.subject,
        subjectCode: bucket.subjectCode,
        gradeCount: bucket.count,
        classCount: bucket.classes.size,
        classNames: Array.from(bucket.classNames).sort(),
        teacherNames: Array.from(bucket.teacherNames).sort(),
        average: averagePercent,
        weakGradeCount: bucket.weakGradeCount,
        risk
      };
    })
    .sort((a, b) => a.average - b.average);
};

const countWeakLearners = (grades: GradeDto[]) => {
  const buckets = new Map<string, { score: number; max: number }>();
  grades.forEach((grade) => {
    const current = buckets.get(grade.studentId) ?? { score: 0, max: 0 };
    const coefficient = Number(grade.coefficient);
    current.score += Number(grade.score) * coefficient;
    current.max += Number(grade.maxScore) * coefficient;
    buckets.set(grade.studentId, current);
  });

  return Array.from(buckets.values()).filter((bucket) => bucket.max > 0 && (bucket.score / bucket.max) * 100 < 60).length;
};

const statusLabel = (status: SchoolHealthStatus) => statuses.find((item) => item.value === status)?.label ?? status;
const severityLabel = (severity: SchoolHealthSeverity) => severities.find((item) => item.value === severity)?.label ?? severity;

const RiskBadge = ({ risk }: { risk: SubjectQualityRow['risk'] }) => {
  const classes = risk === 'Élevé' ? 'bg-clay/10 text-clay' : risk === 'Moyen' ? 'bg-ember/10 text-ember' : 'bg-canopy/10 text-canopy';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${classes}`}>{risk}</span>;
};

const PedagogyStep = ({ icon: Icon, title, detail, action }: { icon: typeof Search; title: string; detail: string; action: string }) => (
  <article className="rounded-xl border border-ocean/10 bg-white p-4 shadow-card">
    <div className="flex gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-sky text-ocean">
        <Icon size={20} />
      </span>
      <div>
        <h3 className="font-black text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-ink/58">{detail}</p>
        <span className="mt-3 inline-flex rounded-full bg-ocean/10 px-3 py-1 text-xs font-black text-ocean">{action}</span>
      </div>
    </div>
  </article>
);

const PlanActionButton = ({
  icon: Icon,
  label,
  tone = 'blue',
  onClick
}: {
  icon: typeof Pencil;
  label: string;
  tone?: 'blue' | 'green' | 'red';
  onClick: () => void;
}) => {
  const classes = tone === 'green'
    ? 'border-canopy/15 bg-canopy/10 text-canopy hover:bg-canopy hover:text-white'
    : tone === 'red'
      ? 'border-clay/15 bg-clay/10 text-clay hover:bg-clay hover:text-white'
      : 'border-ocean/15 bg-sky text-ocean hover:bg-ocean hover:text-white';
  return (
    <button type="button" onClick={onClick} className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-black transition ${classes}`}>
      <Icon size={14} />
      {label}
    </button>
  );
};

const CoverageRow = ({ label, value, detail, danger = false }: { label: string; value: number; detail: string; danger?: boolean }) => (
  <div className="rounded-lg border border-ocean/10 bg-sky px-4 py-3">
    <div className="flex items-center justify-between gap-3">
      <p className="font-black text-ink">{label}</p>
      <span className={`font-display text-3xl font-black ${danger ? 'text-clay' : 'text-ocean'}`}>{value}</span>
    </div>
    <p className="mt-1 text-sm text-ink/55">{detail}</p>
  </div>
);

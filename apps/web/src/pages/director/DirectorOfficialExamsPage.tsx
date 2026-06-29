import type { ClassDto, GradeDto, StudentGradeSummaryDto } from '@evoyamwana/shared';
import { Archive, ArrowRight, Award, CalendarCheck, CheckCircle2, ClipboardCheck, FileText, GraduationCap, Pencil, Plus, Search, ShieldCheck, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { IconActionButton } from '../../components/IconActionButton';
import { LoadingRows } from '../../components/LoadingRows';
import { PremiumGroupedBarChart } from '../../components/PremiumChart';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { classesService } from '../../services/classes.service';
import { directorReportsService, type DirectorReportDto, type DirectorReportPayload } from '../../services/directorReports.service';
import { gradesService } from '../../services/grades.service';
import type { SchoolHealthSeverity, SchoolHealthStatus } from '../../services/schoolHealth.service';

interface ExamClassRow {
  id: string;
  className: string;
  level: string;
  exam: string;
  candidates: number;
  subjects: number;
  average: number;
  readiness: 'Prêt' | 'À renforcer' | 'À risque' | 'Données à compléter';
}

const statuses: Array<{ value: SchoolHealthStatus; label: string }> = [
  { value: 'OPEN', label: 'À préparer' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'RESOLVED', label: 'Validé' },
  { value: 'ARCHIVED', label: 'Archivé' }
];

const priorities: Array<{ value: SchoolHealthSeverity; label: string }> = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGH', label: 'Élevé' },
  { value: 'CRITICAL', label: 'Critique' }
];

const initialForm: DirectorReportPayload = {
  type: 'ACADEMIC',
  title: '',
  summary: '',
  period: 'Examens officiels 2026',
  owner: 'Direction',
  status: 'OPEN',
  priority: 'HIGH',
  dueDate: ''
};

export const DirectorOfficialExamsPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [summaries, setSummaries] = useState<StudentGradeSummaryDto[]>([]);
  const [grades, setGrades] = useState<GradeDto[]>([]);
  const [reports, setReports] = useState<DirectorReportDto[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DirectorReportDto | null>(null);
  const [form, setForm] = useState<DirectorReportPayload>(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [classResponse, fallbackClassResponse, summaryResponse, gradeResponse, reportResponse] = await Promise.all([
        classesService.list({ academicYear: '2026', page: 1, pageSize: 100 }),
        classesService.list({ page: 1, pageSize: 100 }),
        gradesService.summaries({ page: 1, pageSize: 200 }).catch(() => ({ summaries: [] })),
        gradesService.list({ page: 1, pageSize: 300 }).catch(() => ({ grades: [] })),
        directorReportsService.list({
          search,
          type: 'ACADEMIC',
          status: status as SchoolHealthStatus | undefined,
          page: 1,
          pageSize: 100
        })
      ]);
      setClasses(classResponse.classes.length ? classResponse.classes : fallbackClassResponse.classes);
      setSummaries(summaryResponse.summaries);
      setGrades(gradeResponse.grades);
      setReports(reportResponse.reports.filter((report) => isExamReport(report)));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les examens officiels.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [search, status]);

  const rows = useMemo(() => buildExamClassRows(classes, summaries, grades), [classes, summaries, grades]);
  const officialRows = useMemo(() => rows.filter((row) => row.exam !== 'Base de préparation'), [rows]);
  const readyClasses = useMemo(() => rows.filter((row) => row.readiness === 'Prêt').length, [rows]);
  const riskClasses = useMemo(() => rows.filter((row) => row.readiness === 'À risque').length, [rows]);
  const incompleteClasses = useMemo(() => rows.filter((row) => row.readiness === 'Données à compléter').length, [rows]);
  const candidates = useMemo(() => (officialRows.length ? officialRows : rows).reduce((total, row) => total + row.candidates, 0), [officialRows, rows]);
  const chartRows = rows.slice(0, 8);

  const openForm = (report?: DirectorReportDto) => {
    setEditingReport(report ?? null);
    setForm(report ? {
      type: 'ACADEMIC',
      title: report.title,
      summary: report.summary,
      period: report.period,
      owner: report.owner ?? 'Direction',
      status: report.status,
      priority: report.priority,
      dueDate: report.dueDate ? report.dueDate.slice(0, 10) : ''
    } : initialForm);
    setIsFormOpen(true);
  };

  const openClassReport = (row: ExamClassRow) => {
    setEditingReport(null);
    setForm({
      type: 'ACADEMIC',
      title: `Dossier ${row.exam} - ${row.className}`,
      summary: [
        `Classe: ${row.className}.`,
        `Élèves inscrits: ${row.candidates}.`,
        `Matières suivies: ${row.subjects}.`,
        row.average ? `Moyenne actuelle: ${row.average}%.` : 'Moyenne à compléter: saisir les notes dans Performance élèves.',
        'À vérifier: liste candidats, bulletins, pièces PROVED, communication parents.'
      ].join(' '),
      period: 'Examens officiels 2026',
      owner: 'Direction',
      status: 'OPEN',
      priority: row.readiness === 'Prêt' ? 'MEDIUM' : 'HIGH',
      dueDate: ''
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingReport(null);
    setForm(initialForm);
  };

  const save = async () => {
    setIsSaving(true);
    setError('');
    try {
      const payload = { ...form, type: 'ACADEMIC' as const };
      if (editingReport) {
        await directorReportsService.update(editingReport.id, payload);
      } else {
        await directorReportsService.create(payload);
      }
      closeForm();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer le dossier d’examen.');
    } finally {
      setIsSaving(false);
    }
  };

  const validateReport = async (report: DirectorReportDto) => {
    await directorReportsService.update(report.id, { status: 'RESOLVED', type: 'ACADEMIC' });
    await load();
  };

  const archiveReport = async (report: DirectorReportDto) => {
    await directorReportsService.archive(report.id);
    await load();
  };

  return (
    <div className="px-3 py-5 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        <section className="premium-card overflow-hidden">
          <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1fr_360px] xl:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Examens officiels</p>
              <h2 className="mt-2 font-display text-4xl font-black text-ink">Préparation TENAFEP / Exetat</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-ink/60">
                Cette page rassemble les classes concernées, les élèves candidats, les moyennes disponibles et les dossiers à préparer avant les examens.
              </p>
            </div>
            <div className="rounded-xl border border-ocean/10 bg-sky p-4 text-ink shadow-card">
              <ShieldCheck size={24} className="text-ocean" />
              <h3 className="mt-4 text-xl font-black">Priorité direction</h3>
              <p className="mt-2 text-sm leading-6 text-ink/62">
                Vérifier les listes de candidats, les bulletins, les pièces PROVED et les classes qui manquent encore de résultats.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Classes concernées" value={isLoading ? '...' : String(rows.length)} icon={GraduationCap} tone="blue" detail="À suivre cette année" />
          <StatCard label="Élèves candidats" value={isLoading ? '...' : String(candidates)} icon={Award} tone="gold" detail="Dans les classes suivies" />
          <StatCard label="Dossiers prêts" value={isLoading ? '...' : String(readyClasses)} icon={CheckCircle2} tone="green" detail="Résultats suffisants" />
          <StatCard label="À compléter" value={isLoading ? '...' : String(incompleteClasses || riskClasses)} icon={CalendarCheck} tone="clay" detail="Notes ou pièces manquantes" />
        </section>

        <section className="mt-4 grid gap-3 lg:grid-cols-3">
          <ActionGuideCard
            icon={UserPlus}
            title="1. Inscrire les élèves"
            detail="Le nombre d’élèves vient de la page Inscriptions. Si une classe est vide, ajoutez d’abord les élèves."
            action="Ouvrir inscriptions"
            onClick={() => navigate('/students')}
          />
          <ActionGuideCard
            icon={Pencil}
            title="2. Saisir les notes"
            detail="La moyenne affiche “À saisir” tant que les notes ne sont pas enregistrées dans Performance élèves."
            action="Saisir les notes"
            onClick={() => navigate('/grades')}
          />
          <ActionGuideCard
            icon={FileText}
            title="3. Créer le dossier"
            detail="Quand les données sont là, créez un dossier de suivi pour les listes, bulletins, pièces PROVED et parents."
            action="Nouveau dossier"
            onClick={() => openForm()}
          />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
          <article className="premium-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Vue rapide</p>
                <h3 className="mt-1 text-2xl font-black text-ink">Niveau de dossier par classe</h3>
              </div>
              <span className="rounded-full bg-sky px-3 py-1 text-sm font-black text-ocean">{rows.length} classes</span>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <LoadingRows rows={4} />
              ) : chartRows.length ? (
                <PremiumGroupedBarChart
                  labels={chartRows.map((row) => row.className)}
                  datasets={[
                    { label: 'Dossier classe', values: chartRows.map((row) => preparationScore(row)), color: 'rgba(0, 127, 255, 0.82)' },
                    { label: 'Objectif', values: chartRows.map(() => 70), color: 'rgba(247, 214, 24, 0.82)' }
                  ]}
                />
              ) : (
                <EmptyState icon={ClipboardCheck} title="Aucune classe analysable" description="Les classes apparaîtront après chargement depuis l’API." />
              )}
            </div>
          </article>

          <article className="premium-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">À préparer</p>
                <h3 className="mt-1 text-2xl font-black text-ink">Dossier examen</h3>
              </div>
              <FileText className="text-ocean" size={26} />
            </div>
            <div className="mt-5 space-y-3">
              <ChecklistRow label="Listes candidats" detail="Noms, codes élèves, classes terminales" />
              <ChecklistRow label="Bulletins et moyennes" detail="Résultats par trimestre et progression" />
              <ChecklistRow label="Pièces ministère" detail="PROVED, agrément, registres officiels" />
              <ChecklistRow label="Communication parents" detail="Calendrier, frais, convocations" />
            </div>
          </article>
        </section>

        <section className="mt-4 grid gap-4 2xl:grid-cols-[1fr_1fr]">
          <article className="premium-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Classes</p>
                <h3 className="mt-1 text-2xl font-black text-ink">Situation des classes</h3>
              </div>
              <span className="rounded-full bg-sky px-3 py-1 text-sm font-black text-ocean">{officialRows.length || rows.length} classes</span>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <LoadingRows rows={6} />
              ) : (
                <ResponsiveTable<ExamClassRow>
                  data={rows}
                  getRowKey={(row) => row.id}
                  columns={[
                    { key: 'class', header: 'Classe', render: (row) => <div><p className="font-black">{row.className}</p><p className="text-xs text-ink/50">{row.level}</p></div> },
                    { key: 'exam', header: 'Niveau examen', render: (row) => row.exam },
                    { key: 'candidates', header: 'Élèves', render: (row) => row.candidates },
                    { key: 'subjects', header: 'Matières', render: (row) => row.subjects },
                    { key: 'average', header: 'Moyenne', render: (row) => row.average ? <span className="font-black text-ocean">{row.average}%</span> : <span className="text-ink/45">À saisir</span> },
                    { key: 'readiness', header: 'État du dossier', render: (row) => <ReadinessBadge readiness={row.readiness} /> },
                    {
                      key: 'action',
                      header: 'Compléter',
                      render: (row) => (
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => navigate('/grades')} className="inline-flex h-9 items-center gap-2 rounded-md bg-ocean px-3 text-xs font-black text-white transition hover:bg-ink">
                            <Pencil size={14} />
                            Notes
                          </button>
                          <button type="button" onClick={() => openClassReport(row)} className="inline-flex h-9 items-center gap-2 rounded-md border border-ocean/15 bg-white px-3 text-xs font-black text-ocean transition hover:bg-sky">
                            <FileText size={14} />
                            Dossier
                          </button>
                        </div>
                      )
                    }
                  ]}
                  emptyState={<EmptyState icon={GraduationCap} title="Aucune classe" description="Les classes officielles apparaîtront ici." />}
                />
              )}
            </div>
          </article>

          <article className="premium-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Suivi</p>
                <h3 className="mt-1 text-2xl font-black text-ink">Actions d’examen</h3>
              </div>
              <Button type="button" onClick={() => openForm()} className="gap-2">
                <Plus size={18} />
                Nouveau dossier
              </Button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_200px]">
              <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
                <Search size={18} className="text-ocean/55" />
                <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Rechercher examen, classe, responsable" value={search} onChange={(event) => setSearch(event.target.value)} />
              </label>
              <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">Tous statuts</option>
                {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>

            {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-bold text-clay">{error}</p> : null}

            <div className="mt-4">
              {isLoading ? (
                <LoadingRows rows={5} />
              ) : (
                <ResponsiveTable<DirectorReportDto>
                  data={reports}
                  getRowKey={(report) => report.id}
                  columns={[
                    { key: 'title', header: 'Dossier', render: (report) => <div><p className="font-black">{report.title}</p><p className="text-xs leading-5 text-ink/50">{report.summary}</p></div> },
                    { key: 'period', header: 'Période', render: (report) => report.period },
                    { key: 'owner', header: 'Responsable', render: (report) => report.owner || 'Direction' },
                    { key: 'status', header: 'Statut', render: (report) => statusLabel(report.status) },
                    {
                      key: 'actions',
                      header: 'Actions',
                      render: (report) => (
                        <div className="flex flex-wrap gap-2">
                          <IconActionButton icon={Pencil} label="Modifier" onClick={() => openForm(report)} />
                          {report.status !== 'RESOLVED' ? <IconActionButton icon={CheckCircle2} label="Valider" tone="green" onClick={() => void validateReport(report)} /> : null}
                          <IconActionButton icon={Archive} label="Archiver" tone="red" onClick={() => void archiveReport(report)} />
                        </div>
                      )
                    }
                  ]}
                  emptyState={<EmptyState icon={FileText} title="Aucun dossier d’examen" description="Créez un dossier TENAFEP, Examen d’État ou contrôle officiel par classe." />}
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
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Dossier examen officiel</p>
                <h3 className="text-2xl font-black text-ink">{editingReport ? 'Modifier le dossier' : 'Nouveau dossier'}</h3>
              </div>
              <button type="button" onClick={closeForm} className="grid h-10 w-10 place-items-center rounded-lg bg-sky text-ocean">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean" placeholder="Titre: TENAFEP Primaire 6 A" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              <textarea className="min-h-28 rounded-md border border-ocean/10 px-3 py-3 text-sm font-semibold outline-none focus:border-ocean" placeholder="Classes concernées, documents à préparer, risques, actions et échéances" value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} />
              <div className="grid gap-3 md:grid-cols-2">
                <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean" placeholder="Période" value={form.period} onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))} />
                <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean" placeholder="Responsable" value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
                <select className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as SchoolHealthSeverity }))}>
                  {priorities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <select className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as SchoolHealthStatus }))}>
                  {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
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

const buildExamClassRows = (classes: ClassDto[], summaries: StudentGradeSummaryDto[], grades: GradeDto[]): ExamClassRow[] => {
  return classes.map((classRecord) => {
    const classSummaries = summaries.filter((summary) => summary.class?.id === classRecord.id || summary.class?.name === classRecord.name);
    const classGrades = grades.filter((grade) => grade.classId === classRecord.id);
    const averagePercent = Math.round(average(classSummaries.map((summary) => summary.weightedAveragePercent || summary.averagePercent)) || average(classGrades.map((grade) => toPercent(grade))));
    const subjects = new Set(classGrades.map((grade) => grade.subjectId));
    const subjectCount = subjects.size || classRecord._count?.subjects || classRecord.subjects?.length || 0;
    const candidates = classRecord._count?.students ?? classRecord.students?.length ?? 0;
    const exam = examForClass(classRecord);
    return {
      id: classRecord.id,
      className: classRecord.name,
      level: classRecord.level,
      exam,
      candidates,
      subjects: subjectCount,
      average: averagePercent,
      readiness: readinessFor(averagePercent, subjectCount)
    };
  }).sort((a, b) => {
    if (a.exam !== 'Base de préparation' && b.exam === 'Base de préparation') return -1;
    if (a.exam === 'Base de préparation' && b.exam !== 'Base de préparation') return 1;
    return a.className.localeCompare(b.className);
  });
};

const examForClass = (classRecord: ClassDto) => {
  const text = `${classRecord.name} ${classRecord.level} ${classRecord.cycle ?? ''}`.toLowerCase();
  if (text.includes('6') || text.includes('six') || text.includes('terminale')) return 'TENAFEP / Examen final';
  if (text.includes('5') || text.includes('cinq')) return 'Pré-TENAFEP';
  if (text.includes('4') || text.includes('human')) return 'Préparation officielle';
  return 'Base de préparation';
};

const readinessFor = (averagePercent: number, subjects: number): ExamClassRow['readiness'] => {
  if (!averagePercent) return 'Données à compléter';
  if (averagePercent >= 70 && subjects >= 4) return 'Prêt';
  if (averagePercent >= 60) return 'À renforcer';
  return 'À risque';
};

const preparationScore = (row: ExamClassRow) => {
  if (row.average) return row.average;
  if (row.candidates && row.subjects >= 4) return 55;
  if (row.candidates) return 40;
  return 15;
};

const toPercent = (grade: GradeDto) => {
  const score = Number(grade.score);
  const maxScore = Number(grade.maxScore);
  return maxScore > 0 ? (score / maxScore) * 100 : 0;
};

const average = (values: number[]) => {
  const validValues = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!validValues.length) return 0;
  return validValues.reduce((total, value) => total + value, 0) / validValues.length;
};

const isExamReport = (report: DirectorReportDto) => {
  const text = `${report.title} ${report.summary} ${report.period}`.toLowerCase();
  return text.includes('examen') || text.includes('tenafep') || text.includes('état') || text.includes('etat') || text.includes('officiel');
};

const statusLabel = (status: SchoolHealthStatus) => statuses.find((item) => item.value === status)?.label ?? status;

const ReadinessBadge = ({ readiness }: { readiness: ExamClassRow['readiness'] }) => {
  const classes = readiness === 'Prêt' ? 'bg-canopy/10 text-canopy' : readiness === 'À renforcer' ? 'bg-ember/10 text-ember' : readiness === 'Données à compléter' ? 'bg-ocean/10 text-ocean' : 'bg-clay/10 text-clay';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${classes}`}>{readiness}</span>;
};

const ActionGuideCard = ({
  icon: Icon,
  title,
  detail,
  action,
  onClick
}: {
  icon: typeof UserPlus;
  title: string;
  detail: string;
  action: string;
  onClick: () => void;
}) => (
  <article className="rounded-xl border border-ocean/10 bg-white p-4 shadow-card">
    <div className="flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-sky text-ocean">
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-black text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-ink/58">{detail}</p>
        <button type="button" onClick={onClick} className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-sky px-3 text-xs font-black text-ocean transition hover:bg-ocean hover:text-white">
          {action}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  </article>
);

const ChecklistRow = ({ label, detail }: { label: string; detail: string }) => (
  <div className="rounded-lg border border-ocean/10 bg-sky px-4 py-3">
    <p className="font-black text-ink">{label}</p>
    <p className="mt-1 text-sm text-ink/55">{detail}</p>
  </div>
);

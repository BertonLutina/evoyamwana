import { AlertTriangle, Archive, BarChart3, CalendarClock, FileCheck2, FileText, FolderOpen, Megaphone, Pencil, Plus, Search, Send, ShieldCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { IconActionButton } from '../../components/IconActionButton';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { directorReportsService, type DirectorReportDto, type DirectorReportPayload, type DirectorReportSummaryDto, type DirectorReportType } from '../../services/directorReports.service';
import type { SchoolHealthSeverity, SchoolHealthStatus } from '../../services/schoolHealth.service';

const reportTypes: Array<{ value: DirectorReportType; label: string; detail: string }> = [
  { value: 'ACADEMIC', label: 'Académique', detail: 'Résultats, progression, examens' },
  { value: 'ATTENDANCE', label: 'Présences', detail: 'Absences, retards, assiduité' },
  { value: 'FINANCE', label: 'Finances', detail: 'Caisse, paiements, chiffre d’affaires' },
  { value: 'DISCIPLINE', label: 'Discipline', detail: 'Incidents, sanctions, médiation' },
  { value: 'HEALTH', label: 'Santé', detail: 'Infirmerie, urgences, suivi élèves' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructures', detail: 'Bâtiments, bancs, eau, courant' },
  { value: 'REPUTATION', label: 'Réputation', detail: 'Satisfaction parents, image école' },
  { value: 'PARTNERSHIP', label: 'Partenariats', detail: 'Sponsors, ONG, collaborateurs' },
  { value: 'COMPLIANCE', label: 'Ministère', detail: 'PROVED, agréments, inspections' },
  { value: 'MEETING', label: 'Réunions', detail: 'Décisions, responsabilités, suivi' }
];

const statuses: Array<{ value: SchoolHealthStatus; label: string }> = [
  { value: 'OPEN', label: 'Brouillon' },
  { value: 'IN_PROGRESS', label: 'En préparation' },
  { value: 'RESOLVED', label: 'Publié' },
  { value: 'ARCHIVED', label: 'Archivé' }
];

const priorities: Array<{ value: SchoolHealthSeverity; label: string }> = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGH', label: 'Élevé' },
  { value: 'CRITICAL', label: 'Critique' }
];

const emptySummary: DirectorReportSummaryDto = {
  totals: { total: 0, open: 0, published: 0, critical: 0 },
  byType: [],
  byStatus: []
};

const initialForm: DirectorReportPayload = {
  type: 'ACADEMIC',
  title: '',
  summary: '',
  period: 'Trimestre 2 - 2026',
  owner: 'Direction',
  status: 'OPEN',
  priority: 'MEDIUM',
  dueDate: ''
};

interface DirectorReportsPageProps {
  fixedType?: DirectorReportType;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export const DirectorReportsPage = ({ fixedType, eyebrow, title, description }: DirectorReportsPageProps = {}) => {
  const [reports, setReports] = useState<DirectorReportDto[]>([]);
  const [summary, setSummary] = useState<DirectorReportSummaryDto>(emptySummary);
  const [search, setSearch] = useState('');
  const [type, setType] = useState(fixedType ?? '');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DirectorReportDto | null>(null);
  const [form, setForm] = useState<DirectorReportPayload>(fixedType ? { ...initialForm, type: fixedType } : initialForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [list, nextSummary] = await Promise.all([
        directorReportsService.list({
          search,
          type: fixedType ?? ((type || undefined) as DirectorReportType | undefined),
          status: status as SchoolHealthStatus | undefined,
          page: 1,
          pageSize: 100
        }),
        directorReportsService.summary()
      ]);
      setReports(fixedType ? list.reports.filter((report) => report.type === fixedType) : list.reports);
      setSummary(nextSummary);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [search, type, status]);

  const typeRows = useMemo(() => {
    const countFor = (value: DirectorReportType) => summary.byType.find((item) => item.type === value)?._count._all ?? 0;
    return reportTypes.map((item) => ({ ...item, count: countFor(item.value) })).filter((item) => item.count > 0);
  }, [summary.byType]);
  const statusRows = useMemo(() => {
    const countFor = (value: SchoolHealthStatus) => summary.byStatus.find((item) => item.status === value)?._count._all ?? 0;
    return statuses.map((item) => ({ ...item, count: countFor(item.value) })).filter((item) => item.count > 0);
  }, [summary.byStatus]);

  const openForm = (report?: DirectorReportDto) => {
    setEditingReport(report ?? null);
    setForm(report ? {
      type: report.type,
      title: report.title,
      summary: report.summary,
      period: report.period,
      owner: report.owner ?? '',
      status: report.status,
      priority: report.priority,
      dueDate: report.dueDate ? report.dueDate.slice(0, 10) : ''
    } : fixedType ? { ...initialForm, type: fixedType } : initialForm);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingReport(null);
    setForm(fixedType ? { ...initialForm, type: fixedType } : initialForm);
  };

  const save = async () => {
    setIsSaving(true);
    setError('');
    try {
      if (editingReport) {
        await directorReportsService.update(editingReport.id, form);
      } else {
        await directorReportsService.create(form);
      }
      closeForm();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer le rapport.');
    } finally {
      setIsSaving(false);
    }
  };

  const publishReport = async (report: DirectorReportDto) => {
    await directorReportsService.update(report.id, { status: 'RESOLVED' });
    await load();
  };

  const archiveReport = async (report: DirectorReportDto) => {
    await directorReportsService.archive(report.id);
    await load();
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_360px] xl:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">{eyebrow ?? 'Synthèses direction'}</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">{title ?? 'Bibliothèque des rapports'}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">
                {description ?? 'Centralisez les documents de direction par période, type, responsable et état de publication. Cette page sert d’archive officielle, pas de registre d’alertes.'}
              </p>
            </div>
            <div className="rounded-lg border border-ocean/10 bg-[#071b3a] p-5 text-white">
              <p className="text-sm font-bold text-white/65">Archive documentaire</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-display text-5xl font-bold">{isLoading ? '...' : summary.totals.total}</p>
                <FileText size={34} className="text-maize" />
              </div>
              <p className="mt-3 text-sm text-white/70">{summary.totals.open} rapports à finaliser</p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Documents" value={isLoading ? '...' : String(summary.totals.total)} icon={FolderOpen} tone="blue" detail="Rapports enregistrés" />
          <StatCard label="À finaliser" value={isLoading ? '...' : String(summary.totals.open)} icon={AlertTriangle} tone="orange" detail="Brouillons ou en cours" />
          <StatCard label="Publiés" value={isLoading ? '...' : String(summary.totals.published)} icon={FileCheck2} tone="green" detail="Validés par direction" />
          <StatCard label="Critiques" value={isLoading ? '...' : String(summary.totals.critical)} icon={Megaphone} tone="orange" detail="Priorité haute" />
        </section>

        <section className="mt-5 grid gap-4 xl:grid-cols-2">
          <article className="rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Rayons documentaires</h3>
              <BarChart3 className="text-ocean" size={20} />
            </div>
            <div className="mt-4 grid gap-2.5 md:grid-cols-2">
              {typeRows.length ? typeRows.map((item) => (
                <div key={item.value} className="rounded-lg border border-ocean/10 bg-sky px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-ink">{item.label}</p>
                    <span className="font-display text-2xl font-black text-ocean">{item.count}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-ink/55">{item.detail}</p>
                </div>
              )) : <p className="text-sm text-ink/55">Aucune catégorie chargée.</p>}
            </div>
          </article>

          <article className="rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">État de publication</h3>
              <ShieldCheck className="text-ocean" size={20} />
            </div>
            <div className="mt-4 space-y-3">
              {statusRows.length ? statusRows.map((item) => (
                <div key={item.value} className="rounded-lg border border-ocean/10 bg-sky px-3 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink">{item.label}</p>
                    <span className="font-display text-2xl font-black text-ocean">{item.count}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white">
                    <div className="h-full rounded-full bg-ocean" style={{ width: `${Math.min(100, (item.count / Math.max(1, summary.totals.total)) * 100)}%` }} />
                  </div>
                </div>
              )) : <EmptyState icon={FileText} title="Aucun état" description="Les états de publication apparaîtront avec les rapports." />}
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <div className="grid gap-3 xl:grid-cols-[1fr_220px_220px_auto]">
            <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
              <Search size={18} className="text-ocean/55" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Rechercher rapport, période, responsable" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            {fixedType ? null : (
              <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink" value={type} onChange={(event) => setType(event.target.value)}>
                <option value="">Tous rapports</option>
                {reportTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            )}
            <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Tous statuts</option>
              {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <Button type="button" onClick={() => openForm()} className="gap-2">
              <Plus size={18} />
              Nouveau rapport
            </Button>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Registre imprimable</p>
                <h3 className="mt-1 text-2xl font-bold text-ink">Archive des documents</h3>
              </div>
              <span className="rounded-full bg-sky px-3 py-1 text-sm font-bold text-ocean">{reports.length} lignes</span>
            </div>
            <div className="mt-5">
              {isLoading ? (
                <LoadingRows rows={7} />
              ) : (
                <ResponsiveTable
                  data={reports}
                  getRowKey={(report) => report.id}
                  emptyState={<EmptyState icon={FileText} title="Aucun rapport" description="Créez un rapport de direction pour préparer le comité ou l’inspection." />}
                  columns={[
                    { key: 'title', header: 'Rapport', render: (report) => <div><p className="font-bold">{report.title}</p><p className="text-xs text-ink/50">{report.summary}</p></div> },
                    { key: 'type', header: 'Type', render: (report) => reportTypeLabel(report.type) },
                    { key: 'period', header: 'Période', render: (report) => report.period },
                    { key: 'priority', header: 'Priorité', render: (report) => <PriorityBadge priority={report.priority} /> },
                    { key: 'status', header: 'Statut', render: (report) => <StatusBadge status={report.status} /> },
                    { key: 'owner', header: 'Responsable', render: (report) => report.owner || 'Direction' },
                    { key: 'date', header: 'Date clé', render: (report) => <ReportDate report={report} /> },
                    {
                      key: 'actions',
                      header: 'Action',
                      render: (report) => (
                        <div className="flex flex-wrap gap-2">
                          <IconActionButton icon={Pencil} label="Modifier" onClick={() => openForm(report)} />
                          {report.status !== 'RESOLVED' && report.status !== 'ARCHIVED' ? <IconActionButton icon={Send} label="Publier" tone="green" onClick={() => publishReport(report)} /> : null}
                          {report.status !== 'ARCHIVED' ? <IconActionButton icon={Archive} label="Archiver" tone="red" onClick={() => archiveReport(report)} /> : null}
                        </div>
                      )
                    }
                  ]}
                />
              )}
            </div>
          </article>
        </section>

        {isFormOpen ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-8">
            <div className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-panel">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Rapport direction</p>
                  <h3 className="mt-1 text-2xl font-bold text-ink">{editingReport ? 'Modifier le rapport' : 'Nouveau rapport'}</h3>
                </div>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-md bg-sky text-ink hover:text-clay" onClick={closeForm} aria-label="Fermer">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {fixedType ? null : (
                  <label className="grid gap-2 text-sm font-bold text-ink">
                    Type
                    <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 font-semibold" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as DirectorReportType }))}>
                      {reportTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </label>
                )}
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Période
                  <input className="h-11 rounded-md border border-ocean/10 px-3 font-semibold outline-none focus:border-ocean" value={form.period} onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm font-bold text-ink sm:col-span-2">
                  Titre
                  <input className="h-11 rounded-md border border-ocean/10 px-3 font-semibold outline-none focus:border-ocean" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Ex: Synthèse financière trimestre 2" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-ink sm:col-span-2">
                  Résumé
                  <textarea className="min-h-28 rounded-md border border-ocean/10 px-3 py-2 font-semibold outline-none focus:border-ocean" value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} placeholder="Points clés, décisions attendues, chiffres importants..." />
                </label>
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Responsable
                  <input className="h-11 rounded-md border border-ocean/10 px-3 font-semibold outline-none focus:border-ocean" value={form.owner ?? ''} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Échéance
                  <input type="date" className="h-11 rounded-md border border-ocean/10 px-3 font-semibold outline-none focus:border-ocean" value={form.dueDate ?? ''} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Statut
                  <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 font-semibold" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as SchoolHealthStatus }))}>
                    {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Priorité
                  <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 font-semibold" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as SchoolHealthSeverity }))}>
                    {priorities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={closeForm}>Annuler</Button>
                <Button type="button" onClick={save} disabled={isSaving || !form.title || !form.summary || !form.period}>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const PriorityBadge = ({ priority }: { priority: SchoolHealthSeverity }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${priority === 'CRITICAL' ? 'bg-clay text-white' : priority === 'HIGH' ? 'bg-clay/10 text-clay' : priority === 'MEDIUM' ? 'bg-orange-50 text-ember' : 'bg-canopy/10 text-canopy'}`}>
    {priorityLabel(priority)}
  </span>
);

const StatusBadge = ({ status }: { status: SchoolHealthStatus }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${status === 'RESOLVED' ? 'bg-canopy/10 text-canopy' : status === 'ARCHIVED' ? 'bg-ink/10 text-ink/60' : status === 'IN_PROGRESS' ? 'bg-sky text-ocean' : 'bg-orange-50 text-ember'}`}>
    {statusLabel(status)}
  </span>
);

const ReportDate = ({ report }: { report: DirectorReportDto }) => {
  const value = report.publishedAt || report.dueDate;
  if (!value) return <span className="text-sm text-ink/45">Non définie</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/70">
      <CalendarClock size={15} className="text-ocean" />
      {new Date(value).toLocaleDateString('fr-FR')}
    </span>
  );
};

function reportTypeLabel(value: DirectorReportType) {
  return reportTypes.find((item) => item.value === value)?.label ?? value;
}

function statusLabel(value: SchoolHealthStatus) {
  return statuses.find((status) => status.value === value)?.label ?? value;
}

function priorityLabel(value: SchoolHealthSeverity) {
  return priorities.find((priority) => priority.value === value)?.label ?? value;
}

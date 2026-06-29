import { AlertTriangle, Archive, CheckCircle2, ClipboardList, HeartPulse, Pencil, Plus, Search, ShieldCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { IconActionButton } from '../../components/IconActionButton';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { schoolHealthService, type SchoolHealthCategory, type SchoolHealthPayload, type SchoolHealthRecordDto, type SchoolHealthSeverity, type SchoolHealthStatus, type SchoolHealthSummaryDto } from '../../services/schoolHealth.service';

const categories: Array<{ value: SchoolHealthCategory; label: string }> = [
  { value: 'ATTENDANCE', label: 'Présences' },
  { value: 'PEDAGOGY', label: 'Pédagogie' },
  { value: 'FINANCE', label: 'Finances' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructures' },
  { value: 'SAFETY', label: 'Sécurité' },
  { value: 'HEALTH', label: 'Santé' },
  { value: 'REPUTATION', label: 'Réputation' },
  { value: 'COMPLIANCE', label: 'Conformité' }
];

const statuses: Array<{ value: SchoolHealthStatus; label: string }> = [
  { value: 'OPEN', label: 'Ouvert' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'RESOLVED', label: 'Résolu' },
  { value: 'ARCHIVED', label: 'Archivé' }
];

const severities: Array<{ value: SchoolHealthSeverity; label: string }> = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGH', label: 'Élevé' },
  { value: 'CRITICAL', label: 'Critique' }
];

const emptySummary: SchoolHealthSummaryDto = {
  score: null,
  totals: { records: 0, open: 0, critical: 0, resolved: 0 },
  byCategory: [],
  byStatus: [],
  bySeverity: []
};

const initialForm: SchoolHealthPayload = {
  title: '',
  description: '',
  category: 'INFRASTRUCTURE',
  status: 'OPEN',
  severity: 'MEDIUM',
  owner: '',
  dueDate: ''
};

export const DirectorSchoolHealthPage = () => {
  const [records, setRecords] = useState<SchoolHealthRecordDto[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SchoolHealthRecordDto | null>(null);
  const [form, setForm] = useState<SchoolHealthPayload>(initialForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const hasHealthData = summary.totals.records > 0 && summary.score !== null;

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [list, nextSummary] = await Promise.all([
        schoolHealthService.list({
          search,
          category: category as SchoolHealthCategory | undefined,
          status: status as SchoolHealthStatus | undefined,
          page: 1,
          pageSize: 100
        }),
        schoolHealthService.summary()
      ]);
      setRecords(list.records);
      setSummary(nextSummary);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger la santé de l’école.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [search, category, status]);

  const categoryRows = useMemo(() => {
    const countFor = (value: SchoolHealthCategory) => summary.byCategory.find((item) => item.category === value)?._count._all ?? 0;
    return categories.map((item) => ({ ...item, count: countFor(item.value) })).filter((item) => item.count > 0);
  }, [summary.byCategory]);

  const openForm = (record?: SchoolHealthRecordDto) => {
    setEditingRecord(record ?? null);
    setForm(record ? {
      title: record.title,
      description: record.description,
      category: record.category,
      status: record.status,
      severity: record.severity,
      owner: record.owner ?? '',
      dueDate: record.dueDate ? record.dueDate.slice(0, 10) : ''
    } : initialForm);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
    setForm(initialForm);
  };

  const save = async () => {
    setIsSaving(true);
    setError('');
    try {
      if (editingRecord) {
        await schoolHealthService.update(editingRecord.id, form);
      } else {
        await schoolHealthService.create(form);
      }
      closeForm();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer le dossier.');
    } finally {
      setIsSaving(false);
    }
  };

  const resolveRecord = async (record: SchoolHealthRecordDto) => {
    await schoolHealthService.update(record.id, { status: 'RESOLVED' });
    await load();
  };

  const archiveRecord = async (record: SchoolHealthRecordDto) => {
    await schoolHealthService.archive(record.id);
    await load();
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_340px] xl:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Pilotage santé école</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">Santé de l’école</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">
                Suivez les alertes concrètes de l’école: présence, pédagogie, finances, infrastructures, sécurité, santé, réputation et conformité ministère.
              </p>
            </div>
            <div className="rounded-lg border border-ocean/10 bg-[#071b3a] p-5 text-white">
              <p className="text-sm font-bold text-white/65">Indice santé global</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-display text-5xl font-bold">{isLoading ? '...' : hasHealthData ? `${summary.score}%` : 'Non évalué'}</p>
                <HeartPulse size={34} className="text-maize" />
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/15">
                <div className="h-full rounded-full bg-maize" style={{ width: `${hasHealthData ? summary.score : 0}%` }} />
              </div>
              {!hasHealthData && !isLoading ? <p className="mt-3 text-xs font-bold text-white/60">Créez un dossier pour calculer l’indice.</p> : null}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Dossiers santé" value={isLoading ? '...' : String(summary.totals.records)} icon={ClipboardList} tone="blue" detail="Tous statuts" />
          <StatCard label="Alertes ouvertes" value={isLoading ? '...' : String(summary.totals.open)} icon={AlertTriangle} tone="orange" detail="Ouvertes ou en cours" />
          <StatCard label="Critiques" value={isLoading ? '...' : String(summary.totals.critical)} icon={ShieldCheck} tone="orange" detail="À traiter vite" />
          <StatCard label="Résolus" value={isLoading ? '...' : String(summary.totals.resolved)} icon={CheckCircle2} tone="green" detail="Actions clôturées" />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <div className="grid gap-3 xl:grid-cols-[1fr_220px_220px_auto]">
            <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
              <Search size={18} className="text-ocean/55" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Rechercher alerte, responsable ou dossier" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">Toutes catégories</option>
              {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Tous statuts</option>
              {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <Button type="button" onClick={() => openForm()} className="gap-2">
              <Plus size={18} />
              Nouveau dossier
            </Button>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-ink">Dossiers actifs</h3>
              <span className="text-sm font-bold text-ink/45">{records.length} lignes</span>
            </div>
            <div className="mt-5">
              {isLoading ? (
                <LoadingRows rows={6} />
              ) : (
                <ResponsiveTable
                  data={records}
                  getRowKey={(record) => record.id}
                  columns={[
                    { key: 'title', header: 'Dossier', render: (record) => <div><p className="font-bold">{record.title}</p><p className="text-xs text-ink/50">{record.description}</p></div> },
                    { key: 'category', header: 'Catégorie', render: (record) => categoryLabel(record.category) },
                    { key: 'severity', header: 'Niveau', render: (record) => <SeverityBadge severity={record.severity} /> },
                    { key: 'status', header: 'Statut', render: (record) => statusLabel(record.status) },
                    { key: 'owner', header: 'Responsable', render: (record) => record.owner || 'Direction' },
                    {
                      key: 'actions',
                      header: 'Actions',
                      render: (record) => (
                        <div className="flex flex-wrap gap-2">
                          <IconActionButton icon={Pencil} label="Modifier" onClick={() => openForm(record)} />
                          {record.status !== 'RESOLVED' ? <IconActionButton icon={CheckCircle2} label="Résoudre" tone="green" onClick={() => void resolveRecord(record)} /> : null}
                          <IconActionButton icon={Archive} label="Archiver" tone="red" onClick={() => void archiveRecord(record)} />
                        </div>
                      )
                    }
                  ]}
                  emptyState={<EmptyState icon={HeartPulse} title="Aucun dossier santé" description="Créez une première alerte ou un dossier de suivi école." />}
                />
              )}
            </div>
          </article>

          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Répartition</p>
            <h3 className="mt-1 text-xl font-bold text-ink">Catégories suivies</h3>
            <div className="mt-5 space-y-4">
              {categoryRows.length ? categoryRows.map((item) => (
                <div key={item.value}>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{item.label}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-sky">
                    <div className="h-full rounded-full bg-ocean" style={{ width: `${Math.min(100, (item.count / Math.max(1, summary.totals.records)) * 100)}%` }} />
                  </div>
                </div>
              )) : <EmptyState icon={ClipboardList} title="Aucune catégorie" description="Les catégories apparaîtront après création de dossiers." />}
            </div>
          </article>
        </section>
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Dossier santé école</p>
                <h3 className="text-2xl font-bold text-ink">{editingRecord ? 'Modifier le dossier' : 'Nouveau dossier'}</h3>
              </div>
              <button type="button" onClick={closeForm} className="grid h-10 w-10 place-items-center rounded-md bg-sky text-ocean">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean" placeholder="Titre du dossier" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              <textarea className="min-h-28 rounded-md border border-ocean/10 px-3 py-3 text-sm font-semibold outline-none focus:border-ocean" placeholder="Description, contexte et action attendue" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              <div className="grid gap-3 md:grid-cols-2">
                <select className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as SchoolHealthCategory }))}>
                  {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <select className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold" value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value as SchoolHealthSeverity }))}>
                  {severities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <select className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as SchoolHealthStatus }))}>
                  {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
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

const categoryLabel = (category: SchoolHealthCategory) => categories.find((item) => item.value === category)?.label ?? category;
const statusLabel = (status: SchoolHealthStatus) => statuses.find((item) => item.value === status)?.label ?? status;

const SeverityBadge = ({ severity }: { severity: SchoolHealthSeverity }) => {
  const classes = severity === 'CRITICAL' ? 'bg-clay/10 text-clay' : severity === 'HIGH' ? 'bg-orange-50 text-ember' : severity === 'MEDIUM' ? 'bg-sky text-ocean' : 'bg-canopy/10 text-canopy';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${classes}`}>{severities.find((item) => item.value === severity)?.label}</span>;
};

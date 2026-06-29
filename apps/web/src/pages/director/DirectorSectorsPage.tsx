import {
  AlertTriangle,
  Banknote,
  BookOpen,
  Bus,
  ChefHat,
  GraduationCap,
  Handshake,
  HeartPulse,
  Library,
  MessageSquare,
  Pencil,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Archive,
  CheckCircle2,
  UserRoundCheck,
  UsersRound,
  X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { IconActionButton } from '../../components/IconActionButton';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { sectorDossiersService, type SchoolSector, type SectorDossierDto, type SectorDossierPayload, type SectorDossierSummaryDto } from '../../services/sectorDossiers.service';
import type { SchoolHealthSeverity, SchoolHealthStatus } from '../../services/schoolHealth.service';

type SectorTone = 'blue' | 'green' | 'orange';

type Sector = {
  id: SchoolSector;
  name: string;
  owner: string;
  dossiers: number;
  status: 'Stable' | 'À surveiller' | 'Prioritaire';
  alerts: number;
  lastActivity: string;
  route: string;
  icon: LucideIcon;
  tone: SectorTone;
  documents: string[];
  actions: string[];
};

const baseSectors: Omit<Sector, 'dossiers' | 'alerts'>[] = [
  { id: 'TEACHERS', name: 'Enseignants', owner: 'Direction pédagogique', status: 'Stable', lastActivity: 'Contrats, horaires, matières et remplacements', route: '/teachers', icon: UserRoundCheck, tone: 'blue', documents: ['Contrats', 'Fiches enseignants'], actions: ['Voir profils', 'Suivre affectations'] },
  { id: 'PARENTS', name: 'Parents', owner: 'Secrétariat', status: 'Stable', lastActivity: 'Contacts, autorisations, responsables légaux', route: '/parents', icon: UsersRound, tone: 'green', documents: ['Fiches responsables'], actions: ['Voir contacts', 'Envoyer message'] },
  { id: 'STUDENTS', name: 'Élèves', owner: 'Direction', status: 'Stable', lastActivity: 'Dossiers scolaires, transferts et progression', route: '/students', icon: GraduationCap, tone: 'blue', documents: ['Dossiers élèves', 'Transferts'], actions: ['Voir dossiers', 'Analyser effectifs'] },
  { id: 'SECRETARY', name: 'Secrétariat', owner: 'Secrétaire principal', status: 'Stable', lastActivity: 'Admissions, attestations et archives', route: '/students', icon: ShieldCheck, tone: 'green', documents: ['Attestations', 'Certificats'], actions: ['Dossiers élèves', 'Documents'] },
  { id: 'ACCOUNTANT', name: 'Comptabilité', owner: 'Comptable', status: 'À surveiller', lastActivity: 'Paiements, reçus, soldes et caisse', route: '/payments', icon: Banknote, tone: 'orange', documents: ['Reçus', 'Journal caisse'], actions: ['Voir paiements', 'Relances'] },
  { id: 'CLASS_TUTOR', name: 'Titulaires', owner: 'Préfet des études', status: 'Stable', lastActivity: 'Suivi de classe, bulletins et discipline légère', route: '/classes', icon: BookOpen, tone: 'blue', documents: ['Carnets de classe'], actions: ['Voir classes', 'Présences'] },
  { id: 'DISCIPLINE', name: 'Discipline', owner: 'Surveillant général', status: 'À surveiller', lastActivity: 'Retards, absences, incidents, convocations', route: '/attendance', icon: Scale, tone: 'orange', documents: ['Rapports discipline'], actions: ['Suivre absences', 'Voir alertes'] },
  { id: 'LIBRARY', name: 'Bibliothèque', owner: 'Bibliothécaire', status: 'Stable', lastActivity: 'Prêts, ressources et rappels livres', route: '/students', icon: Library, tone: 'green', documents: ['Registre prêts'], actions: ['Lecteurs', 'Rappels'] },
  { id: 'NURSE', name: 'Infirmerie', owner: 'Infirmier scolaire', status: 'Stable', lastActivity: 'Santé, urgences et suivi familles', route: '/school-health', icon: HeartPulse, tone: 'green', documents: ['Fiches santé'], actions: ['Dossiers utiles', 'Absences santé'] },
  { id: 'TRANSPORT', name: 'Transport scolaire', owner: 'Responsable transport', status: 'Stable', lastActivity: 'Trajets, listes bus et contacts parents', route: '/parents', icon: Bus, tone: 'blue', documents: ['Listes trajets'], actions: ['Élèves transportés', 'Contacts'] },
  { id: 'CANTEEN', name: 'Cantine', owner: 'Responsable cantine', status: 'Stable', lastActivity: 'Repas, allergies, soldes cantine', route: '/payments', icon: ChefHat, tone: 'green', documents: ['Registre repas'], actions: ['Paiements cantine', 'Messages'] },
  { id: 'COLLABORATORS', name: 'Collaborateurs', owner: 'Direction', status: 'Prioritaire', lastActivity: 'Sponsors, partenaires, projets et contrats', route: '/partners', icon: Handshake, tone: 'orange', documents: ['Contrats sponsor'], actions: ['Voir contrats', 'Suivre échéances'] }
];

const statuses: Array<{ value: SchoolHealthStatus; label: string }> = [
  { value: 'OPEN', label: 'Ouvert' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'RESOLVED', label: 'Résolu' },
  { value: 'ARCHIVED', label: 'Archivé' }
];

const priorities: Array<{ value: SchoolHealthSeverity; label: string }> = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGH', label: 'Élevé' },
  { value: 'CRITICAL', label: 'Critique' }
];

const emptySummary: SectorDossierSummaryDto = {
  totals: { total: 0, open: 0, critical: 0 },
  bySector: [],
  byStatus: []
};

const initialForm: SectorDossierPayload = {
  sector: 'TEACHERS',
  title: '',
  description: '',
  owner: '',
  status: 'OPEN',
  priority: 'MEDIUM',
  dueDate: ''
};

export const DirectorSectorsPage = () => {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dossiers, setDossiers] = useState<SectorDossierDto[]>([]);
  const [summary, setSummary] = useState<SectorDossierSummaryDto>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDossier, setEditingDossier] = useState<SectorDossierDto | null>(null);
  const [form, setForm] = useState<SectorDossierPayload>(initialForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [dossierList, dossierSummary] = await Promise.all([
        sectorDossiersService.list({
          search,
          sector: sectorFilter as SchoolSector | undefined,
          status: statusFilter as SchoolHealthStatus | undefined,
          page: 1,
          pageSize: 100
        }),
        sectorDossiersService.summary()
      ]);
      setDossiers(dossierList.dossiers);
      setSummary(dossierSummary);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les secteurs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [search, sectorFilter, statusFilter]);

  const sectors = useMemo(() => {
    const computed = baseSectors.flatMap((sector) => {
      const sectorDossiers = dossiers.filter((dossier) => dossier.sector === sector.id);
      const dossierCount = sectorDossiers.length;
      if (!dossierCount) return [];
      const openAlerts = dossiers.filter((dossier) => dossier.sector === sector.id && ['OPEN', 'IN_PROGRESS'].includes(dossier.status)).length;
      const criticalAlerts = dossiers.filter((dossier) => dossier.sector === sector.id && dossier.priority === 'CRITICAL' && !['RESOLVED', 'ARCHIVED'].includes(dossier.status)).length;
      const latestDossier = [...sectorDossiers].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime())[0];
      const status: Sector['status'] = criticalAlerts ? 'Prioritaire' : openAlerts ? 'À surveiller' : 'Stable';
      return {
        ...sector,
        owner: latestDossier?.owner || 'Non assigné',
        status,
        tone: criticalAlerts || openAlerts ? 'orange' : sector.tone,
        dossiers: dossierCount,
        alerts: openAlerts,
        lastActivity: latestDossier ? latestDossier.title : 'Aucun dossier enregistré',
        documents: sectorDossiers.map((dossier) => dossier.title).slice(0, 3),
        actions: [`${openAlerts} ouvert(s)`, `${criticalAlerts} critique(s)`]
      };
    });
    return computed.filter((sector) => `${sector.name} ${sector.owner} ${sector.documents.join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  }, [search, dossiers]);

  const openAlerts = summary.totals.open;
  const activeDossiers = summary.totals.total;

  const openForm = (dossier?: SectorDossierDto) => {
    setEditingDossier(dossier ?? null);
    setForm(dossier ? {
      sector: dossier.sector,
      title: dossier.title,
      description: dossier.description,
      owner: dossier.owner ?? '',
      status: dossier.status,
      priority: dossier.priority,
      dueDate: dossier.dueDate ? dossier.dueDate.slice(0, 10) : ''
    } : initialForm);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDossier(null);
    setForm(initialForm);
  };

  const save = async () => {
    setIsSaving(true);
    setError('');
    try {
      if (editingDossier) {
        await sectorDossiersService.update(editingDossier.id, form);
      } else {
        await sectorDossiersService.create(form);
      }
      closeForm();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer le dossier.');
    } finally {
      setIsSaving(false);
    }
  };

  const resolveDossier = async (dossier: SectorDossierDto) => {
    await sectorDossiersService.update(dossier.id, { status: 'RESOLVED' });
    await load();
  };

  const archiveDossier = async (dossier: SectorDossierDto) => {
    await sectorDossiersService.archive(dossier.id);
    await load();
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_340px] xl:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Pilotage des secteurs</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">Secteurs & dossiers</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">
                Pilotez chaque service de l’école avec des dossiers traçables: responsable, priorité, échéance, statut et action attendue.
              </p>
            </div>
            <div className="rounded-lg border border-ocean/10 bg-[#071b3a] p-5 text-white">
              <p className="text-sm font-bold text-white/65">Registre direction</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-display text-5xl font-bold">{isLoading ? '...' : activeDossiers}</p>
                <ShieldCheck size={34} className="text-maize" />
              </div>
              <p className="mt-3 text-sm text-white/70">{openAlerts} dossiers ouverts ou en cours</p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Secteurs suivis" value={isLoading ? '...' : String(sectors.length)} icon={ShieldCheck} tone="blue" detail="Avec dossiers enregistrés" />
          <StatCard label="Dossiers direction" value={isLoading ? '...' : String(activeDossiers)} icon={BookOpen} tone="green" detail="Dossiers enregistrés" />
          <StatCard label="Critiques" value={isLoading ? '...' : String(summary.totals.critical)} icon={AlertTriangle} tone="orange" detail="À traiter vite" />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <div className="grid gap-3 xl:grid-cols-[1fr_220px_220px_auto]">
            <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
              <Search size={18} className="text-ocean/55" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Rechercher secteur, responsable, document ou dossier" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink" value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
              <option value="">Tous secteurs</option>
              {baseSectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
            </select>
            <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
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

        <section className="mt-5 grid gap-4 xl:grid-cols-3">
          {sectors.length ? (
            sectors.map((sector) => <SectorCard key={sector.id} sector={sector} isLoading={isLoading} />)
          ) : (
            <div className="xl:col-span-3">
              <EmptyState icon={Search} title="Aucun secteur avec dossier" description="Créez un dossier sectoriel pour afficher un secteur suivi ici." />
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Dossiers opérationnels</p>
              <h3 className="mt-1 text-2xl font-bold text-ink">Registre des secteurs</h3>
            </div>
            <span className="rounded-full bg-sky px-3 py-1 text-sm font-bold text-ocean">{dossiers.length} lignes affichées</span>
          </div>
          <div className="mt-5">
            {isLoading ? (
              <LoadingRows rows={6} />
            ) : (
              <ResponsiveTable
                data={dossiers}
                getRowKey={(dossier) => dossier.id}
                emptyState={<EmptyState icon={BookOpen} title="Aucun dossier sectoriel" description="Créez un dossier pour suivre une action de direction." />}
                columns={[
                  { key: 'title', header: 'Dossier', render: (dossier) => <div><p className="font-bold">{dossier.title}</p><p className="text-xs text-ink/50">{dossier.description}</p></div> },
                  { key: 'sector', header: 'Secteur', render: (dossier) => sectorLabel(dossier.sector) },
                  { key: 'priority', header: 'Priorité', render: (dossier) => <PriorityBadge priority={dossier.priority} /> },
                  { key: 'status', header: 'Statut', render: (dossier) => <StatusBadge status={dossier.status} /> },
                  { key: 'owner', header: 'Responsable', render: (dossier) => dossier.owner || 'Direction' },
                  { key: 'dueDate', header: 'Échéance', render: (dossier) => dossier.dueDate ? new Date(dossier.dueDate).toLocaleDateString('fr-FR') : 'Non définie' },
                  {
                    key: 'actions',
                    header: 'Action',
                    render: (dossier) => (
                      <div className="flex flex-wrap gap-2">
                        <IconActionButton icon={Pencil} label="Modifier" onClick={() => openForm(dossier)} />
                        {dossier.status !== 'RESOLVED' && dossier.status !== 'ARCHIVED' ? <IconActionButton icon={CheckCircle2} label="Résoudre" tone="green" onClick={() => resolveDossier(dossier)} /> : null}
                        {dossier.status !== 'ARCHIVED' ? <IconActionButton icon={Archive} label="Archiver" tone="red" onClick={() => archiveDossier(dossier)} /> : null}
                      </div>
                    )
                  }
                ]}
              />
            )}
          </div>
        </section>

        {isFormOpen ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-8">
            <div className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-panel">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Dossier secteur</p>
                  <h3 className="mt-1 text-2xl font-bold text-ink">{editingDossier ? 'Modifier le dossier' : 'Nouveau dossier'}</h3>
                </div>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-md bg-sky text-ink hover:text-clay" onClick={closeForm} aria-label="Fermer">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Secteur
                  <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 font-semibold" value={form.sector} onChange={(event) => setForm((current) => ({ ...current, sector: event.target.value as SchoolSector }))}>
                    {baseSectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Responsable
                  <input className="h-11 rounded-md border border-ocean/10 px-3 font-semibold outline-none focus:border-ocean" value={form.owner ?? ''} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} placeholder="Ex: Direction, Comptabilité" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-ink sm:col-span-2">
                  Titre
                  <input className="h-11 rounded-md border border-ocean/10 px-3 font-semibold outline-none focus:border-ocean" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Ex: Contrats enseignants à vérifier" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-ink sm:col-span-2">
                  Description
                  <textarea className="min-h-28 rounded-md border border-ocean/10 px-3 py-2 font-semibold outline-none focus:border-ocean" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Action attendue, contexte, documents nécessaires..." />
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
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Échéance
                  <input type="date" className="h-11 rounded-md border border-ocean/10 px-3 font-semibold outline-none focus:border-ocean" value={form.dueDate ?? ''} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
                </label>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={closeForm}>Annuler</Button>
                <Button type="button" onClick={save} disabled={isSaving || !form.title || !form.description}>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const SectorCard = ({ sector, isLoading }: { sector: Sector; isLoading: boolean }) => {
  const Icon = sector.icon;
  return (
    <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-md ${sector.tone === 'orange' ? 'bg-clay/10 text-clay' : sector.tone === 'green' ? 'bg-canopy/10 text-canopy' : 'bg-sky text-ocean'}`}>
          <Icon size={22} />
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${sector.status === 'Stable' ? 'bg-canopy/10 text-canopy' : sector.status === 'Prioritaire' ? 'bg-clay/10 text-clay' : 'bg-orange-50 text-ember'}`}>
          {sector.status}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-bold text-ink">{sector.name}</h3>
      <p className="mt-1 text-sm text-ink/55">Responsable: {sector.owner}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-sky p-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ocean/65">Dossiers</p>
          <p className="mt-1 text-2xl font-bold text-ink">{isLoading ? '...' : sector.dossiers}</p>
        </div>
        <div className="rounded-md bg-orange-50 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ember/70">Alertes</p>
          <p className="mt-1 text-2xl font-bold text-ink">{isLoading ? '...' : sector.alerts}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">{sector.lastActivity}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {sector.documents.map((document) => (
          <span key={document} className="rounded-full bg-sky px-2.5 py-1 text-xs font-bold text-ocean">{document}</span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-ocean/10 pt-4">
        <div className="text-xs font-semibold text-ink/55">{sector.actions.join(' - ')}</div>
        <Link to={sector.route} className="text-sm font-black text-ocean hover:text-ember">Ouvrir</Link>
      </div>
    </article>
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

function sectorLabel(value: SchoolSector) {
  return baseSectors.find((sector) => sector.id === value)?.name ?? value;
}

function statusLabel(value: SchoolHealthStatus) {
  return statuses.find((status) => status.value === value)?.label ?? value;
}

function priorityLabel(value: SchoolHealthSeverity) {
  return priorities.find((priority) => priority.value === value)?.label ?? value;
}

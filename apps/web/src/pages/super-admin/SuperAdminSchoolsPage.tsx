import { Building2, CheckCircle2, Search, UsersRound, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { platformService, type PlatformSchoolDto, type SchoolRegistrationRequestDto } from '../../services/platform.service';
import { SuperAdminShell } from './SuperAdminShell';

export const SuperAdminSchoolsPage = () => {
  const [schools, setSchools] = useState<PlatformSchoolDto[]>([]);
  const [requests, setRequests] = useState<SchoolRegistrationRequestDto[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([
      platformService.schools({ search, page: 1, pageSize: 100 }),
      platformService.schoolRegistrations({ status: 'PENDING', page: 1, pageSize: 100 })
    ])
      .then(([schoolData, requestData]) => {
        if (isMounted) {
          setSchools(schoolData);
          setRequests(requestData);
        }
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les écoles.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  };

  useEffect(load, [search]);

  const reviewRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setError('');
    try {
      if (action === 'approve') {
        await platformService.approveSchoolRegistration(requestId);
      } else {
        await platformService.rejectSchoolRegistration(requestId, 'Demande refusée après vérification.');
      }
      setRequests((current) => current.filter((request) => request.id !== requestId));
      const data = await platformService.schools({ search, page: 1, pageSize: 100 });
      setSchools(data);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Impossible de traiter cette demande.');
    }
  };

  const totals = useMemo(() => ({
    users: schools.reduce((sum, school) => sum + school._count.users, 0),
    students: schools.reduce((sum, school) => sum + school._count.students, 0)
  }), [schools]);

  return (
    <SuperAdminShell
      eyebrow="Plateforme"
      title="Écoles"
      description="Validez les demandes d’inscription, puis suivez les écoles actives et leurs comptes."
      icon={Building2}
    >
      {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}
      <section className="mt-5 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-ink">Demandes à valider</h3>
            <p className="mt-1 text-sm text-ink/58">Le super admin vérifie les informations avant de créer l’école et son premier admin.</p>
          </div>
          <span className="rounded-full bg-sky px-3 py-1 text-sm font-black text-ocean">{requests.length} en attente</span>
        </div>
        <div className="mt-4 grid gap-3">
          {requests.length ? requests.map((request) => (
            <div key={request.id} className="grid gap-3 rounded-md border border-ocean/10 bg-sky/45 p-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <p className="font-black text-ink">{request.schoolName}</p>
                <p className="mt-1 text-sm text-ink/58">{request.city}, {request.country} · {request.schoolEmail}</p>
                <p className="mt-1 text-sm font-semibold text-ink/70">Responsable: {request.ownerFullName} · {request.ownerEmail}</p>
                {request.accreditationNumber ? <p className="mt-1 text-xs font-bold text-ocean">Agrément: {request.accreditationNumber}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" className="gap-2" onClick={() => reviewRequest(request.id, 'approve')}><CheckCircle2 size={16} /> Approuver</Button>
                <Button type="button" variant="secondary" className="gap-2 text-clay" onClick={() => reviewRequest(request.id, 'reject')}><XCircle size={16} /> Refuser</Button>
              </div>
            </div>
          )) : <p className="rounded-md bg-sky px-3 py-3 text-sm font-semibold text-ink/58">Aucune demande en attente.</p>}
        </div>
      </section>
      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <StatCard label="Écoles actives" value={isLoading ? '...' : String(schools.length)} icon={Building2} tone="blue" detail="Structures suivies" />
        <StatCard label="Utilisateurs" value={isLoading ? '...' : String(totals.users)} icon={UsersRound} tone="orange" detail="Comptes liés" />
        <StatCard label="Élèves" value={isLoading ? '...' : String(totals.students)} icon={UsersRound} tone="green" detail="Inscriptions actives" />
      </section>
      <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
        <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
          <Search size={18} className="text-ocean/55" />
          <input className="w-full bg-transparent text-sm outline-none" placeholder="Rechercher une école" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
      </section>
      <section className="mt-5">
        {isLoading ? <LoadingRows rows={6} /> : schools.length ? (
          <ResponsiveTable<PlatformSchoolDto>
            data={schools}
            getRowKey={(school) => school.id}
            columns={[
              { key: 'name', header: 'École', render: (school) => <div><p className="font-bold">{school.name}</p><p className="text-xs text-ink/50">{school.email ?? 'Email non défini'}</p></div> },
              { key: 'city', header: 'Ville', render: (school) => school.city ?? '-' },
              { key: 'classes', header: 'Classes', render: (school) => school._count.classes },
              { key: 'students', header: 'Élèves', render: (school) => school._count.students },
              { key: 'users', header: 'Utilisateurs', render: (school) => school._count.users }
            ]}
          />
        ) : <EmptyState icon={Building2} title="Aucune école" description="Les écoles créées apparaîtront ici." />}
      </section>
    </SuperAdminShell>
  );
};

import { Building2, LockKeyhole, MessageSquare, Settings, ShieldCheck, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { platformService, type PlatformReportDto } from '../../services/platform.service';
import { SuperAdminShell } from './SuperAdminShell';

export const SuperAdminSettingsPage = () => {
  const { user } = useAuth();
  const [report, setReport] = useState<PlatformReportDto | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    platformService
      .reports()
      .then((data) => {
        if (isMounted) setReport(data);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les statistiques plateforme.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SuperAdminShell eyebrow="Configuration" title="Paramètres" description="Compte super admin, gouvernance plateforme et accès aux espaces globaux." icon={Settings}>
      {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <StatCard label="Écoles" value={isLoading ? '...' : String(report?.totals.schools ?? 0)} icon={Building2} tone="blue" detail="Structures sur la plateforme" />
        <StatCard label="Utilisateurs" value={isLoading ? '...' : String(report?.totals.users ?? 0)} icon={UsersRound} tone="green" detail="Comptes toutes écoles" />
        <StatCard label="Messages" value={isLoading ? '...' : String(report?.totals.messages ?? 0)} icon={MessageSquare} tone="orange" detail="Échangés sur la plateforme" />
      </section>

      <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Compte</p>
        <div className="mt-5 grid gap-3 text-sm">
          <ProfileRow label="Nom" value={user?.fullName ?? 'Non renseigné'} />
          <ProfileRow label="Email" value={user?.email ?? 'Non renseigné'} />
          <ProfileRow label="Rôle" value="Super admin" />
          <ProfileRow label="Portée" value="Toutes les écoles" />
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          to="/classes"
          className="flex items-center justify-between gap-4 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel transition hover:border-ocean/30 hover:shadow-lg"
        >
          <div>
            <p className="flex items-center gap-2 text-lg font-bold text-ink"><Building2 className="text-ocean" size={20} /> Écoles</p>
            <p className="mt-2 text-sm text-ink/60">Valider les inscriptions et suivre les écoles actives de la plateforme.</p>
          </div>
        </Link>
        <Link
          to="/students"
          className="flex items-center justify-between gap-4 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel transition hover:border-ocean/30 hover:shadow-lg"
        >
          <div>
            <p className="flex items-center gap-2 text-lg font-bold text-ink"><UsersRound className="text-ember" size={20} /> Utilisateurs</p>
            <p className="mt-2 text-sm text-ink/60">Rechercher et consulter tous les comptes utilisateurs, toutes écoles confondues.</p>
          </div>
        </Link>
        <Link
          to="/teachers"
          className="flex items-center justify-between gap-4 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel transition hover:border-ocean/30 hover:shadow-lg"
        >
          <div>
            <p className="flex items-center gap-2 text-lg font-bold text-ink"><ShieldCheck className="text-canopy" size={20} /> Admins d’écoles</p>
            <p className="mt-2 text-sm text-ink/60">Voir les comptes admin rattachés à chaque école.</p>
          </div>
        </Link>
        <Link
          to="/grades"
          className="flex items-center justify-between gap-4 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel transition hover:border-ocean/30 hover:shadow-lg"
        >
          <div>
            <p className="flex items-center gap-2 text-lg font-bold text-ink"><LockKeyhole className="text-ocean" size={20} /> Rapports plateforme</p>
            <p className="mt-2 text-sm text-ink/60">Statistiques globales: écoles, effectifs, présences, notes et messages.</p>
          </div>
        </Link>
      </section>
    </SuperAdminShell>
  );
};

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 rounded-md border border-ocean/10 bg-sky px-4 py-3">
    <span className="font-bold text-ink">{label}</span>
    <span className="text-right text-ink/65">{value}</span>
  </div>
);

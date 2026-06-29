import type { UserRole } from '@evoyamwana/shared';
import { Search, ShieldCheck, UserRoundCheck, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { platformService, type PlatformUserDto } from '../../services/platform.service';
import { SuperAdminShell } from './SuperAdminShell';

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super admin',
  SCHOOL_ADMIN: 'Admin école',
  DIRECTOR: 'Directeur',
  SECRETARY: 'Secrétaire',
  ACCOUNTANT: 'Comptable',
  TEACHER: 'Enseignant',
  CLASS_TUTOR: 'Titulaire',
  PARENT: 'Parent',
  STUDENT: 'Élève',
  DISCIPLINE_OFFICER: 'Discipline',
  LIBRARIAN: 'Bibliothécaire',
  NURSE: 'Infirmerie',
  TRANSPORT_MANAGER: 'Transport',
  CANTEEN_MANAGER: 'Cantine'
};

export const SuperAdminAdminsPage = () => <SuperAdminUsersPage mode="admins" />;

export const SuperAdminUsersPage = ({ mode = 'users' }: { mode?: 'users' | 'admins' }) => {
  const [users, setUsers] = useState<PlatformUserDto[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isAdmins = mode === 'admins';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    const request = isAdmins ? platformService.admins({ search, page: 1, pageSize: 100 }) : platformService.users({ search, role: role || undefined, page: 1, pageSize: 100 });
    request
      .then((data) => {
        if (isMounted) setUsers(data);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les utilisateurs.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [isAdmins, role, search]);

  return (
    <SuperAdminShell
      eyebrow="Accès plateforme"
      title={isAdmins ? 'Administrateurs' : 'Utilisateurs'}
      description={isAdmins ? 'Suivez les administrateurs scolaires et leurs écoles.' : 'Consultez tous les comptes de la plateforme par rôle et par école.'}
      icon={isAdmins ? UserRoundCheck : UsersRound}
    >
      {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}
      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <StatCard label={isAdmins ? 'Admins' : 'Comptes'} value={isLoading ? '...' : String(users.length)} icon={UsersRound} tone="blue" detail="Depuis PostgreSQL" />
        <StatCard label="Écoles liées" value={isLoading ? '...' : String(new Set(users.map((user) => user.school?.id).filter(Boolean)).size)} icon={ShieldCheck} tone="green" detail="Contextes école" />
        <StatCard label="Sécurité" value="JWT" icon={ShieldCheck} tone="orange" detail="Accès par rôle" />
      </section>
      <section className="mt-6 grid gap-3 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel md:grid-cols-[1fr_220px]">
        <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
          <Search size={18} className="text-ocean/55" />
          <input className="w-full bg-transparent text-sm outline-none" placeholder="Rechercher nom, email ou école" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        {!isAdmins ? (
          <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none" value={role} onChange={(event) => setRole(event.target.value as UserRole | '')}>
            <option value="">Tous les rôles</option>
            {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        ) : null}
      </section>
      <section className="mt-5">
        {isLoading ? <LoadingRows rows={7} /> : users.length ? (
          <ResponsiveTable<PlatformUserDto>
            data={users}
            getRowKey={(user) => user.id}
            columns={[
              { key: 'name', header: 'Nom', render: (user) => <div><p className="font-bold">{user.fullName}</p><p className="text-xs text-ink/50">{user.email}</p></div> },
              { key: 'role', header: 'Rôle', render: (user) => roleLabels[user.role] },
              { key: 'school', header: 'École', render: (user) => user.school?.name ?? 'Plateforme' },
              { key: 'city', header: 'Ville', render: (user) => user.school?.city ?? '-' }
            ]}
          />
        ) : <EmptyState icon={UsersRound} title="Aucun utilisateur" description="Aucun compte ne correspond à cette recherche." />}
      </section>
    </SuperAdminShell>
  );
};

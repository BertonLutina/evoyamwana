import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, UserPlus, UsersRound } from 'lucide-react';
import type { UserRole } from '@evoyamwana/shared';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { LoadingRows } from '../components/LoadingRows';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../hooks/useAuth';
import { platformService, type PlatformSchoolDto } from '../services/platform.service';
import { staffUsersService, type StaffUserDto, type StaffUserRole } from '../services/staffUsers.service';

const roleLabels: Record<StaffUserRole, string> = {
  SCHOOL_ADMIN: 'Admin école',
  DIRECTOR: 'Directeur',
  SECRETARY: 'Secrétaire',
  ACCOUNTANT: 'Comptable',
  CLASS_TUTOR: 'Titulaire',
  DISCIPLINE_OFFICER: 'Discipline',
  LIBRARIAN: 'Bibliothécaire',
  NURSE: 'Infirmier',
  TRANSPORT_MANAGER: 'Responsable transport',
  CANTEEN_MANAGER: 'Responsable cantine'
};

const schoolStaffRoles: StaffUserRole[] = [
  'DIRECTOR',
  'SECRETARY',
  'ACCOUNTANT',
  'CLASS_TUTOR',
  'DISCIPLINE_OFFICER',
  'LIBRARIAN',
  'NURSE',
  'TRANSPORT_MANAGER',
  'CANTEEN_MANAGER'
];

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'SECRETARY' as StaffUserRole,
  schoolId: ''
};

export const StaffUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<StaffUserDto[]>([]);
  const [schools, setSchools] = useState<PlatformSchoolDto[]>([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canCreateSchoolAdmin = user?.role === 'SUPER_ADMIN';
  const availableRoles = useMemo(
    () => (canCreateSchoolAdmin ? ['SCHOOL_ADMIN', ...schoolStaffRoles] as StaffUserRole[] : schoolStaffRoles),
    [canCreateSchoolAdmin]
  );

  const load = () => {
    let mounted = true;
    setIsLoading(true);
    setError('');

    Promise.all([
      staffUsersService.list(),
      canCreateSchoolAdmin ? platformService.schools({ page: 1, pageSize: 100 }) : Promise.resolve([])
    ])
      .then(([staffUsers, schoolList]) => {
        if (!mounted) return;
        setUsers(staffUsers);
        setSchools(schoolList);
        if (canCreateSchoolAdmin && schoolList.length) {
          setForm((current) => ({ ...current, schoolId: current.schoolId || schoolList[0].id }));
        }
      })
      .catch((loadError) => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le personnel.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  };

  useEffect(load, [canCreateSchoolAdmin]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const created = await staffUsersService.create({
        fullName: form.fullName,
        email: form.email,
        password: form.password || undefined,
        role: form.role,
        schoolId: canCreateSchoolAdmin ? form.schoolId : undefined
      });
      setUsers((current) => [created, ...current]);
      setForm((current) => ({ ...initialForm, schoolId: current.schoolId, role: canCreateSchoolAdmin ? 'SCHOOL_ADMIN' : 'SECRETARY' }));
      setSuccess('Compte créé avec succès.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible de créer ce compte.');
    } finally {
      setIsSaving(false);
    }
  };

  const roleBreakdown = users.reduce<Record<string, number>>((acc, staffUser) => {
    acc[staffUser.role] = (acc[staffUser.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-ember">Gestion des accès</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Personnel</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/62">
          Créez les comptes staff autorisés pour l’école. Les élèves, parents et enseignants restent gérés dans leurs modules dédiés.
        </p>
      </section>

      {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}
      {success ? <p className="mt-4 rounded-md bg-canopy/10 px-3 py-2 text-sm font-semibold text-canopy">{success}</p> : null}

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <StatCard label="Comptes staff" value={isLoading ? '...' : String(users.length)} icon={UsersRound} tone="blue" detail="Actifs" />
        <StatCard label="Rôles couverts" value={isLoading ? '...' : String(Object.keys(roleBreakdown).length)} icon={ShieldCheck} tone="green" detail="Dans cette école" />
        <StatCard label="Création" value={isSaving ? '...' : 'Prête'} icon={UserPlus} tone="orange" detail="Accès contrôlé" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[24rem_1fr]">
        <form className="rounded-lg border border-ocean/10 bg-white p-4 shadow-panel" onSubmit={submit}>
          <h2 className="text-lg font-black text-ink">Nouveau compte</h2>
          <div className="mt-4 grid gap-4">
            {canCreateSchoolAdmin ? (
              <label className="grid gap-2 text-sm font-semibold text-ink">
                <span>École</span>
                <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean" value={form.schoolId} onChange={(event) => setForm((current) => ({ ...current, schoolId: event.target.value }))} required>
                  {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
                </select>
              </label>
            ) : null}
            <Input label="Nom complet" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} required />
            <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            <Input label="Mot de passe" type="password" minLength={8} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="DemoPass123! par défaut" />
            <label className="grid gap-2 text-sm font-semibold text-ink">
              <span>Rôle</span>
              <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as StaffUserRole }))}>
                {availableRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
              </select>
            </label>
            <Button type="submit" disabled={isSaving || (canCreateSchoolAdmin && !form.schoolId)}>{isSaving ? 'Création...' : 'Créer le compte'}</Button>
          </div>
        </form>

        <div>
          {isLoading ? <LoadingRows rows={6} /> : users.length ? (
            <ResponsiveTable<StaffUserDto>
              data={users}
              getRowKey={(staffUser) => staffUser.id}
              columns={[
                { key: 'name', header: 'Nom', render: (staffUser) => <div><p className="font-bold">{staffUser.fullName}</p><p className="text-xs text-ink/50">{staffUser.email}</p></div> },
                { key: 'role', header: 'Rôle', render: (staffUser) => roleLabels[staffUser.role] },
                { key: 'school', header: 'École', render: (staffUser) => staffUser.school?.name ?? '-' },
                { key: 'createdAt', header: 'Créé le', render: (staffUser) => new Date(staffUser.createdAt).toLocaleDateString('fr-FR') }
              ]}
            />
          ) : <EmptyState icon={UsersRound} title="Aucun compte staff" description="Créez le premier compte pour cette école." />}
        </div>
      </section>
    </div>
  );
};

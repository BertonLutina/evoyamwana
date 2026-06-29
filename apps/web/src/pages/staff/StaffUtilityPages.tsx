import type { UserRole } from '@evoyamwana/shared';
import { LockKeyhole, MessageSquare, User, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { messagesService, type MessageContactDto } from '../../services/messages.service';

const roleLabels: Partial<Record<UserRole, string>> = {
  DIRECTOR: 'Direction',
  SECRETARY: 'Secrétariat',
  ACCOUNTANT: 'Comptabilité',
  CLASS_TUTOR: 'Titulaire',
  DISCIPLINE_OFFICER: 'Discipline',
  LIBRARIAN: 'Bibliothèque',
  NURSE: 'Infirmerie',
  TRANSPORT_MANAGER: 'Transport',
  CANTEEN_MANAGER: 'Cantine'
};

type UtilityRole = Extract<UserRole, 'DIRECTOR' | 'SECRETARY' | 'ACCOUNTANT' | 'CLASS_TUTOR' | 'DISCIPLINE_OFFICER' | 'LIBRARIAN' | 'NURSE' | 'TRANSPORT_MANAGER' | 'CANTEEN_MANAGER'>;

export const StaffProfilePage = ({ role }: { role: UtilityRole }) => {
  const { user } = useAuth();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Profil {roleLabels[role]}</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">Mon espace</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">Informations du compte connecté et accès disponibles pour ce rôle.</p>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Rôle" value={roleLabels[role] ?? role} icon={User} tone="blue" detail="Accès par rôle" />
          <StatCard label="Session" value="JWT" icon={LockKeyhole} tone="green" detail="Authentifiée" />
          <StatCard label="École" value={user?.schoolId ? 'Liée' : 'Non liée'} icon={UsersRound} tone="orange" detail="Contexte utilisateur" />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Compte</p>
          <div className="mt-5 grid gap-3 text-sm">
            <ProfileRow label="Nom" value={user?.fullName ?? 'Non renseigné'} />
            <ProfileRow label="Email" value={user?.email ?? 'Non renseigné'} />
            <ProfileRow label="Rôle" value={roleLabels[role] ?? role} />
            <ProfileRow label="École" value={user?.schoolId ?? 'Non renseignée'} />
          </div>
        </section>
      </div>
    </div>
  );
};

export const StaffUnavailablePage = ({ role, title, description }: { role: UtilityRole; title: string; description: string }) => (
  <div className="px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <section className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Espace {roleLabels[role]}</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-ink">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">{description}</p>
      </section>
      <div className="mt-5">
        <EmptyState icon={LockKeyhole} title="Accès non configuré" description="Cette section reste séparée par rôle et n’utilise pas de page générique." />
      </div>
    </div>
  </div>
);

export const ClassTutorParentsPage = () => {
  const [contacts, setContacts] = useState<MessageContactDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    messagesService
      .listContacts()
      .then((items) => {
        if (isMounted) setContacts(items.filter((item) => item.role === 'PARENT'));
      })
      .catch((loadError) => {
        if (isMounted) setMessage(loadError instanceof Error ? loadError.message : 'Impossible de charger les parents.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const domains = useMemo(() => new Set(contacts.map((contact) => contact.email.split('@')[1]).filter(Boolean)).size, [contacts]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Titulaire</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">Parents de ma classe</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">Contacts parents autorisés pour le titulaire, chargés via la messagerie existante.</p>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Parents" value={isLoading ? '...' : String(contacts.length)} icon={UsersRound} tone="blue" detail="Contacts disponibles" />
          <StatCard label="Canal" value="Messages" icon={MessageSquare} tone="green" detail="Action disponible" />
          <StatCard label="Domaines email" value={isLoading ? '...' : String(domains)} icon={User} tone="orange" detail="Familles distinctes" />
        </section>

        {message ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{message}</p> : null}

        <section className="mt-5">
          {isLoading ? (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <LoadingRows rows={6} />
            </article>
          ) : contacts.length ? (
            <ResponsiveTable
              data={contacts}
              getRowKey={(contact) => contact.id}
              columns={[
                { key: 'name', header: 'Parent', render: (contact) => <span className="font-bold">{contact.fullName}</span> },
                { key: 'email', header: 'Email', render: (contact) => contact.email },
                { key: 'role', header: 'Rôle', render: (contact) => contact.role },
                { key: 'action', header: 'Action', render: () => <Button variant="ghost" className="h-9 px-3">Message</Button> }
              ]}
            />
          ) : (
            <EmptyState icon={UsersRound} title="Aucun parent disponible" description="Les contacts parents apparaîtront ici selon les permissions de messagerie." />
          )}
        </section>
      </div>
    </div>
  );
};

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 rounded-md border border-ocean/10 bg-sky px-4 py-3">
    <span className="font-bold text-ink">{label}</span>
    <span className="text-right text-ink/65">{value}</span>
  </div>
);

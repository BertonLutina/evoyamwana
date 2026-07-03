import { BookOpen, LockKeyhole, Settings2, ShieldCheck, User, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../hooks/useAuth';

export const AdminSettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Administration</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">Paramètres</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">
            Profil du compte, gestion du personnel et des rôles, et accès aux réglages académiques de votre école.
          </p>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Rôle" value="Admin école" icon={User} tone="blue" detail="Accès complet" />
          <StatCard label="Session" value="JWT" icon={LockKeyhole} tone="green" detail="Authentifiée" />
          <StatCard label="École" value={user?.schoolId ? 'Liée' : 'Non liée'} icon={UsersRound} tone="orange" detail="Contexte utilisateur" />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Compte</p>
          <div className="mt-5 grid gap-3 text-sm">
            <ProfileRow label="Nom" value={user?.fullName ?? 'Non renseigné'} />
            <ProfileRow label="Email" value={user?.email ?? 'Non renseigné'} />
            <ProfileRow label="Rôle" value="Admin école" />
            <ProfileRow label="École" value={user?.schoolId ?? 'Non renseignée'} />
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            to="/staff-users"
            className="flex items-center justify-between gap-4 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel transition hover:border-ocean/30 hover:shadow-lg"
          >
            <div>
              <p className="flex items-center gap-2 text-lg font-bold text-ink"><ShieldCheck className="text-ocean" size={20} /> Personnel et rôles</p>
              <p className="mt-2 text-sm text-ink/60">Créer des comptes personnel, attribuer des rôles et gérer les accès de votre école.</p>
            </div>
          </Link>
          <Link
            to="/school-years"
            className="flex items-center justify-between gap-4 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel transition hover:border-ocean/30 hover:shadow-lg"
          >
            <div>
              <p className="flex items-center gap-2 text-lg font-bold text-ink"><BookOpen className="text-ember" size={20} /> Années et trimestres</p>
              <p className="mt-2 text-sm text-ink/60">Configurer les années scolaires, les trimestres et les périodes académiques.</p>
            </div>
          </Link>
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-ocean"><Settings2 size={16} /> Préférences de l'espace de travail</p>
          <p className="mt-3 text-sm leading-6 text-ink/60">
            D'autres préférences (langue, notifications, personnalisation de l'école) seront ajoutées ici au fur et à mesure des besoins de votre équipe.
          </p>
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

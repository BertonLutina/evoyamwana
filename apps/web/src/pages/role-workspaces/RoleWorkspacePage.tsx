import type { UserRole } from '@evoyamwana/shared';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  MessageSquare,
  School,
  Settings,
  ShieldCheck,
  User,
  UsersRound,
  UserRoundCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';

type WorkspaceKey = 'students' | 'teachers' | 'parents' | 'classes' | 'attendance' | 'grades' | 'payments' | 'messages' | 'settings';

interface WorkspaceCopy {
  eyebrow: string;
  title: string;
  description: string;
  primary: string;
  secondary: string;
  actionPath: string;
  icon: LucideIcon;
  stats: Array<{ label: string; value: string; detail: string; icon: LucideIcon; tone: 'blue' | 'orange' | 'green' | 'gold' | 'clay' }>;
}

const staffRoleNames: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super administrateur',
  SCHOOL_ADMIN: 'Administration',
  DIRECTOR: 'Direction',
  SECRETARY: 'Secrétariat',
  ACCOUNTANT: 'Comptabilité',
  TEACHER: 'Enseignant',
  CLASS_TUTOR: 'Titulaire',
  PARENT: 'Parent',
  STUDENT: 'Élève',
  DISCIPLINE_OFFICER: 'Discipline',
  LIBRARIAN: 'Bibliothèque',
  NURSE: 'Infirmerie',
  TRANSPORT_MANAGER: 'Transport',
  CANTEEN_MANAGER: 'Cantine'
};

const copies: Record<WorkspaceKey, Partial<Record<UserRole, WorkspaceCopy>>> = {
  students: {
    SUPER_ADMIN: platformCopy('Utilisateurs plateforme', 'Contrôlez les profils et accès au niveau global.', UsersRound),
    SCHOOL_ADMIN: platformCopy('Élèves', 'Gérez les inscriptions, classes et responsables.', GraduationCap),
    TEACHER: personalCopy('Élèves de mes classes', 'Consultez uniquement les élèves liés à vos classes assignées.', GraduationCap),
    PARENT: personalCopy('Mes enfants', 'Retrouvez les profils scolaires rattachés à votre compte parent.', GraduationCap),
    STUDENT: personalCopy('Mon profil élève', 'Accédez à votre dossier scolaire et aux informations importantes.', User)
  },
  teachers: {
    SUPER_ADMIN: platformCopy('Encadrement plateforme', 'Suivez les comptes enseignants et administratifs.', UserRoundCheck),
    SCHOOL_ADMIN: platformCopy('Enseignants', 'Gérez les profils enseignants de votre école.', UserRoundCheck),
    TEACHER: personalCopy('Mon profil enseignant', 'Votre profil, vos classes et vos matières.', UserRoundCheck),
    PARENT: personalCopy('Enseignants de mes enfants', 'Consultez les enseignants liés aux classes de vos enfants.', UserRoundCheck),
    STUDENT: personalCopy('Mes enseignants', 'Retrouvez les enseignants de vos cours.', UserRoundCheck)
  },
  parents: {
    SUPER_ADMIN: platformCopy('Familles plateforme', 'Vue globale des familles et responsables.', UsersRound),
    SCHOOL_ADMIN: platformCopy('Parents', 'Gérez les responsables et contacts familiaux.', UsersRound),
    TEACHER: personalCopy('Contacts parents', 'Échangez avec les parents des élèves de vos classes.', UsersRound),
    PARENT: personalCopy('Mon espace parent', 'Votre profil parent et vos enfants liés.', User),
    STUDENT: personalCopy('Mes responsables', 'Les contacts familiaux liés à votre dossier.', UsersRound)
  },
  classes: {
    SUPER_ADMIN: platformCopy('Écoles et classes', 'Surveillez la structure académique des écoles.', School),
    SCHOOL_ADMIN: platformCopy('Classes', 'Créez les classes et organisez les cours.', BookOpen),
    TEACHER: personalCopy('Mes classes', 'Classes assignées, listes et matières.', BookOpen),
    PARENT: personalCopy('Classes de mes enfants', 'Classes et matières suivies par vos enfants.', BookOpen),
    STUDENT: personalCopy('Mes cours', 'Votre classe, vos matières et vos enseignants.', BookOpen)
  },
  attendance: {
    SUPER_ADMIN: platformCopy('Présences plateforme', 'Suivez les tendances de présence par école.', CalendarCheck),
    SCHOOL_ADMIN: platformCopy('Présences', 'Pilotez les présences de toute l’école.', CalendarCheck),
    TEACHER: personalCopy('Présences de mes classes', 'Faites l’appel pour vos classes assignées.', CalendarCheck),
    PARENT: personalCopy('Présences de mes enfants', 'Historique des présences de vos enfants.', CalendarCheck),
    STUDENT: personalCopy('Mes présences', 'Consultez votre présence personnelle.', CalendarCheck)
  },
  grades: {
    SUPER_ADMIN: platformCopy('Performance plateforme', 'Analysez les résultats au niveau global.', ShieldCheck),
    SCHOOL_ADMIN: platformCopy('Notes', 'Suivez les évaluations de l’école.', BookOpen),
    TEACHER: personalCopy('Notes de mes classes', 'Saisissez et consultez les notes de vos élèves.', BookOpen),
    PARENT: personalCopy('Notes de mes enfants', 'Résultats par enfant, cours et trimestre.', BookOpen),
    STUDENT: personalCopy('Mes notes', 'Vos points par cours et votre évolution.', BookOpen)
  },
  payments: {
    SUPER_ADMIN: platformCopy('Revenus plateforme', 'Vue agrégée des paiements par école.', CreditCard),
    SCHOOL_ADMIN: platformCopy('Paiements', 'Factures, reçus et soldes de l’école.', CreditCard),
    TEACHER: personalCopy('Paiements', 'Les paiements ne font pas partie de votre espace enseignant.', CreditCard),
    PARENT: personalCopy('Mes paiements', 'Soldes, échéances et reçus de vos enfants.', CreditCard),
    STUDENT: personalCopy('Paiements', 'Informations de paiement liées à votre dossier.', CreditCard)
  },
  messages: {
    SUPER_ADMIN: platformCopy('Messages plateforme', 'Communications globales et support.', MessageSquare),
    SCHOOL_ADMIN: platformCopy('Messages', 'Conversations école, parents et équipe.', MessageSquare),
    TEACHER: personalCopy('Messages parents', 'Échangez avec les familles de vos classes.', MessageSquare),
    PARENT: personalCopy('Messages école', 'Conversations avec l’école et les enseignants.', MessageSquare),
    STUDENT: personalCopy('Mes messages', 'Annonces et échanges liés à votre scolarité.', MessageSquare)
  },
  settings: {
    SUPER_ADMIN: platformCopy('Paramètres plateforme', 'Sécurité, écoles et configuration globale.', Settings),
    SCHOOL_ADMIN: platformCopy('Paramètres école', 'Profil école, année scolaire, rôles et préférences.', Settings),
    TEACHER: personalCopy('Mon profil', 'Préférences et informations de votre compte enseignant.', Settings),
    PARENT: personalCopy('Mon profil parent', 'Préférences et informations de votre compte parent.', Settings),
    STUDENT: personalCopy('Mon profil', 'Préférences et informations de votre compte élève.', Settings)
  }
};

function platformCopy(title: string, description: string, icon: LucideIcon): WorkspaceCopy {
  return {
    eyebrow: 'Espace de gestion',
    title,
    description,
    primary: 'Vue administrative',
    secondary: 'Données contrôlées par rôle',
    actionPath: '/dashboard',
    icon,
    stats: [
      { label: 'Accès', value: 'Rôle', detail: 'Affichage selon permissions', icon: ShieldCheck, tone: 'blue' },
      { label: 'Source', value: 'API', detail: 'Données PostgreSQL via backend', icon: School, tone: 'orange' },
      { label: 'Sécurité', value: 'JWT', detail: 'Session utilisateur active', icon: User, tone: 'green' }
    ]
  };
}

function personalCopy(title: string, description: string, icon: LucideIcon): WorkspaceCopy {
  return {
    eyebrow: 'Espace personnel',
    title,
    description,
    primary: 'Voir mon tableau de bord',
    secondary: 'Page adaptée au profil connecté',
    actionPath: '/dashboard',
    icon,
    stats: [
      { label: 'Vue', value: 'Perso', detail: 'Pas de données administratives', icon, tone: 'blue' },
      { label: 'Accès', value: 'Limité', detail: 'Selon le rôle connecté', icon: ShieldCheck, tone: 'green' },
      { label: 'Source', value: 'API', detail: 'Même base PostgreSQL', icon: School, tone: 'orange' }
    ]
  };
}

function staffCopy(workspace: WorkspaceKey, role: UserRole): WorkspaceCopy {
  const labels: Record<WorkspaceKey, { title: string; icon: LucideIcon }> = {
    students: { title: 'Élèves', icon: GraduationCap },
    teachers: { title: 'Équipe pédagogique', icon: UserRoundCheck },
    parents: { title: 'Parents', icon: UsersRound },
    classes: { title: 'Classes', icon: BookOpen },
    attendance: { title: 'Présences', icon: CalendarCheck },
    grades: { title: 'Rapports', icon: ShieldCheck },
    payments: { title: 'Paiements', icon: CreditCard },
    messages: { title: 'Messages', icon: MessageSquare },
    settings: { title: 'Profil', icon: Settings }
  };
  const label = labels[workspace];
  return platformCopy(`${label.title} - ${staffRoleNames[role]}`, `Vue adaptée au rôle ${staffRoleNames[role].toLowerCase()} avec accès limité aux informations utiles.`, label.icon);
}

export const RoleWorkspacePage = ({ workspace }: { workspace: WorkspaceKey }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? 'STUDENT';
  const copy = copies[workspace][role] ?? staffCopy(workspace, role);
  const Icon = copy.icon;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_320px] xl:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">{copy.eyebrow}</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">{copy.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">{copy.description}</p>
            </div>
            <div className="rounded-lg border border-ocean/10 bg-sky p-5">
              <Icon className="text-ocean" size={26} />
              <p className="mt-4 text-sm font-bold text-ink">{user?.fullName}</p>
              <p className="mt-1 text-sm text-ink/55">{copy.secondary}</p>
              <button type="button" onClick={() => navigate(copy.actionPath)} className="mt-5 h-11 w-full rounded-md bg-ocean px-4 text-sm font-bold text-white transition hover:bg-ink">
                {copy.primary}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          {copy.stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="mt-5">
          <EmptyState icon={Icon} title={copy.title} description="Cette page est séparée par rôle. Les workflows détaillés seront branchés ici sans réutiliser les tableaux administratifs des autres profils." />
        </section>
      </div>
    </div>
  );
};

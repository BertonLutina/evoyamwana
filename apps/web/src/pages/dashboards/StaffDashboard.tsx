import type { UserRole } from '@evoyamwana/shared';
import { BookOpen, GraduationCap, MessageSquare } from 'lucide-react';
import WeekCalendar, { type CalendarEvent } from '../../components/WeekCalendar';
import { PersonalDashboardShell } from './PersonalDashboardShell';
import type { DashboardPageProps } from './types';

function staffWeekEvents(label: string): CalendarEvent[] {
  const d = new Date(); const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(d); date.setDate(d.getDate() + i);
    return { id: `staff-d${i}`, title: label, subtitle: 'Planning semaine', date, startMinutes: 8 * 60, endMinutes: 9 * 60, status: 'available' as const };
  });
}

interface StaffConfig {
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  primaryPath: string;
  secondaryLabel: string;
  secondaryPath: string;
  focus: Array<{ label: string; meta: string; path: string }>;
}

const configs: Record<Exclude<UserRole, 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT'>, StaffConfig> = {
  DIRECTOR: {
    eyebrow: 'Direction école',
    title: "Pilotez toute l'école avec une vue claire.",
    body: "Suivez les classes, les présences, les résultats et les communications sans mélanger votre espace avec celui des enseignants ou des élèves.",
    primaryLabel: 'Voir les classes',
    primaryPath: '/classes',
    secondaryLabel: 'Voir les rapports',
    secondaryPath: '/grades',
    focus: [
      { label: 'Suivre les classes', meta: 'Organisation et effectifs', path: '/classes' },
      { label: 'Analyser les présences', meta: 'Tendances et absences', path: '/attendance' },
      { label: 'Contrôler les résultats', meta: 'Notes et progression', path: '/grades' }
    ]
  },
  SECRETARY: {
    eyebrow: 'Secrétariat',
    title: 'Gérez les dossiers scolaires du quotidien.',
    body: 'Accédez rapidement aux élèves, parents, classes et messages administratifs de votre école.',
    primaryLabel: 'Dossiers élèves',
    primaryPath: '/students',
    secondaryLabel: 'Contacts parents',
    secondaryPath: '/parents',
    focus: [
      { label: 'Mettre à jour les élèves', meta: 'Inscriptions et dossiers', path: '/students' },
      { label: 'Gérer les parents', meta: 'Contacts responsables', path: '/parents' },
      { label: 'Consulter les classes', meta: 'Répartition administrative', path: '/classes' }
    ]
  },
  ACCOUNTANT: {
    eyebrow: 'Comptabilité',
    title: 'Gardez les paiements scolaires sous contrôle.',
    body: 'Suivez les soldes, familles, reçus et communications financières depuis un espace dédié.',
    primaryLabel: 'Ouvrir paiements',
    primaryPath: '/payments',
    secondaryLabel: 'Voir familles',
    secondaryPath: '/parents',
    focus: [
      { label: 'Suivre les paiements', meta: 'Soldes et échéances', path: '/payments' },
      { label: 'Identifier les familles', meta: 'Responsables financiers', path: '/parents' },
      { label: 'Envoyer un message', meta: 'Relances et reçus', path: '/messages' }
    ]
  },
  CLASS_TUTOR: {
    eyebrow: 'Titulaire',
    title: 'Accompagnez votre classe principale.',
    body: 'Votre espace titulaire relie présence, résultats, parents et suivi pédagogique de votre groupe.',
    primaryLabel: 'Ma classe',
    primaryPath: '/classes',
    secondaryLabel: "Faire l'appel",
    secondaryPath: '/attendance',
    focus: [
      { label: 'Ma classe', meta: 'Élèves et matières', path: '/classes' },
      { label: 'Présences', meta: 'Appel quotidien', path: '/attendance' },
      { label: 'Notes', meta: 'Progression du trimestre', path: '/grades' }
    ]
  },
  DISCIPLINE_OFFICER: {
    eyebrow: 'Discipline',
    title: 'Suivez la présence, le comportement et les alertes.',
    body: 'Un espace séparé pour surveiller les absences, retards, élèves à suivre et rapports disciplinaires.',
    primaryLabel: 'Voir présences',
    primaryPath: '/attendance',
    secondaryLabel: 'Rapports',
    secondaryPath: '/grades',
    focus: [
      { label: 'Présences', meta: 'Absences et retards', path: '/attendance' },
      { label: 'Élèves', meta: 'Suivi individuel', path: '/students' },
      { label: 'Messages', meta: 'Coordination école-famille', path: '/messages' }
    ]
  },
  LIBRARIAN: {
    eyebrow: 'Bibliothèque',
    title: 'Organisez les ressources et les élèves lecteurs.',
    body: "Préparez l'espace bibliothèque pour les emprunts, retours, lecteurs et messages liés aux ressources.",
    primaryLabel: 'Voir élèves',
    primaryPath: '/students',
    secondaryLabel: 'Messages',
    secondaryPath: '/messages',
    focus: [
      { label: 'Élèves', meta: 'Lecteurs et classes', path: '/students' },
      { label: 'Messages', meta: 'Rappels et annonces', path: '/messages' },
      { label: 'Profil', meta: 'Préférences bibliothèque', path: '/settings' }
    ]
  },
  NURSE: {
    eyebrow: 'Infirmerie',
    title: 'Suivez la santé scolaire avec prudence.',
    body: "Consultez les élèves, présences et communications utiles pour l'infirmerie sans accéder aux données inutiles.",
    primaryLabel: 'Voir élèves',
    primaryPath: '/students',
    secondaryLabel: 'Présences',
    secondaryPath: '/attendance',
    focus: [
      { label: 'Élèves', meta: 'Dossiers utiles', path: '/students' },
      { label: 'Présences', meta: 'Absences santé', path: '/attendance' },
      { label: 'Messages', meta: 'Coordination parents', path: '/messages' }
    ]
  },
  TRANSPORT_MANAGER: {
    eyebrow: 'Transport',
    title: 'Coordonnez les trajets scolaires.',
    body: 'Un espace transport pour suivre élèves, parents et communications autour des déplacements.',
    primaryLabel: 'Voir élèves',
    primaryPath: '/students',
    secondaryLabel: 'Voir parents',
    secondaryPath: '/parents',
    focus: [
      { label: 'Élèves transportés', meta: 'Groupes et classes', path: '/students' },
      { label: 'Parents', meta: "Contacts d'urgence", path: '/parents' },
      { label: 'Messages', meta: 'Alertes trajet', path: '/messages' }
    ]
  },
  CANTEEN_MANAGER: {
    eyebrow: 'Cantine',
    title: 'Gérez les repas et le suivi cantine.',
    body: 'Suivez les élèves, paiements liés et messages autour de la restauration scolaire.',
    primaryLabel: 'Voir élèves',
    primaryPath: '/students',
    secondaryLabel: 'Paiements',
    secondaryPath: '/payments',
    focus: [
      { label: 'Élèves', meta: 'Suivi des repas', path: '/students' },
      { label: 'Paiements', meta: 'Cantine et soldes', path: '/payments' },
      { label: 'Messages', meta: 'Informations familles', path: '/messages' }
    ]
  }
};

export const StaffDashboard = (props: DashboardPageProps) => {
  const role = props.user.role as keyof typeof configs;
  const config = configs[role] ?? configs.SECRETARY;

  return (
    <PersonalDashboardShell
      {...props}
      eyebrow={config.eyebrow}
      title={config.title}
      body={config.body}
      tone="from-[#08224f] via-[#075fc8] to-[#2f80ed]"
      badges={['Accès par rôle', 'Même API', 'Données école']}
      primaryAction={{ label: config.primaryLabel, meta: 'Action principale', path: config.primaryPath }}
      secondaryAction={{ label: config.secondaryLabel, meta: 'Action secondaire', path: config.secondaryPath }}
      cards={[
        { label: 'Élèves', value: ({ summary }) => summary.totals.students, icon: GraduationCap, tone: 'blue', detail: 'Dans votre école' },
        { label: 'Classes', value: ({ summary }) => summary.totals.classes, icon: BookOpen, tone: 'green', detail: 'Groupes actifs' },
        { label: 'Notifications', value: ({ summary }) => summary.totals.notifications, icon: MessageSquare, tone: 'orange', detail: 'À consulter' }
      ]}
      focus={config.focus}
      footer={
        <WeekCalendar
          events={staffWeekEvents(config.eyebrow)}
          onEventClick={() => props.navigate(config.primaryPath)}
        />
      }
    />
  );
};

import { BookOpen, CalendarCheck, MessageSquare } from 'lucide-react';
import WeekCalendar from '../../components/WeekCalendar';
import { PersonalDashboardShell } from './PersonalDashboardShell';
import type { DashboardPageProps } from './types';

export const StudentDashboard = (props: DashboardPageProps) => (
  <PersonalDashboardShell
    {...props}
    eyebrow="Espace élève"
    title="Vos cours, vos notes, votre progression."
    body="Un tableau de bord léger pour suivre vos cours, vos résultats, vos présences et les messages de l'école."
    tone="from-[#1d4ed8] to-[#007fff]"
    badges={['Cours', 'Notes', 'Progression']}
    primaryAction={{ label: 'Voir mes notes', path: '/grades', meta: '' }}
    secondaryAction={{ label: 'Voir mes cours', path: '/classes', meta: '' }}
    cards={[
      { label: 'Mes cours', value: ({ summary }) => summary.totals.classes, icon: BookOpen, tone: 'blue', detail: 'Classe et cours associés à votre profil' },
      { label: 'Ma présence', value: ({ summary }) => `${summary.attendance.rate}%`, icon: CalendarCheck, tone: 'green', detail: 'Votre historique de présence personnel' },
      { label: 'Messages', value: ({ summary }) => summary.totals.notifications, icon: MessageSquare, tone: 'orange', detail: 'Informations destinées à vous' }
    ]}
    focus={[
      { label: 'Consulter mes notes', meta: 'Points par cours et évolution annuelle', path: '/grades' },
      { label: 'Voir mes cours', meta: 'Classe, matières et enseignants', path: '/classes' },
      { label: 'Lire les messages', meta: 'Annonces et conversations école', path: '/messages' }
    ]}
    footer={
      <WeekCalendar
        events={props.planningEvents}
        onEventClick={() => props.navigate('/planning')}
      />
    }
  />
);

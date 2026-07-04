import { Bell, Building2, UserRoundCheck } from 'lucide-react';
import WeekCalendar from '../../components/WeekCalendar';
import { PersonalDashboardShell } from './PersonalDashboardShell';
import type { DashboardPageProps } from './types';

export const SuperAdminDashboard = (props: DashboardPageProps) => (
  <PersonalDashboardShell
    {...props}
    eyebrow="Pilotage plateforme"
    title="Supervision globale EVOYAMWANA."
    body="Une vue plateforme pour surveiller écoles, accès, adoption et alertes, séparée des espaces scolaires."
    tone="from-ink to-ocean"
    badges={['Plateforme', 'Sécurité', 'Multi-écoles']}
    primaryAction={{ label: 'Voir les écoles', path: '/classes', meta: '' }}
    secondaryAction={{ label: 'Rapports plateforme', path: '/grades', meta: '' }}
    cards={[
      { label: 'Écoles actives', value: ({ summary }) => summary.totals.classes, icon: Building2, tone: 'blue', detail: 'Structures suivies dans la plateforme' },
      { label: 'Utilisateurs', value: ({ summary }) => summary.totals.students + summary.totals.teachers, icon: UserRoundCheck, tone: 'orange', detail: 'Comptes liés aux écoles' },
      { label: 'Alertes', value: ({ summary }) => summary.totals.notifications, icon: Bell, tone: 'blue', detail: 'Notifications récentes' }
    ]}
    focus={[
      { label: 'Auditer les écoles', meta: 'Qualité des données et accès', path: '/classes' },
      { label: 'Suivre les admins', meta: 'Permissions et activité', path: '/teachers' },
      { label: 'Consulter les rapports', meta: 'Performance et adoption', path: '/grades' }
    ]}
    footer={
      <WeekCalendar
        events={props.planningEvents}
        onEventClick={() => props.navigate('/planning')}
      />
    }
  />
);

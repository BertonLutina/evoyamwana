import { Bell, Building2, UserRoundCheck } from 'lucide-react';
import WeekCalendar, { type CalendarEvent } from '../../components/WeekCalendar';
import { PersonalDashboardShell } from './PersonalDashboardShell';
import type { DashboardPageProps } from './types';

function superWeekEvents(): CalendarEvent[] {
  const d = new Date(); const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0, 0, 0, 0);
  const titles = ['Audit écoles', 'Revue admins', 'Support plateforme', 'Analyse adoption', 'Rapport hebdo'];
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(d); date.setDate(d.getDate() + i);
    return { id: `super-d${i}`, title: titles[i], subtitle: 'Super Admin', date, startMinutes: 8 * 60, endMinutes: 9 * 60, status: 'confirmed' as const };
  });
}

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
        events={superWeekEvents()}
        onEventClick={() => props.navigate('/classes')}
      />
    }
  />
);

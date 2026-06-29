import { Bell, CreditCard, GraduationCap } from 'lucide-react';
import WeekCalendar, { type CalendarEvent } from '../../components/WeekCalendar';
import { PersonalDashboardShell } from './PersonalDashboardShell';
import type { DashboardPageProps } from './types';

function parentWeekEvents(): CalendarEvent[] {
  const d = new Date(); const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0, 0, 0, 0);
  const titles = ['Journée scolaire', 'Journée scolaire', 'Journée scolaire', 'Journée scolaire', 'Journée scolaire'];
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(d); date.setDate(d.getDate() + i);
    return { id: `par-d${i}`, title: titles[i], subtitle: 'Présences enfants', date, startMinutes: 7 * 60 + 30, endMinutes: 12 * 60 + 30, status: 'confirmed' as const };
  });
}

export const ParentDashboard = (props: DashboardPageProps) => (
  <PersonalDashboardShell
    {...props}
    eyebrow="Espace parent"
    title="Suivez vos enfants sans écran administratif."
    body="Présences, notes, paiements et messages importants sont rassemblés autour de vos enfants uniquement."
    tone="from-[#0f766e] to-ocean"
    badges={['Enfants', 'Paiements', 'Messages']}
    primaryAction={{ label: 'Voir mes enfants', path: '/students', meta: '' }}
    secondaryAction={{ label: 'Messages école', path: '/messages', meta: '' }}
    cards={[
      { label: 'Enfants liés', value: ({ summary }) => summary.totals.students, icon: GraduationCap, tone: 'blue', detail: 'Profils élèves rattachés à votre compte' },
      { label: 'Paiements ouverts', value: ({ summary }) => summary.totals.pendingPayments, icon: CreditCard, tone: 'orange', detail: 'Soldes concernant vos enfants' },
      { label: 'Notifications', value: ({ summary }) => summary.totals.notifications, icon: Bell, tone: 'blue', detail: "Messages récents de l'école" }
    ]}
    focus={[
      { label: 'Consulter les notes', meta: 'Résultats par enfant, cours et trimestre', path: '/grades' },
      { label: 'Vérifier les présences', meta: 'Historique de présence de vos enfants', path: '/attendance' },
      { label: 'Suivre les paiements', meta: 'Factures, avances et reçus', path: '/payments' }
    ]}
    footer={
      <WeekCalendar
        events={parentWeekEvents()}
        onEventClick={() => props.navigate('/attendance')}
      />
    }
  />
);

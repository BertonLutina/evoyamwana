import { Bell, CreditCard, GraduationCap } from 'lucide-react';
import WeekCalendar from '../../components/WeekCalendar';
import { PersonalDashboardShell } from './PersonalDashboardShell';
import type { DashboardPageProps } from './types';

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
        events={props.planningEvents}
        onEventClick={() => props.navigate('/planning')}
      />
    }
  />
);

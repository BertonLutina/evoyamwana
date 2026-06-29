import { AlertTriangle, Banknote, Bell, Building2, CalendarCheck, GraduationCap, Handshake, HeartPulse, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { PremiumLineChart } from '../../components/PremiumChart';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import WeekCalendar, { type CalendarEvent } from '../../components/WeekCalendar';
import { schoolHealthService, type SchoolHealthProgressionDto, type SchoolHealthSummaryDto } from '../../services/schoolHealth.service';
import type { DashboardPageProps } from './types';

function dirMonday(): Date {
  const d = new Date(); const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0, 0, 0, 0); return d;
}
function dirAddDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

type DirectorSignal = {
  label: string;
  value: string;
  detail: string;
  tone: 'blue' | 'green' | 'orange';
  icon: LucideIcon;
};

const emptySchoolHealthSummary: SchoolHealthSummaryDto = {
  score: null,
  totals: { records: 0, open: 0, critical: 0, resolved: 0 },
  byCategory: [],
  byStatus: [],
  bySeverity: []
};

const emptyHealthProgression: SchoolHealthProgressionDto = {
  schoolYear: '',
  labels: [],
  values: [],
  points: []
};

const statusLabels: Record<string, string> = {
  OPEN: 'Ouvert',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
  ARCHIVED: 'Archivé'
};

const priorityLabels: Record<string, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  CRITICAL: 'Critique'
};

const statusStyles: Record<string, string> = {
  OPEN: 'bg-blue-50 text-ocean',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  RESOLVED: 'bg-emerald-50 text-emerald-700',
  ARCHIVED: 'bg-slate-100 text-slate-600'
};

const priorityStyles: Record<string, string> = {
  LOW: 'bg-sky text-ocean',
  MEDIUM: 'bg-amber-50 text-amber-700',
  HIGH: 'bg-orange-50 text-orange-700',
  CRITICAL: 'bg-red-50 text-clay'
};

const formatDueDate = (value?: string | null) => {
  if (!value) return 'Sans échéance';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

export const DirectorDashboard = ({ summary, isLoading, error, navigate, user }: DashboardPageProps) => {
  const [schoolHealthSummary, setSchoolHealthSummary] = useState(emptySchoolHealthSummary);
  const [healthProgression, setHealthProgression] = useState<SchoolHealthProgressionDto>(emptyHealthProgression);
  const [isHealthLoading, setIsHealthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([schoolHealthService.summary(), schoolHealthService.progression()])
      .then(([nextSummary, nextProgression]) => {
        if (!isMounted) return;
        setSchoolHealthSummary(nextSummary);
        setHealthProgression(nextProgression);
      })
      .catch(() => {
        if (!isMounted) return;
        setSchoolHealthSummary(emptySchoolHealthSummary);
        setHealthProgression(emptyHealthProgression);
      })
      .finally(() => {
        if (isMounted) setIsHealthLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const mon = dirMonday();
    const labels = ['Revue présences', 'Suivi pédagogique', 'Réunion staff', 'Analyse résultats', 'Bilan semaine'];
    return Array.from({ length: 5 }, (_, i) => ({
      id: `dir-d${i}`,
      title: labels[i],
      subtitle: 'Direction',
      date: dirAddDays(mon, i),
      startMinutes: 8 * 60,
      endMinutes: 9 * 60,
      status: i === 2 ? 'in_review' : 'confirmed',
    }));
  }, []);

  const healthLabel = schoolHealthSummary.score === null ? 'Non évalué' : `${schoolHealthSummary.score}%`;
  const hasHealthProgression = healthProgression.values.some((value) => value !== null);
  const collaboratorDossiers = summary.collaboratorDossiers ?? [];
  const paymentPressure = summary.totals.students ? Math.round((summary.totals.pendingPayments / summary.totals.students) * 100) : 0;

  const signals: DirectorSignal[] = [
    {
      label: 'Santé école',
      value: healthLabel,
      detail: schoolHealthSummary.totals.records ? `${schoolHealthSummary.totals.open} dossiers ouverts` : 'Aucun dossier santé',
      icon: HeartPulse,
      tone: schoolHealthSummary.score !== null && schoolHealthSummary.score >= 75 ? 'green' : 'orange'
    },
    {
      label: 'Paiements ouverts',
      value: isLoading ? '...' : String(summary.totals.pendingPayments),
      detail: `${paymentPressure}% de l'effectif actif`,
      icon: Banknote,
      tone: summary.totals.pendingPayments ? 'orange' : 'green'
    },
    {
      label: 'Présences marquées',
      value: isLoading ? '...' : String(summary.totals.attendanceToday),
      detail: `${summary.attendance.rate}% présents parmi les présences saisies`,
      icon: CalendarCheck,
      tone: summary.attendance.rate >= 75 ? 'green' : 'orange'
    },
    {
      label: 'Notifications',
      value: isLoading ? '...' : String(summary.totals.notifications),
      detail: 'Notifications non lues',
      icon: Bell,
      tone: summary.totals.notifications ? 'orange' : 'blue'
    }
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-[#071b3a] text-white shadow-[0_24px_70px_rgba(7,27,58,0.18)]">
          <div className="relative grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#2f80ed_0%,#2f80ed_55%,#f6d743_55%,#f6d743_78%,#c62828_78%,#c62828_100%)]" />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-maize">Direction</p>
              <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
                Tableau de bord basé sur les données enregistrées.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
                Bonjour {user.fullName}. Cette vue affiche uniquement les élèves, classes, présences, paiements, notifications et dossiers réellement présents dans la base.
              </p>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white/70">Santé école</p>
                  <p className="mt-2 font-display text-5xl font-bold">{isHealthLoading ? '...' : healthLabel}</p>
                </div>
                <span className="grid h-14 w-14 place-items-center rounded-lg bg-white text-ocean">
                  <HeartPulse size={27} />
                </span>
              </div>
              <div className="mt-6 grid gap-3 text-sm font-bold text-white/75">
                <div className="flex justify-between">
                  <span>Dossiers santé</span>
                  <span>{schoolHealthSummary.totals.records}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ouverts / en cours</span>
                  <span>{schoolHealthSummary.totals.open}</span>
                </div>
                <div className="flex justify-between">
                  <span>Critiques</span>
                  <span>{schoolHealthSummary.totals.critical}</span>
                </div>
                <div className="h-2 rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-maize" style={{ width: `${schoolHealthSummary.score ?? 0}%` }} />
                </div>
                {!schoolHealthSummary.totals.records && !isHealthLoading ? <p className="text-xs text-white/55">Créez un dossier santé pour calculer cet indice.</p> : null}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Progression santé</p>
              <h3 className="mt-1 text-2xl font-bold text-ink">Évolution de la santé de l'école</h3>
            </div>
            <span className="w-fit rounded-md bg-sky px-3 py-2 text-sm font-black text-ocean">Année scolaire {healthProgression.schoolYear || '...'}</span>
          </div>
          <div className="mt-5">
            {isHealthLoading ? (
              <div className="h-72 animate-pulse rounded-lg bg-sky" />
            ) : hasHealthProgression ? (
              <PremiumLineChart labels={healthProgression.labels} values={healthProgression.values} label="Indice santé école" color="#0f7cff" fillColor="rgba(15, 124, 255, 0.14)" />
            ) : (
              <EmptyState icon={HeartPulse} title="Aucune progression calculable" description="La courbe apparaîtra dès qu'un dossier santé sera enregistré dans l'année scolaire." />
            )}
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {signals.map((signal) => (
            <StatCard key={signal.label} label={signal.label} value={signal.label === 'Santé école' && isHealthLoading ? '...' : signal.value} icon={signal.icon} tone={signal.tone} detail={signal.detail} />
          ))}
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Élèves" value={isLoading ? '...' : summary.totals.students.toLocaleString()} icon={GraduationCap} tone="blue" detail="Effectif actif" />
          <StatCard label="Enseignants" value={isLoading ? '...' : summary.totals.teachers.toLocaleString()} icon={UsersRound} tone="orange" detail="Comptes enseignants" />
          <StatCard label="Classes" value={isLoading ? '...' : summary.totals.classes.toLocaleString()} icon={Building2} tone="blue" detail="Classes enregistrées" />
          <StatCard label="Taux de présence" value={isLoading ? '...' : `${summary.attendance.rate}%`} icon={CalendarCheck} tone={summary.attendance.rate >= 75 ? 'green' : 'orange'} detail={`${summary.attendance.PRESENT} présents sur ${summary.attendance.total} présences`} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-2">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Finances</p>
                <h3 className="mt-1 text-2xl font-bold text-ink">Paiements ouverts</h3>
              </div>
              <button type="button" onClick={() => navigate('/payments')} className="h-10 rounded-md bg-ocean px-4 text-sm font-bold text-white transition hover:bg-ink">
                Voir paiements
              </button>
            </div>
            <div className="mt-5">
              <ResponsiveTable
                data={summary.pendingPayments}
                getRowKey={(payment) => payment.id}
                columns={[
                  {
                    key: 'student',
                    header: 'Élève',
                    render: (payment) => payment.student ? `${payment.student.firstName} ${payment.student.lastName} · ${payment.student.studentCode}` : 'Élève non lié'
                  },
                  { key: 'amount', header: 'Montant', render: (payment) => payment.amount },
                  { key: 'paid', header: 'Payé', render: (payment) => payment.amountPaid },
                  { key: 'status', header: 'Statut', render: (payment) => payment.status }
                ]}
                emptyState={<EmptyState icon={Banknote} title="Aucun paiement ouvert" description="Les paiements en attente, partiels ou en retard apparaîtront ici." />}
              />
            </div>
          </article>

          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Communication</p>
                <h3 className="mt-1 text-2xl font-bold text-ink">Dossiers collaborateurs</h3>
              </div>
              <Handshake size={24} className="text-ocean" />
            </div>
            <div className="mt-5 space-y-3">
              {collaboratorDossiers.length ? (
                collaboratorDossiers.map((dossier) => (
                  <article key={dossier.id} className="rounded-lg border border-ocean/10 bg-sky/55 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold text-ink">{dossier.title}</p>
                        <p className="mt-1 text-sm leading-6 text-ink/58">Collaborateur: {dossier.owner || 'Non assigné'}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-black ${statusStyles[dossier.status] ?? 'bg-sky text-ocean'}`}>{statusLabels[dossier.status] ?? dossier.status}</span>
                        <span className={`rounded-md px-2.5 py-1 text-xs font-black ${priorityStyles[dossier.priority] ?? 'bg-sky text-ocean'}`}>{priorityLabels[dossier.priority] ?? dossier.priority}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-ocean">Échéance: {formatDueDate(dossier.dueDate)}</p>
                  </article>
                ))
              ) : (
                <EmptyState icon={Handshake} title="Aucun dossier collaborateur" description="Les dossiers du secteur Collaborateurs apparaîtront ici avec leur statut." />
              )}
            </div>
          </article>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-3">
          <DirectorAction title="Secteurs & dossiers" body="Ouvrir les dossiers sectoriels enregistrés." icon={Building2} onClick={() => navigate('/sectors')} />
          <DirectorAction title="Santé de l'école" body="Créer ou suivre les dossiers santé réels." icon={HeartPulse} onClick={() => navigate('/school-health')} />
          <DirectorAction title="Présences & discipline" body="Consulter les présences enregistrées." icon={AlertTriangle} onClick={() => navigate('/attendance')} />
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Planning direction</p>
              <h3 className="mt-1 text-xl font-bold text-ink">Calendrier de la semaine</h3>
            </div>
          </div>
          <WeekCalendar
            events={calendarEvents}
            onEventClick={() => navigate('/attendance')}
          />
        </section>
      </div>
    </div>
  );
};

const DirectorAction = ({ title, body, icon: Icon, onClick }: { title: string; body: string; icon: LucideIcon; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="rounded-lg border border-ocean/10 bg-white p-5 text-left shadow-panel transition hover:-translate-y-0.5 hover:border-ocean/30 hover:shadow-[0_22px_50px_rgba(47,128,237,0.12)]">
    <span className="grid h-11 w-11 place-items-center rounded-md bg-sky text-ocean">
      <Icon size={21} />
    </span>
    <h3 className="mt-5 text-xl font-bold text-ink">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-ink/58">{body}</p>
    <p className="mt-4 text-sm font-black text-ocean">Ouvrir -&gt;</p>
  </button>
);

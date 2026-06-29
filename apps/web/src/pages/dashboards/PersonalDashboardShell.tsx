import type { LucideIcon } from 'lucide-react';
import { Bell, CalendarCheck, ClipboardList, FileText, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { StatCard } from '../../components/StatCard';
import type { DashboardPageProps } from './types';

interface RoleCard {
  label: string;
  value: (props: DashboardPageProps) => string | number;
  icon: LucideIcon;
  tone: 'blue' | 'orange' | 'green' | 'gold' | 'clay';
  detail: string;
}

interface RoleFocus {
  label: string;
  meta: string;
  path: string;
}

interface PersonalDashboardShellProps extends DashboardPageProps {
  eyebrow: string;
  title: string;
  body: string;
  tone: string;
  badges: string[];
  primaryAction: RoleFocus;
  secondaryAction: RoleFocus;
  cards: RoleCard[];
  focus: RoleFocus[];
  footer?: ReactNode;
}

export const PersonalDashboardShell = ({
  user,
  summary,
  isLoading,
  error,
  navigate,
  eyebrow,
  title,
  body,
  tone,
  badges,
  primaryAction,
  secondaryAction,
  cards,
  focus,
  footer
}: PersonalDashboardShellProps) => {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className={`overflow-hidden rounded-lg bg-gradient-to-br ${tone} text-white shadow-[0_24px_70px_rgba(7,27,58,0.18)]`}>
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_340px] xl:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-maize">{eyebrow}</p>
              <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">{title}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{body}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-xs font-bold text-white">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <article className="rounded-lg border border-white/15 bg-white/12 p-5 backdrop-blur">
              <p className="text-sm text-white/70">Connecté comme</p>
              <h3 className="mt-2 text-2xl font-bold">{user.fullName}</h3>
              <div className="mt-5 grid gap-3">
                <button type="button" onClick={() => navigate(primaryAction.path)} className="rounded-md bg-white px-4 py-3 text-sm font-bold text-ocean transition hover:bg-maize">
                  {primaryAction.label}
                </button>
                <button type="button" onClick={() => navigate(secondaryAction.path)} className="rounded-md border border-white/20 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                  {secondaryAction.label}
                </button>
              </div>
            </article>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-orange-50 px-3 py-2 text-sm font-semibold text-ember">{error}</p> : null}

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <StatCard key={card.label} label={card.label} value={isLoading ? '...' : String(card.value({ user, summary, isLoading, error, navigate }))} icon={card.icon} tone={card.tone} detail={card.detail} />
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Navigation adaptée</p>
                <h3 className="mt-1 text-xl font-bold">Vos priorités</h3>
              </div>
              <ClipboardList className="text-ember" size={22} />
            </div>
            <div className="mt-5 grid gap-3">
              {focus.map((item) => (
                <button key={item.label} type="button" onClick={() => navigate(item.path)} className="flex items-center justify-between rounded-lg border border-ocean/10 bg-sky/60 p-4 text-left transition hover:border-ocean/30 hover:bg-white">
                  <div>
                    <p className="font-bold text-ink">{item.label}</p>
                    <p className="mt-1 text-sm text-ink/55">{item.meta}</p>
                  </div>
                  <span className="text-sm font-black text-ocean">-&gt;</span>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Aujourd’hui</p>
                <h3 className="mt-1 text-xl font-bold">Résumé personnel</h3>
              </div>
              <FileText className="text-ocean" size={22} />
            </div>
            <div className="mt-5 grid gap-3">
              <MiniMetric icon={CalendarCheck} label="Présences" value={String(summary.attendance.PRESENT)} />
              <MiniMetric icon={TrendingUp} label="Taux de présence" value={`${summary.attendance.rate}%`} />
              <MiniMetric icon={Bell} label="Notifications" value={String(summary.totals.notifications)} />
            </div>
          </article>
        </section>

        {footer ? <section className="mt-5">{footer}</section> : null}
      </div>
    </div>
  );
};

const MiniMetric = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-lg border border-ocean/10 bg-white p-4">
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-sky text-ocean">
        <Icon size={19} />
      </span>
      <span className="font-semibold text-ink">{label}</span>
    </div>
    <span className="font-display text-2xl font-bold text-ink">{value}</span>
  </div>
);

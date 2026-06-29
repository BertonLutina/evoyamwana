import { BarChart3, BookOpen, Building2, CalendarCheck, MessageSquare, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { StatCard } from '../../components/StatCard';
import { platformService, type PlatformReportDto } from '../../services/platform.service';
import { SuperAdminShell } from './SuperAdminShell';

export const SuperAdminReportsPage = () => {
  const [report, setReport] = useState<PlatformReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    platformService.reports()
      .then((data) => {
        if (isMounted) setReport(data);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les rapports.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const totals = report?.totals;

  return (
    <SuperAdminShell eyebrow="Analytics" title="Rapports" description="Vue consolidée des écoles, utilisateurs, présences, notes et messages." icon={BarChart3}>
      {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}
      <section className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Écoles" value={isLoading ? '...' : String(totals?.schools ?? 0)} icon={Building2} tone="blue" detail="Actives" />
        <StatCard label="Utilisateurs" value={isLoading ? '...' : String(totals?.users ?? 0)} icon={UsersRound} tone="orange" detail="Tous rôles" />
        <StatCard label="Classes" value={isLoading ? '...' : String(totals?.classes ?? 0)} icon={BookOpen} tone="green" detail="Configurées" />
        <StatCard label="Présences" value={isLoading ? '...' : String(totals?.attendance ?? 0)} icon={CalendarCheck} tone="blue" detail="Registres" />
        <StatCard label="Notes" value={isLoading ? '...' : String(totals?.grades ?? 0)} icon={BarChart3} tone="gold" detail="Évaluations" />
        <StatCard label="Messages" value={isLoading ? '...' : String(totals?.messages ?? 0)} icon={MessageSquare} tone="clay" detail="Échanges" />
      </section>
      <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Répartition des rôles</p>
        <div className="mt-5 grid gap-3">
          {isLoading ? <LoadingRows rows={5} /> : report?.roleBreakdown.length ? report.roleBreakdown.map((item) => (
            <div key={item.role} className="flex items-center justify-between rounded-lg border border-ocean/10 bg-sky/55 p-4">
              <span className="font-bold text-ink">{item.role}</span>
              <span className="font-display text-2xl font-bold text-ocean">{item._count.role}</span>
            </div>
          )) : <EmptyState icon={BarChart3} title="Aucun rapport" description="Les indicateurs apparaîtront ici." />}
        </div>
      </section>
    </SuperAdminShell>
  );
};

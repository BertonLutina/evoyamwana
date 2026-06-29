import { Lock, Settings, ShieldCheck } from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { SuperAdminShell } from './SuperAdminShell';

export const SuperAdminSettingsPage = () => (
  <SuperAdminShell eyebrow="Configuration" title="Paramètres" description="Paramètres globaux de sécurité, accès et gouvernance plateforme." icon={Settings}>
    <section className="mt-5 grid gap-4 md:grid-cols-3">
      <StatCard label="Sécurité" value="JWT" icon={Lock} tone="blue" detail="Authentification active" />
      <StatCard label="Rôles" value="5" icon={ShieldCheck} tone="green" detail="Accès séparés" />
      <StatCard label="Mode" value="SaaS" icon={Settings} tone="orange" detail="Multi-écoles" />
    </section>
    <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Préférences plateforme</p>
      <div className="mt-5 grid gap-3">
        {['Isolation des écoles', 'Accès super admin', 'Audit des rapports', 'Synchronisation API'].map((item) => (
          <div key={item} className="flex items-center justify-between rounded-lg border border-ocean/10 bg-sky/55 p-4">
            <span className="font-bold text-ink">{item}</span>
            <span className="rounded-full bg-canopy/10 px-3 py-1 text-xs font-bold text-canopy">Actif</span>
          </div>
        ))}
      </div>
    </section>
  </SuperAdminShell>
);

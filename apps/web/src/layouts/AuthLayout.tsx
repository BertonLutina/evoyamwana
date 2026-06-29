import { Outlet, useLocation } from 'react-router-dom';
import { LanguageSelect } from '../components/LanguageSelect';
import { useLocale } from '../contexts/LocaleContext';

export const AuthLayout = () => {
  const { t } = useLocale();
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register-school';

  return (
    <main className="min-h-screen overflow-hidden bg-paper text-ink">
      <div className={`grid min-h-screen ${isRegisterPage ? 'lg:grid-cols-[minmax(360px,0.46fr)_minmax(0,1.54fr)]' : 'lg:grid-cols-[minmax(500px,0.94fr)_1.06fr]'}`}>
        <section className={`brand-auth-panel premium-school-panel relative hidden overflow-hidden py-10 text-white lg:flex lg:flex-col ${isRegisterPage ? 'px-9 xl:px-11' : 'px-12 xl:px-16'}`}>
          <div className="absolute inset-x-16 top-[7.9rem] h-px bg-white/14" />
          <div className="school-register-lines absolute inset-x-16 top-[12rem] h-[34rem] opacity-[0.13]" />
          <div className="rdc-ribbon rdc-ribbon-blue" />
          <div className="rdc-ribbon rdc-ribbon-red" />
          <div className="rdc-ribbon rdc-ribbon-gold" />
          <div className="absolute left-14 top-20 h-56 w-56 rounded-full border border-white/10 bg-white/[0.035] blur-[1px]" />
          <div className="absolute -bottom-24 left-0 h-72 w-full bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.14),transparent_55%)]" />

          <div className={`relative flex items-center ${isRegisterPage ? 'gap-4' : 'gap-6'}`}>
            <span className={`brand-seal grid place-items-center overflow-hidden rounded-[1.05rem] bg-white p-2 shadow-[0_24px_80px_rgba(0,30,94,0.28)] ring-1 ring-white/50 ${isRegisterPage ? 'h-16 w-16' : 'h-[5.7rem] w-[5.7rem]'}`}>
              <img className="h-full w-full rounded-xl object-cover" src="/brand/evoyamwana-logo.png" alt="EVOYAMWANA logo" />
            </span>
            <div>
              <span className={`font-display font-bold leading-none text-white drop-shadow-[0_10px_30px_rgba(0,31,92,0.28)] ${isRegisterPage ? 'text-[2rem]' : 'text-[2.9rem]'}`}>EVOYAMWANA</span>
              <p className={`mt-3 font-black uppercase text-maize ${isRegisterPage ? 'text-[0.68rem] tracking-[0.24em]' : 'text-[0.78rem] tracking-[0.34em]'}`}>Plateforme scolaire africaine</p>
            </div>
          </div>

          <div className="relative flex flex-1 items-center">
            {isRegisterPage ? (
              <div className="max-w-[360px]">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/[0.08] px-3 py-1.5 text-[0.66rem] font-black uppercase tracking-[0.18em] text-white/78 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-maize shadow-[0_0_16px_rgba(247,214,24,0.75)]" />
                  Création d’école
                </div>
                <p className="font-display text-[2.45rem] font-bold leading-[1.02] text-white drop-shadow-[0_18px_40px_rgba(0,42,120,0.25)]">
                  Un espace clair pour votre établissement.
                </p>
                <p className="mt-5 text-sm leading-7 text-white/76">
                  Préparez les informations administratives, créez le compte responsable et démarrez le pilotage scolaire.
                </p>
                <div className="mt-8 space-y-3 text-sm font-bold text-white/84">
                  <div className="rounded-lg border border-white/14 bg-white/[0.08] px-4 py-3">Pays africains validés</div>
                  <div className="rounded-lg border border-maize/40 bg-maize/[0.10] px-4 py-3">Documents essentiels listés</div>
                  <div className="rounded-lg border border-white/14 bg-white/[0.08] px-4 py-3">Compte admin créé automatiquement</div>
                </div>
              </div>
            ) : (
              <div className="max-w-[650px]">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/[0.08] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.22em] text-white/78 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-maize shadow-[0_0_16px_rgba(247,214,24,0.75)]" />
                  Excellence scolaire connectée
                </div>
                <p className="max-w-[600px] font-display text-[3.55rem] font-bold leading-[0.98] text-white drop-shadow-[0_18px_40px_rgba(0,42,120,0.25)] xl:text-[4.3rem]">
                  {t('dashboard.heroTitle')}
                </p>
                <p className="mt-7 max-w-[570px] text-[1.06rem] leading-8 text-white/76">
                  {t('dashboard.heroBody')}
                </p>
                <div className="mt-10 grid max-w-[610px] grid-cols-3 gap-3 text-sm text-white/82">
                  <span className="premium-proof border border-white/14 bg-white/[0.08]">Multi-écoles</span>
                  <span className="premium-proof border border-maize/45 bg-maize/[0.10]">Sécurisé</span>
                  <span className="premium-proof border border-ember/35 bg-ember/[0.10]">Mobile d’abord</span>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <LanguageSelect className="h-11 w-[250px] rounded-lg border-white/24 bg-white/92 shadow-[0_22px_70px_rgba(0,28,88,0.22)] backdrop-blur" />
          </div>
        </section>

        <section className="brand-bg-shell relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[linear-gradient(122deg,rgba(247,214,24,0.11),transparent_34%),linear-gradient(315deg,rgba(0,127,255,0.08),transparent_44%)]" />
          <div className={`relative w-full ${isRegisterPage ? 'max-w-5xl' : 'max-w-lg'}`}>
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-lg bg-white p-1 shadow-soft">
                  <img className="h-full w-full rounded-md object-cover" src="/brand/evoyamwana-logo.png" alt="EVOYAMWANA logo" />
                </span>
                <div>
                  <p className="font-display text-2xl font-bold">EVOYAMWANA</p>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Plateforme scolaire africaine</p>
                </div>
              </div>
            </div>
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
};

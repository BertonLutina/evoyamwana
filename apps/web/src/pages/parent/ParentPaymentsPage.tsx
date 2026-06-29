import type { PaymentDto, PaymentStatus } from '@evoyamwana/shared';
import { Banknote, CalendarClock, CreditCard, History, Landmark, Loader2, Phone, ReceiptText, ShieldCheck, Smartphone, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { StatCard } from '../../components/StatCard';
import { paymentsService } from '../../services/payments.service';
import { buildParentPaymentSummary, formatCongoleseFranc, getPaymentProvider, type ChildPaymentSummary, type PaymentBucket, type PaymentProviderKey } from './parentPayments.utils';

const statusCopy: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: 'En attente', className: 'bg-maize/25 text-earth' },
  PARTIAL: { label: 'Partiel', className: 'bg-ocean/10 text-ocean' },
  PAID: { label: 'Payé', className: 'bg-canopy/10 text-canopy' },
  OVERDUE: { label: 'En retard', className: 'bg-clay/10 text-clay' },
  CANCELLED: { label: 'Annulé', className: 'bg-ink/8 text-ink/55' }
};

const providerIcons: Record<PaymentProviderKey, typeof CreditCard> = {
  MULTIPAY_CARD: CreditCard,
  MPESA: Smartphone,
  ORANGE_MONEY: Smartphone,
  AIRTEL_MONEY: Smartphone,
  ILLICOCASH: WalletCards,
  BANK_TRANSFER: Landmark,
  CASH_ON_SITE: Banknote,
  OTHER: WalletCards
};

const onlineChannels = [
  { label: 'Multipay / carte', detail: 'Carte bancaire, TPE ou passerelle bancaire', icon: CreditCard },
  { label: 'M-Pesa', detail: 'Mobile money Vodacom RDC', icon: Smartphone },
  { label: 'Orange Money', detail: 'Paiement mobile Orange', icon: Smartphone },
  { label: 'Airtel Money', detail: 'Paiement mobile Airtel', icon: Smartphone },
  { label: 'IllicoCash', detail: 'Portefeuille digital bancaire local', icon: WalletCards }
];

const onSiteChannels = [
  { label: 'Cash à l’école', detail: 'Le reçu manuel reste enregistré', icon: Banknote },
  { label: 'TPE / carte', detail: 'Paiement sur terminal bancaire', icon: CreditCard },
  { label: 'Virement', detail: 'Référence bancaire et reçu', icon: Landmark }
];

const formatDate = (value: string | null | undefined) => (value ? new Date(value).toLocaleDateString('fr-FR') : 'Non planifié');

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Impossible de charger les paiements.');

export const ParentPaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState('Multipay / carte');

  useEffect(() => {
    let mounted = true;

    const loadPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await paymentsService.list({ page: 1, pageSize: 100 });
        if (mounted) setPayments(result.payments);
      } catch (loadError) {
        if (mounted) setError(getErrorMessage(loadError));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadPayments();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => buildParentPaymentSummary(payments), [payments]);
  const visibleChildren = selectedStudentId === 'all' ? summary.children : summary.children.filter((child) => child.studentId === selectedStudentId);
  const firstOpenPayment = visibleChildren.flatMap((child) => child.history).find((payment) => payment.status === 'PENDING' || payment.status === 'PARTIAL' || payment.status === 'OVERDUE');

  return (
    <section className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="premium-card overflow-hidden p-0">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_360px] md:p-8">
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-ember">Paiements famille</p>
            <h1 className="mt-3 font-display text-4xl font-black text-ink md:text-5xl">Mes paiements</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-ink/62">
              Suivi complet des frais trimestriels et annuels de chaque enfant, avec paiements en ligne, paiements sur place, reçus et historique.
            </p>
          </div>
          <div className="rounded-lg border border-ocean/15 bg-sky/70 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-ocean shadow-sm">
              <ShieldCheck size={22} />
            </span>
            <p className="mt-4 text-sm font-black text-ink">Canaux Congo prêts</p>
            <p className="mt-2 text-sm leading-6 text-ink/60">Multipay/carte, M-Pesa, Orange Money, Airtel Money, IllicoCash, virement et paiement sur place.</p>
          </div>
        </div>
      </div>

      {error ? <p className="rounded-lg bg-clay/10 px-4 py-3 text-sm font-bold text-clay">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Montant annuel/trimestriel" value={isLoading ? '...' : formatCongoleseFranc(summary.totalExpected)} icon={WalletCards} tone="blue" detail="Tous les enfants" />
        <StatCard label="Déjà payé" value={isLoading ? '...' : formatCongoleseFranc(summary.totalPaid)} icon={ReceiptText} tone="green" detail={`${formatCongoleseFranc(summary.onlinePaid)} en ligne`} />
        <StatCard label="Reste à payer" value={isLoading ? '...' : formatCongoleseFranc(summary.totalBalance)} icon={CalendarClock} tone="orange" detail={`${summary.openCount} paiement(s) ouvert(s)`} />
        <StatCard label="Payé sur place" value={isLoading ? '...' : formatCongoleseFranc(summary.onSitePaid)} icon={Banknote} tone="clay" detail="Cash, TPE ou reçu manuel" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <aside className="space-y-5 xl:order-2">
          <div className="premium-card p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-ocean/10 text-ocean">
                <CreditCard size={21} />
              </span>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-ocean">Paiement en ligne</p>
                <h2 className="text-xl font-black text-ink">Préparer un paiement</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <select className="h-11 w-full rounded-lg border border-ocean/15 bg-white px-3 text-sm font-bold text-ink outline-none" value={selectedChannel} onChange={(event) => setSelectedChannel(event.target.value)}>
                {onlineChannels.map((channel) => <option key={channel.label} value={channel.label}>{channel.label}</option>)}
              </select>
              <div className="rounded-lg border border-dashed border-ocean/25 bg-sky/60 p-4">
                <p className="text-sm font-black text-ink">{firstOpenPayment ? formatCongoleseFranc(Number(firstOpenPayment.amount) - Number(firstOpenPayment.amountPaid)) : 'Aucun solde ouvert'}</p>
                <p className="mt-1 text-xs font-semibold text-ink/55">{firstOpenPayment ? `Échéance: ${formatDate(firstOpenPayment.dueDate)}` : 'L’école doit créer une échéance avant paiement.'}</p>
              </div>
              <button
                type="button"
                disabled={!firstOpenPayment}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-black text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:bg-ink/30"
              >
                {isLoading ? <Loader2 className="animate-spin" size={17} /> : <Phone size={17} />}
                Payer avec {selectedChannel}
              </button>
              <p className="text-xs leading-5 text-ink/55">
                Le bouton est prêt côté interface. La connexion réelle demandera les accès marchand/API du provider choisi.
              </p>
            </div>
          </div>

          <PaymentChannelList title="En ligne" channels={onlineChannels} />
          <PaymentChannelList title="Sur place" channels={onSiteChannels} />
        </aside>

        <div className="space-y-5">
          <div className="premium-card grid gap-3 p-4 md:grid-cols-[1fr_260px]">
            <div>
              <p className="text-sm font-black text-ink">Filtrer par enfant</p>
              <p className="mt-1 text-sm text-ink/55">Chaque historique reste séparé pour éviter les confusions entre enfants.</p>
            </div>
            <select className="h-11 rounded-lg border border-ocean/15 bg-white px-3 text-sm font-bold text-ink outline-none" value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
              <option value="all">Tous les enfants</option>
              {summary.children.map((child) => <option key={child.studentId} value={child.studentId}>{child.studentName}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="premium-card p-5">
              <LoadingRows rows={6} />
            </div>
          ) : visibleChildren.length ? (
            visibleChildren.map((child) => <ChildPaymentPanel key={child.studentId} child={child} />)
          ) : (
            <EmptyState icon={ReceiptText} title="Aucun paiement enregistré" description="Les frais scolaires de vos enfants apparaîtront ici dès que l’école crée les échéances." />
          )}
        </div>
      </div>
    </section>
  );
};

const ChildPaymentPanel = ({ child }: { child: ChildPaymentSummary }) => (
  <article className="premium-card p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-ember">{child.studentCode}</p>
        <h2 className="mt-1 text-2xl font-black text-ink">{child.studentName}</h2>
        <p className="mt-1 text-sm font-semibold text-ink/55">{child.className}</p>
      </div>
      <div className="rounded-lg bg-sky px-4 py-3 text-right">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-ink/45">Reste</p>
        <p className="text-xl font-black text-ocean">{formatCongoleseFranc(child.balance)}</p>
      </div>
    </div>

    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <PaymentPeriodCard label="Trimestre 1" bucket={child.terms.term1} />
      <PaymentPeriodCard label="Trimestre 2" bucket={child.terms.term2} />
      <PaymentPeriodCard label="Trimestre 3" bucket={child.terms.term3} />
      <PaymentPeriodCard label="Annuel" bucket={child.annual} />
    </div>

    <div className="mt-6 rounded-lg border border-ocean/10">
      <div className="flex items-center gap-2 border-b border-ocean/10 px-5 py-4">
        <History size={18} className="text-ocean" />
        <p className="text-sm font-black text-ink">Historique des paiements de {child.studentName}</p>
      </div>
      <div className="space-y-3 bg-sky/30 p-4">
        {child.history.map((payment) => <PaymentHistoryRow key={payment.id} payment={payment} />)}
      </div>
    </div>
  </article>
);

const PaymentPeriodCard = ({ label, bucket }: { label: string; bucket: PaymentBucket }) => {
  const status = bucket.count ? statusCopy[bucket.status] : { label: 'Non créé', className: 'bg-ink/8 text-ink/45' };

  return (
    <div className="rounded-lg border border-ocean/10 bg-white/75 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[9rem] text-lg font-black leading-tight text-ink">{label}</p>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${status.className}`}>{status.label}</span>
      </div>
      <div className="mt-5 space-y-3 text-sm">
        <Line label="À payer" value={formatCongoleseFranc(bucket.expected)} />
        <Line label="Payé" value={formatCongoleseFranc(bucket.paid)} />
        <Line label="Reste" value={formatCongoleseFranc(bucket.balance)} strong />
      </div>
    </div>
  );
};

const PaymentHistoryRow = ({ payment }: { payment: PaymentDto }) => {
  const provider = getPaymentProvider(payment);
  const Icon = providerIcons[provider.key];
  const status = statusCopy[payment.status];
  const remaining = Math.max(Number(payment.amount) - Number(payment.amountPaid), 0);

  return (
    <div className="rounded-lg border border-ocean/10 bg-white p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,1.3fr)_minmax(160px,0.8fr)_minmax(190px,0.9fr)_auto] lg:items-start">
      <div className="flex min-w-0 items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-ocean/10 text-ocean">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-base font-black leading-6 text-ink">{payment.description ?? 'Frais scolaires'}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-ink/50">{provider.label} · {provider.detail}</p>
        </div>
      </div>
      <div className="text-sm">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-ink/40">Montant</p>
        <p className="mt-1 font-black text-ink">{formatCongoleseFranc(payment.amountPaid)} payé</p>
        <p className="mt-1 text-xs font-semibold text-ink/50">{formatCongoleseFranc(remaining)} restant</p>
      </div>
      <div className="text-sm">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-ink/40">Échéance</p>
        <p className="mt-1 font-black text-ink">{formatDate(payment.dueDate)}</p>
        <p className="mt-1 text-xs font-semibold text-ink/50">Reçu: {payment.receiptNumber ?? 'À générer'}</p>
      </div>
      <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${status.className}`}>{status.label}</span>
      </div>
    </div>
  );
};

const PaymentChannelList = ({ title, channels }: { title: string; channels: Array<{ label: string; detail: string; icon: typeof CreditCard }> }) => (
  <div className="premium-card p-5">
    <p className="text-sm font-black text-ink">{title}</p>
    <div className="mt-4 space-y-3">
      {channels.map((channel) => {
        const Icon = channel.icon;
        return (
          <div key={channel.label} className="flex items-start gap-3 rounded-lg border border-ocean/10 bg-white/75 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ocean/10 text-ocean">
              <Icon size={17} />
            </span>
            <div>
              <p className="text-sm font-black text-ink">{channel.label}</p>
              <p className="mt-1 text-xs leading-5 text-ink/55">{channel.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const Line = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-ink/52">{label}</span>
    <span className={strong ? 'font-black text-ocean' : 'font-bold text-ink'}>{value}</span>
  </div>
);

import type { PaymentDto, PaymentMethod, PaymentStatus, StudentDto } from '@evoyamwana/shared';
import { CreditCard, FileText, Plus, ReceiptText, Search, WalletCards } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { paymentsService } from '../../services/payments.service';
import { studentsService } from '../../services/students.service';

const statusLabels: Record<PaymentStatus, string> = {
  PENDING: 'En attente',
  PARTIAL: 'Partiel',
  PAID: 'Payé',
  OVERDUE: 'En retard',
  CANCELLED: 'Annulé'
};

const methodLabels: Record<PaymentMethod, string> = {
  CASH: 'Cash / sur place',
  MOBILE_MONEY: 'Mobile money',
  BANK_TRANSFER: 'Virement bancaire',
  CARD: 'Carte / Multipay',
  OTHER: 'Autre'
};

const today = new Date().toISOString().slice(0, 10);
const formatMoney = (value: string | number) => `${Number(value).toLocaleString('fr-FR')} FC`;

export const AccountantPaymentsPage = ({ readOnly = false, title = 'Paiements et reçus', eyebrow = 'Comptabilité' }: { readOnly?: boolean; title?: string; eyebrow?: string } = {}) => {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ studentId: '', amount: '', amountPaid: '', dueDate: today, description: 'Frais scolaires trimestre 1', paymentMethod: 'CASH' as PaymentMethod, receiptNumber: '' });

  const load = () => {
    setIsLoading(true);
    setError('');
    Promise.all([
      paymentsService.list({ search, status: status || undefined, page: 1, pageSize: 100 }),
      studentsService.list({ page: 1, pageSize: 100, status: 'active' })
    ])
      .then(([paymentResult, studentResult]) => {
        setPayments(paymentResult.payments);
        setStudents(studentResult.students);
        setForm((current) => ({ ...current, studentId: current.studentId || studentResult.students[0]?.id || '' }));
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les paiements.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [search, status]);

  const totals = useMemo(() => {
    const expected = payments.reduce((total, payment) => total + Number(payment.amount), 0);
    const paid = payments.reduce((total, payment) => total + Number(payment.amountPaid), 0);
    const pending = payments.filter((payment) => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(payment.status)).length;
    return { expected, paid, pending };
  }, [payments]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (readOnly) return;
    event.preventDefault();
    if (!form.studentId || !form.amount) return;
    setError('');
    try {
      await paymentsService.create({
        studentId: form.studentId,
        amount: Number(form.amount),
        amountPaid: form.amountPaid ? Number(form.amountPaid) : 0,
        dueDate: form.dueDate,
        paymentMethod: form.paymentMethod,
        receiptNumber: form.receiptNumber || undefined,
        description: form.description
      });
      setForm({ studentId: students[0]?.id || '', amount: '', amountPaid: '', dueDate: today, description: 'Frais scolaires trimestre 1', paymentMethod: 'CASH', receiptNumber: '' });
      setIsFormOpen(false);
      load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible de créer le paiement.');
    }
  };

  const markPaid = async (payment: PaymentDto) => {
    if (readOnly) return;
    await paymentsService.update(payment.id, { amountPaid: Number(payment.amount), status: 'PAID', paidAt: new Date().toISOString(), paymentMethod: payment.paymentMethod ?? 'CASH' });
    load();
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_320px] xl:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">{eyebrow}</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">{title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">{readOnly ? 'Consultez les soldes et paiements liés à votre service, sans modifier les reçus comptables.' : 'Créez les frais, suivez les soldes, marquez les paiements reçus et gardez une vue claire sur les familles.'}</p>
            </div>
            {readOnly ? null : (
              <Button className="gap-2" onClick={() => setIsFormOpen((value) => !value)}>
                <Plus size={18} /> Nouveau paiement
              </Button>
            )}
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        {isFormOpen && !readOnly ? (
          <form onSubmit={handleSubmit} className="mt-5 grid gap-4 rounded-lg border border-ocean/10 bg-white p-5 shadow-panel md:grid-cols-6">
            <select className="h-11 rounded-md border border-ocean/10 px-3 text-sm outline-none md:col-span-2" value={form.studentId} onChange={(event) => setForm((current) => ({ ...current, studentId: event.target.value }))}>
              {students.map((student) => <option key={student.id} value={student.id}>{student.firstName} {student.lastName} - {student.studentCode}</option>)}
            </select>
            <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm outline-none" placeholder="Montant" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
            <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm outline-none" placeholder="Payé" value={form.amountPaid} onChange={(event) => setForm((current) => ({ ...current, amountPaid: event.target.value }))} />
            <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm outline-none" type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
            <select className="h-11 rounded-md border border-ocean/10 px-3 text-sm outline-none" value={form.paymentMethod} onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value as PaymentMethod }))}>
              {Object.entries(methodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm outline-none md:col-span-3" placeholder="Description: trimestre, annuel, M-Pesa, Orange Money..." value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm outline-none md:col-span-2" placeholder="Reçu / référence transaction" value={form.receiptNumber} onChange={(event) => setForm((current) => ({ ...current, receiptNumber: event.target.value }))} />
            <Button type="submit">Enregistrer</Button>
          </form>
        ) : null}

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Montant attendu" value={isLoading ? '...' : formatMoney(totals.expected)} icon={WalletCards} tone="blue" detail="Factures créées" />
          <StatCard label="Montant payé" value={isLoading ? '...' : formatMoney(totals.paid)} icon={ReceiptText} tone="green" detail="Encaissements" />
          <StatCard label="Paiements ouverts" value={isLoading ? '...' : String(totals.pending)} icon={CreditCard} tone="orange" detail="À suivre" />
        </section>

        <section className="mt-6 grid gap-3 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel md:grid-cols-[1fr_220px]">
          <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
            <Search size={18} className="text-ocean/55" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Rechercher élève, reçu, description" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <select className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none" value={status} onChange={(event) => setStatus(event.target.value as PaymentStatus | '')}>
            <option value="">Tous les statuts</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </section>

        <section className="mt-5">
          {isLoading ? <LoadingRows rows={7} /> : (
            <ResponsiveTable
              data={payments}
              getRowKey={(payment) => payment.id}
              columns={[
                { key: 'student', header: 'Élève', render: (payment) => <div><p className="font-bold">{payment.student ? `${payment.student.firstName} ${payment.student.lastName}` : 'Élève'}</p><p className="text-xs text-ink/50">{payment.student?.studentCode}</p></div> },
                { key: 'amount', header: 'Montant', render: (payment) => <span className="font-bold text-ocean">{formatMoney(payment.amount)}</span> },
                { key: 'paid', header: 'Payé', render: (payment) => formatMoney(payment.amountPaid) },
                { key: 'method', header: 'Méthode', render: (payment) => <div><p className="font-bold">{payment.paymentMethod ? methodLabels[payment.paymentMethod] : 'Non précisé'}</p><p className="text-xs text-ink/50">{payment.receiptNumber ?? 'Sans reçu'}</p></div> },
                { key: 'status', header: 'Statut', render: (payment) => <span className="rounded-full bg-sky px-2.5 py-1 text-xs font-bold text-ocean">{statusLabels[payment.status]}</span> },
                { key: 'due', header: 'Échéance', render: (payment) => new Date(payment.dueDate).toLocaleDateString('fr-FR') },
                { key: 'actions', header: 'Action', render: (payment) => payment.status === 'PAID' || readOnly ? <span className="text-xs font-bold text-canopy">{payment.status === 'PAID' ? 'Reçu' : 'Lecture'}</span> : <button className="font-bold text-ember" onClick={() => void markPaid(payment)}>Marquer payé</button> }
              ]}
              emptyState={<EmptyState icon={FileText} title="Aucun paiement" description="Créez un paiement pour commencer le suivi comptable." />}
            />
          )}
        </section>
      </div>
    </div>
  );
};

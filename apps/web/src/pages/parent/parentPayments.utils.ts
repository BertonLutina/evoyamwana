import type { PaymentDto, PaymentMethod, PaymentStatus } from '@evoyamwana/shared';

export type PaymentProviderKey = 'MULTIPAY_CARD' | 'MPESA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY' | 'ILLICOCASH' | 'BANK_TRANSFER' | 'CASH_ON_SITE' | 'OTHER';

export interface PaymentProviderDisplay {
  key: PaymentProviderKey;
  label: string;
  detail: string;
}

export interface PaymentBucket {
  expected: number;
  paid: number;
  balance: number;
  count: number;
  status: PaymentStatus;
}

export interface ChildPaymentSummary {
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  expected: number;
  paid: number;
  balance: number;
  nextDueDate: string | null;
  urgentCount: number;
  terms: {
    term1: PaymentBucket;
    term2: PaymentBucket;
    term3: PaymentBucket;
  };
  annual: PaymentBucket;
  history: PaymentDto[];
}

export interface ParentPaymentSummary {
  totalExpected: number;
  totalPaid: number;
  totalBalance: number;
  onlinePaid: number;
  onSitePaid: number;
  openCount: number;
  children: ChildPaymentSummary[];
}

const emptyBucket = (): PaymentBucket => ({
  expected: 0,
  paid: 0,
  balance: 0,
  count: 0,
  status: 'PENDING'
});

const toAmount = (value: string | number | null | undefined) => Number(value ?? 0);

const isOpenStatus = (status: PaymentStatus) => status === 'PENDING' || status === 'PARTIAL' || status === 'OVERDUE';

const mergeStatus = (current: PaymentStatus, next: PaymentStatus): PaymentStatus => {
  if (next === 'OVERDUE' || current === 'OVERDUE') return 'OVERDUE';
  if (next === 'PARTIAL' || current === 'PARTIAL') return 'PARTIAL';
  if (next === 'PENDING' || current === 'PENDING') return 'PENDING';
  if (next === 'CANCELLED' && current === 'PAID') return 'PARTIAL';
  return 'PAID';
};

const addToBucket = (bucket: PaymentBucket, payment: PaymentDto) => {
  const expected = toAmount(payment.amount);
  const paid = toAmount(payment.amountPaid);
  bucket.expected += expected;
  bucket.paid += paid;
  bucket.balance += Math.max(expected - paid, 0);
  bucket.count += 1;
  bucket.status = bucket.count === 1 ? payment.status : mergeStatus(bucket.status, payment.status);
};

export const getPaymentProvider = (payment: Pick<PaymentDto, 'paymentMethod' | 'description'>): PaymentProviderDisplay => {
  const description = (payment.description ?? '').toLowerCase();
  const method = payment.paymentMethod as PaymentMethod | null | undefined;

  if (description.includes('multipay') || method === 'CARD') {
    return { key: 'MULTIPAY_CARD', label: 'Multipay / carte', detail: 'Carte, TPE ou passerelle bancaire' };
  }

  if (description.includes('m-pesa') || description.includes('mpesa')) {
    return { key: 'MPESA', label: 'M-Pesa', detail: 'Mobile money Vodacom' };
  }

  if (description.includes('orange')) {
    return { key: 'ORANGE_MONEY', label: 'Orange Money', detail: 'Mobile money Orange' };
  }

  if (description.includes('airtel')) {
    return { key: 'AIRTEL_MONEY', label: 'Airtel Money', detail: 'Mobile money Airtel' };
  }

  if (description.includes('illico') || description.includes('rawbank')) {
    return { key: 'ILLICOCASH', label: 'IllicoCash', detail: 'Portefeuille digital bancaire' };
  }

  if (method === 'BANK_TRANSFER') {
    return { key: 'BANK_TRANSFER', label: 'Virement bancaire', detail: 'Paiement banque à banque' };
  }

  if (method === 'CASH') {
    return { key: 'CASH_ON_SITE', label: 'Sur place', detail: 'Cash ou reçu manuel école' };
  }

  if (method === 'MOBILE_MONEY') {
    return { key: 'OTHER', label: 'Mobile money', detail: 'Canal mobile à confirmer' };
  }

  return { key: 'OTHER', label: 'Autre moyen', detail: 'Mode de paiement non précisé' };
};

export const getPaymentPeriod = (payment: PaymentDto): 'term1' | 'term2' | 'term3' | 'annual' => {
  const description = (payment.description ?? '').toLowerCase();
  if (description.includes('annuel') || description.includes('annual')) return 'annual';
  if (description.includes('trimestre 1') || description.includes('trim 1') || description.includes('t1')) return 'term1';
  if (description.includes('trimestre 2') || description.includes('trim 2') || description.includes('t2')) return 'term2';
  if (description.includes('trimestre 3') || description.includes('trim 3') || description.includes('t3')) return 'term3';

  const month = new Date(payment.dueDate).getMonth();
  if (month <= 2) return 'term1';
  if (month <= 5) return 'term2';
  if (month <= 8) return 'term3';
  return 'annual';
};

export const buildParentPaymentSummary = (payments: PaymentDto[]): ParentPaymentSummary => {
  const byChild = new Map<string, ChildPaymentSummary>();

  payments.forEach((payment) => {
    const student = payment.student;
    const studentId = payment.studentId;
    const child = byChild.get(studentId) ?? {
      studentId,
      studentName: student ? `${student.firstName} ${student.lastName}`.trim() : 'Enfant',
      studentCode: student?.studentCode ?? 'Code non renseigné',
      className: student?.class?.name ?? 'Classe non renseignée',
      expected: 0,
      paid: 0,
      balance: 0,
      nextDueDate: null,
      urgentCount: 0,
      terms: {
        term1: emptyBucket(),
        term2: emptyBucket(),
        term3: emptyBucket()
      },
      annual: emptyBucket(),
      history: []
    };

    const expected = toAmount(payment.amount);
    const paid = toAmount(payment.amountPaid);
    child.expected += expected;
    child.paid += paid;
    child.balance += Math.max(expected - paid, 0);
    child.history.push(payment);
    if (isOpenStatus(payment.status)) {
      child.urgentCount += 1;
      if (!child.nextDueDate || new Date(payment.dueDate) < new Date(child.nextDueDate)) {
        child.nextDueDate = payment.dueDate;
      }
    }

    const period = getPaymentPeriod(payment);
    if (period === 'annual') {
      addToBucket(child.annual, payment);
    } else {
      addToBucket(child.terms[period], payment);
    }

    byChild.set(studentId, child);
  });

  const children = Array.from(byChild.values()).map((child) => ({
    ...child,
    history: child.history.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  }));

  return {
    totalExpected: children.reduce((total, child) => total + child.expected, 0),
    totalPaid: children.reduce((total, child) => total + child.paid, 0),
    totalBalance: children.reduce((total, child) => total + child.balance, 0),
    onlinePaid: payments.reduce((total, payment) => {
      const provider = getPaymentProvider(payment);
      return provider.key === 'CASH_ON_SITE' ? total : total + toAmount(payment.amountPaid);
    }, 0),
    onSitePaid: payments.reduce((total, payment) => (getPaymentProvider(payment).key === 'CASH_ON_SITE' ? total + toAmount(payment.amountPaid) : total), 0),
    openCount: payments.filter((payment) => isOpenStatus(payment.status)).length,
    children
  };
};

export const formatCongoleseFranc = (value: number | string) => `${Number(value).toLocaleString('fr-FR')} FC`;

import assert from 'node:assert/strict';
import test from 'node:test';
import type { PaymentDto } from '@evoyamwana/shared';
import { buildParentPaymentSummary, getPaymentProvider } from '../src/pages/parent/parentPayments.utils';

const payment = (overrides: Partial<PaymentDto>): PaymentDto => ({
  id: 'payment-1',
  schoolId: 'school-1',
  studentId: 'student-1',
  amount: '300',
  amountPaid: '0',
  dueDate: '2026-02-15T00:00:00.000Z',
  status: 'PENDING',
  paymentMethod: null,
  receiptNumber: null,
  description: 'Frais scolaires trimestre 1',
  paidAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  student: {
    id: 'student-1',
    firstName: 'Amani',
    lastName: 'Ilunga',
    studentCode: 'ST-001',
    class: {
      id: 'class-1',
      name: '4e Primaire',
      level: 'Primaire'
    }
  },
  parent: null,
  ...overrides
});

test('buildParentPaymentSummary groups payments by child, term, and annual totals', () => {
  const summary = buildParentPaymentSummary([
    payment({ id: 't1', amount: '300', amountPaid: '300', status: 'PAID', dueDate: '2026-02-15T00:00:00.000Z', description: 'Frais scolaires trimestre 1' }),
    payment({ id: 't2', amount: '300', amountPaid: '150', status: 'PARTIAL', dueDate: '2026-05-15T00:00:00.000Z', description: 'Frais scolaires trimestre 2' }),
    payment({ id: 'annual', amount: '900', amountPaid: '0', status: 'PENDING', dueDate: '2026-09-15T00:00:00.000Z', description: 'Frais scolaires annuel' })
  ]);

  assert.equal(summary.totalExpected, 1500);
  assert.equal(summary.totalPaid, 450);
  assert.equal(summary.totalBalance, 1050);
  assert.equal(summary.children.length, 1);
  assert.equal(summary.children[0].terms.term1.paid, 300);
  assert.equal(summary.children[0].terms.term2.balance, 150);
  assert.equal(summary.children[0].annual.expected, 900);
  assert.equal(summary.children[0].history.length, 3);
});

test('getPaymentProvider maps Congo payment descriptions and methods to readable providers', () => {
  assert.equal(getPaymentProvider(payment({ paymentMethod: 'CARD', description: 'Multipay carte bancaire' })).label, 'Multipay / carte');
  assert.equal(getPaymentProvider(payment({ paymentMethod: 'MOBILE_MONEY', description: 'Paiement M-Pesa parent' })).label, 'M-Pesa');
  assert.equal(getPaymentProvider(payment({ paymentMethod: 'MOBILE_MONEY', description: 'Orange Money reçu' })).label, 'Orange Money');
  assert.equal(getPaymentProvider(payment({ paymentMethod: 'CASH', description: 'Paiement sur place' })).label, 'Sur place');
});

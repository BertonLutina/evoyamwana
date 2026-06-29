import type { PaymentMethod, PaymentStatus } from '@prisma/client';
import type { AuthUser } from '@evoyamwana/shared';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export interface PaymentInput {
  studentId: string;
  parentId?: string | null;
  amount: number;
  amountPaid?: number;
  dueDate: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  receiptNumber?: string | null;
  description?: string | null;
  paidAt?: string | null;
}

export interface PaymentUpdateInput {
  studentId?: string;
  parentId?: string | null;
  amount?: number;
  amountPaid?: number;
  dueDate?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  receiptNumber?: string | null;
  description?: string | null;
  paidAt?: string | null;
}

export interface PaymentListQuery {
  search?: string;
  studentId?: string;
  parentId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

type Delegate = {
  findMany?: (args: unknown) => Promise<unknown[]>;
  findFirst?: (args: unknown) => Promise<unknown>;
  count?: (args: unknown) => Promise<number>;
  create?: (args: unknown) => Promise<unknown>;
  update?: (args: unknown) => Promise<unknown>;
  aggregate?: (args: unknown) => Promise<{ _sum?: { amount?: unknown; amountPaid?: unknown }; _count?: { _all?: number } }>;
  groupBy?: (args: unknown) => Promise<Array<{ status?: PaymentStatus; _count?: { _all?: number }; _sum?: { amount?: unknown; amountPaid?: unknown } }>>;
};

type PaymentsDb = {
  payment: Delegate;
  student?: Delegate;
  parent?: Delegate;
};

const includePaymentRelations = {
  student: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentCode: true,
      class: {
        select: {
          id: true,
          name: true,
          level: true
        }
      }
    }
  },
  parent: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true
    }
  }
};

const requireSchoolId = (schoolId: string | null | undefined) => {
  if (!schoolId) {
    throw new AppError('School context is required', 403);
  }

  return schoolId;
};

const toDate = (value?: string | null) => (value ? new Date(value) : undefined);
const toNullableDate = (value?: string | null) => (value === null ? null : toDate(value));
const toNumber = (value: unknown) => Number(value ?? 0);

const scopedWhere = (user: AuthUser, query: PaymentListQuery = {}) => {
  const schoolId = requireSchoolId(user.schoolId);
  const where: Record<string, unknown> = { schoolId };

  if (user.role === 'STUDENT') {
    where.student = { userId: user.id, schoolId, isActive: true };
  }

  if (user.role === 'PARENT') {
    where.student = {
      parents: {
        some: {
          parent: { userId: user.id, schoolId }
        }
      }
    };
  }

  if (query.status) where.status = query.status;
  if (query.paymentMethod) where.paymentMethod = query.paymentMethod;
  if (query.parentId && user.role !== 'PARENT') where.parentId = query.parentId;
  if (query.studentId && user.role !== 'STUDENT') where.studentId = query.studentId;

  if (query.from || query.to) {
    where.dueDate = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {})
    };
  }

  if (query.search) {
    where.OR = [
      { receiptNumber: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { student: { firstName: { contains: query.search, mode: 'insensitive' } } },
      { student: { lastName: { contains: query.search, mode: 'insensitive' } } },
      { student: { studentCode: { contains: query.search, mode: 'insensitive' } } },
      { parent: { firstName: { contains: query.search, mode: 'insensitive' } } },
      { parent: { lastName: { contains: query.search, mode: 'insensitive' } } }
    ];
  }

  return { schoolId, where };
};

const getPaymentWhere = (user: AuthUser, id: string) => {
  const { schoolId, where } = scopedWhere(user);
  return { schoolId, where: { ...where, id } };
};

const inferStatus = (amount: number, amountPaid: number, explicit?: PaymentStatus) => {
  if (explicit) return explicit;
  if (amountPaid >= amount) return 'PAID';
  if (amountPaid > 0) return 'PARTIAL';
  return 'PENDING';
};

export const createPaymentsService = (db: PaymentsDb = prisma as unknown as PaymentsDb) => {
  const getPaymentById = async (user: AuthUser, id: string) => {
    const { where } = getPaymentWhere(user, id);
    const payment = await db.payment.findFirst?.({
      where,
      include: includePaymentRelations
    });

    if (!payment) {
      throw new AppError('Payment not found or not accessible', 404);
    }

    return payment;
  };

  const validatePaymentScope = async (schoolId: string, input: { studentId: string; parentId?: string | null }) => {
    const student = await db.student?.findFirst?.({
      where: {
        id: input.studentId,
        schoolId,
        isActive: true
      }
    });

    if (!student) {
      throw new AppError('Student not found for this school', 400);
    }

    if (!input.parentId) return;

    const parent = await db.parent?.findFirst?.({
      where: {
        id: input.parentId,
        schoolId,
        children: {
          some: {
            studentId: input.studentId,
            schoolId
          }
        }
      }
    });

    if (!parent) {
      throw new AppError('Parent not found for this student', 400);
    }
  };

  const paymentData = (input: PaymentInput | PaymentUpdateInput, current?: { amount: unknown; amountPaid: unknown; status?: PaymentStatus }) => {
    const nextAmount = input.amount ?? toNumber(current?.amount);
    const nextAmountPaid = input.amountPaid ?? toNumber(current?.amountPaid);

    if (nextAmount <= 0) {
      throw new AppError('Amount must be greater than zero', 400);
    }

    if (nextAmountPaid < 0 || nextAmountPaid > nextAmount) {
      throw new AppError('Amount paid must be between zero and amount', 400);
    }

    const status = current && !input.status ? current.status : inferStatus(nextAmount, nextAmountPaid, input.status);
    const paidAt = input.paidAt !== undefined ? toNullableDate(input.paidAt) : status === 'PAID' ? new Date() : undefined;

    return {
      studentId: input.studentId,
      parentId: input.parentId,
      amount: input.amount,
      amountPaid: input.amountPaid,
      dueDate: toDate(input.dueDate),
      status,
      paymentMethod: input.paymentMethod,
      receiptNumber: input.receiptNumber,
      description: input.description,
      paidAt
    };
  };

  return {
    async listPayments(user: AuthUser, query: PaymentListQuery = {}) {
      const page = Math.max(query.page ?? 1, 1);
      const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 100);
      const { where } = scopedWhere(user, query);

      const findArgs = {
        where,
        include: includePaymentRelations,
        orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize
      };

      const [payments, total] = await Promise.all([db.payment.findMany?.(findArgs), db.payment.count?.({ where })]);

      return {
        payments: payments ?? [],
        pagination: {
          page,
          pageSize,
          total: total ?? 0,
          totalPages: Math.max(Math.ceil((total ?? 0) / pageSize), 1)
        }
      };
    },

    getPaymentById,

    async getPaymentStats(user: AuthUser, query: PaymentListQuery = {}) {
      const { where } = scopedWhere(user, query);
      const [aggregate, byStatus] = await Promise.all([
        db.payment.aggregate?.({
          where,
          _count: { _all: true },
          _sum: { amount: true, amountPaid: true }
        }),
        db.payment.groupBy?.({
          by: ['status'],
          where,
          _count: { _all: true },
          _sum: { amount: true, amountPaid: true }
        })
      ]);

      return {
        totalPayments: aggregate?._count?._all ?? 0,
        totalAmount: toNumber(aggregate?._sum?.amount),
        totalPaid: toNumber(aggregate?._sum?.amountPaid),
        totalOutstanding: toNumber(aggregate?._sum?.amount) - toNumber(aggregate?._sum?.amountPaid),
        byStatus: (byStatus ?? []).map((row) => ({
          status: row.status,
          count: row._count?._all ?? 0,
          amount: toNumber(row._sum?.amount),
          amountPaid: toNumber(row._sum?.amountPaid)
        }))
      };
    },

    async createPayment(user: AuthUser, input: PaymentInput) {
      const schoolId = requireSchoolId(user.schoolId);
      await validatePaymentScope(schoolId, input);
      const data = paymentData(input);

      return db.payment.create?.({
        data: {
          schoolId,
          studentId: input.studentId,
          parentId: input.parentId ?? null,
          amount: input.amount,
          amountPaid: input.amountPaid ?? 0,
          dueDate: data.dueDate,
          status: data.status,
          paymentMethod: input.paymentMethod ?? null,
          receiptNumber: input.receiptNumber ?? null,
          description: input.description ?? null,
          paidAt: data.paidAt
        },
        include: includePaymentRelations
      });
    },

    async updatePayment(user: AuthUser, id: string, input: PaymentUpdateInput) {
      const current = (await getPaymentById(user, id)) as {
        studentId: string;
        parentId?: string | null;
        amount: unknown;
        amountPaid: unknown;
        status: PaymentStatus;
      };
      const schoolId = requireSchoolId(user.schoolId);
      const nextScope = {
        studentId: input.studentId ?? current.studentId,
        parentId: input.parentId === undefined ? current.parentId : input.parentId
      };

      await validatePaymentScope(schoolId, nextScope);
      const data = paymentData(input, current);

      return db.payment.update?.({
        where: { id },
        data: {
          studentId: input.studentId,
          parentId: input.parentId,
          amount: input.amount,
          amountPaid: input.amountPaid,
          dueDate: data.dueDate,
          status: data.status,
          paymentMethod: input.paymentMethod,
          receiptNumber: input.receiptNumber,
          description: input.description,
          paidAt: data.paidAt
        },
        include: includePaymentRelations
      });
    },

    async deletePayment(user: AuthUser, id: string) {
      await getPaymentById(user, id);

      return db.payment.update?.({
        where: { id },
        data: {
          status: 'CANCELLED',
          paidAt: null
        },
        include: includePaymentRelations
      });
    }
  };
};

export const paymentsService = createPaymentsService();

import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuthUser } from '@evoyamwana/shared';
import { createPaymentsService } from './payments.service.js';

const adminUser: AuthUser = {
  id: 'user-admin',
  email: 'admin@school.test',
  fullName: 'School Admin',
  role: 'SCHOOL_ADMIN',
  schoolId: 'school-1'
};

const parentUser: AuthUser = {
  id: 'user-parent',
  email: 'parent@school.test',
  fullName: 'Parent User',
  role: 'PARENT',
  schoolId: 'school-1'
};

const studentUser: AuthUser = {
  id: 'user-student',
  email: 'student@school.test',
  fullName: 'Student User',
  role: 'STUDENT',
  schoolId: 'school-1'
};

test('listPayments scopes admin results to the authenticated school', async () => {
  const calls: unknown[] = [];
  const service = createPaymentsService({
    payment: {
      findMany(args: unknown) {
        calls.push(args);
        return Promise.resolve([]);
      },
      count(args: unknown) {
        calls.push(args);
        return Promise.resolve(0);
      }
    }
  });

  await service.listPayments(adminUser, {
    status: 'PENDING',
    studentId: 'student-1',
    page: 2,
    pageSize: 25
  });

  assert.deepEqual(calls[0], {
    where: {
      schoolId: 'school-1',
      status: 'PENDING',
      studentId: 'student-1'
    },
    include: {
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
    },
    orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }],
    skip: 25,
    take: 25
  });
});

test('listPayments limits parents to payments for their linked children', async () => {
  const calls: unknown[] = [];
  const service = createPaymentsService({
    payment: {
      findMany(args: unknown) {
        calls.push(args);
        return Promise.resolve([]);
      },
      count(args: unknown) {
        calls.push(args);
        return Promise.resolve(0);
      }
    }
  });

  await service.listPayments(parentUser);

  assert.deepEqual((calls[0] as { where: unknown }).where, {
    schoolId: 'school-1',
    student: {
      parents: {
        some: {
          parent: {
            userId: 'user-parent',
            schoolId: 'school-1'
          }
        }
      }
    }
  });
});

test('getPaymentById limits students to their own payments', async () => {
  const calls: unknown[] = [];
  const service = createPaymentsService({
    payment: {
      findFirst(args: unknown) {
        calls.push(args);
        return Promise.resolve(null);
      }
    }
  });

  await assert.rejects(() => service.getPaymentById(studentUser, 'payment-1'), {
    message: 'Payment not found or not accessible'
  });

  assert.deepEqual(calls[0], {
    where: {
      id: 'payment-1',
      schoolId: 'school-1',
      student: {
        userId: 'user-student',
        schoolId: 'school-1',
        isActive: true
      }
    },
    include: {
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
    }
  });
});

test('createPayment rejects a student outside the authenticated school', async () => {
  const service = createPaymentsService({
    student: {
      findFirst() {
        return Promise.resolve(null);
      }
    },
    parent: {
      findFirst() {
        return Promise.resolve({ id: 'parent-1' });
      }
    },
    payment: {
      create() {
        return Promise.resolve({});
      }
    }
  });

  await assert.rejects(
    () =>
      service.createPayment(adminUser, {
        studentId: 'student-2',
        parentId: 'parent-1',
        amount: 100,
        dueDate: '2026-06-01',
        description: 'Tuition'
      }),
    {
      message: 'Student not found for this school'
    }
  );
});

test('deletePayment cancels a payment in the authenticated school', async () => {
  const calls: unknown[] = [];
  const service = createPaymentsService({
    payment: {
      findFirst(args: unknown) {
        calls.push(args);
        return Promise.resolve({ id: 'payment-1', schoolId: 'school-1' });
      },
      update(args: unknown) {
        calls.push(args);
        return Promise.resolve({ id: 'payment-1', status: 'CANCELLED' });
      }
    }
  });

  await service.deletePayment(adminUser, 'payment-1');

  assert.deepEqual(calls, [
    {
      where: {
        id: 'payment-1',
        schoolId: 'school-1'
      },
      include: {
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
      }
    },
    {
      where: { id: 'payment-1' },
      data: {
        status: 'CANCELLED',
        paidAt: null
      },
      include: {
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
      }
    }
  ]);
});

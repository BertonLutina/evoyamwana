import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuthUser } from '@evoyamwana/shared';
import { createAttendanceService } from './attendance.service.js';

const admin: AuthUser = { id: 'admin-1', email: 'a@test.dev', fullName: 'Admin', role: 'SCHOOL_ADMIN', schoolId: 'school-1' };
const teacher: AuthUser = { id: 'teacher-user-1', email: 't@test.dev', fullName: 'Teacher', role: 'TEACHER', schoolId: 'school-1' };
const parent: AuthUser = { id: 'parent-user-1', email: 'p@test.dev', fullName: 'Parent', role: 'PARENT', schoolId: 'school-1' };

test('school admin can load a class register with students and saved attendance', async () => {
  const calls: unknown[] = [];
  const service = createAttendanceService({
    class: { findFirst: (args: unknown) => { calls.push(args); return Promise.resolve({ id: 'class-1', schoolId: 'school-1' }); } },
    student: { findMany: (args: unknown) => { calls.push(args); return Promise.resolve([{ id: 'student-1', firstName: 'Aline' }]); } },
    attendance: { findMany: (args: unknown) => { calls.push(args); return Promise.resolve([]); } }
  });

  const register = await service.getClassAttendance(admin, 'class-1', '2026-05-13');

  assert.deepEqual(calls[0], { where: { id: 'class-1', schoolId: 'school-1' } });
  assert.deepEqual(calls[1], {
    where: { schoolId: 'school-1', classId: 'class-1', isActive: true },
    include: { class: true, parents: { include: { parent: true } } },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
  });
  assert.deepEqual(calls[2], {
    where: { classId: 'class-1', schoolId: 'school-1', date: new Date('2026-05-13T00:00:00.000Z') },
    include: { student: true },
    orderBy: [{ student: { lastName: 'asc' } }, { student: { firstName: 'asc' } }]
  });
  assert.deepEqual(register, { students: [{ id: 'student-1', firstName: 'Aline' }], attendance: [] });
});

test('teacher cannot access a class they are not assigned to', async () => {
  const service = createAttendanceService({
    teacher: { findFirst: () => Promise.resolve({ id: 'teacher-1' }) },
    class: { findFirst: () => Promise.resolve(null) }
  });

  await assert.rejects(() => service.getClassAttendance(teacher, 'class-2', '2026-05-13'), { message: 'Class not found or not assigned to this teacher' });
});

test('parent can only view attendance for their own child', async () => {
  const service = createAttendanceService({
    parent: { findFirst: () => Promise.resolve({ id: 'parent-1' }) },
    studentParent: { findFirst: () => Promise.resolve(null) }
  });

  await assert.rejects(() => service.getStudentAttendance(parent, 'student-2'), { message: 'Student not found for this parent' });
});

test('recordAttendance upserts daily records and creates absence notifications', async () => {
  const calls: unknown[] = [];
  const service = createAttendanceService({
    class: { findFirst: () => Promise.resolve({ id: 'class-1', schoolId: 'school-1' }) },
    student: { findMany: () => Promise.resolve([{ id: 'student-1' }]) },
    attendance: {
      upsert: (args: unknown) => { calls.push(args); return Promise.resolve({ id: 'attendance-1' }); }
    },
    studentParent: {
      findMany: () => Promise.resolve([{ parent: { userId: 'parent-user-1' } }])
    },
    notification: {
      createMany: (args: unknown) => { calls.push(args); return Promise.resolve({ count: 1 }); }
    },
    $transaction: async (callback) => callback({
      attendance: {
        upsert: (args: unknown) => { calls.push(args); return Promise.resolve({ id: 'attendance-1' }); }
      },
      studentParent: {
        findMany: () => Promise.resolve([{ parent: { userId: 'parent-user-1' } }])
      },
      notification: {
        createMany: (args: unknown) => { calls.push(args); return Promise.resolve({ count: 1 }); }
      }
    })
  });

  await service.recordAttendance(admin, {
    classId: 'class-1',
    date: '2026-05-13',
    records: [{ studentId: 'student-1', status: 'ABSENT' }]
  });

  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0], {
    where: { studentId_classId_date: { studentId: 'student-1', classId: 'class-1', date: new Date('2026-05-13T00:00:00.000Z') } },
    update: { status: 'ABSENT', note: undefined },
    create: { schoolId: 'school-1', classId: 'class-1', studentId: 'student-1', date: new Date('2026-05-13T00:00:00.000Z'), status: 'ABSENT', note: undefined }
  });
});

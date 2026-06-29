import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuthUser } from '@evoyamwana/shared';
import { createDashboardService } from './dashboard.service.js';

const admin: AuthUser = { id: 'admin-1', email: 'a@test.dev', fullName: 'Admin', role: 'SCHOOL_ADMIN', schoolId: 'school-1' };

test('dashboard summary is scoped to the current user school', async () => {
  const calls: unknown[] = [];
  const service = createDashboardService({
    student: { count: (args: unknown) => { calls.push(args); return Promise.resolve(20); } },
    teacher: { count: (args: unknown) => { calls.push(args); return Promise.resolve(4); } },
    class: { count: (args: unknown) => { calls.push(args); return Promise.resolve(3); } },
    payment: {
      count: (args: unknown) => { calls.push(args); return Promise.resolve(6); },
      findMany: (args: unknown) => { calls.push(args); return Promise.resolve([]); }
    },
    notification: {
      count: (args: unknown) => { calls.push(args); return Promise.resolve(2); },
      findMany: (args: unknown) => { calls.push(args); return Promise.resolve([]); }
    },
    schoolSectorDossier: {
      findMany: (args: unknown) => {
        calls.push(args);
        return Promise.resolve([{ id: 'dossier-1', title: 'Contrat sponsor', owner: 'Fondation Kivu', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: null, updatedAt: new Date('2026-05-01') }]);
      }
    },
    attendance: {
      count: (args: unknown) => { calls.push(args); return Promise.resolve(18); },
      findMany: (args: unknown) => { calls.push(args); return Promise.resolve([{ status: 'PRESENT' }, { status: 'ABSENT' }]); }
    }
  });

  const summary = await service.getSummary(admin, '2026-05-13');

  assert.equal(summary.totals.students, 20);
  assert.equal(summary.totals.teachers, 4);
  assert.equal(summary.totals.classes, 3);
  assert.equal(summary.totals.attendanceToday, 18);
  assert.equal(summary.attendance.PRESENT, 1);
  assert.equal(summary.attendance.ABSENT, 1);
  assert.equal(summary.collaboratorDossiers.length, 1);
  assert.deepEqual(calls[0], { where: { schoolId: 'school-1', isActive: true } });
  assert.deepEqual(calls[1], { where: { schoolId: 'school-1' } });
  assert.deepEqual(calls[2], { where: { schoolId: 'school-1' } });
  assert.ok(calls.some((call) => JSON.stringify(call).includes('"sector":"COLLABORATORS"')));
});

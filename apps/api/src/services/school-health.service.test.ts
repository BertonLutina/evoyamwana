import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateSchoolHealthProgression, calculateSchoolHealthScore } from './school-health.service.js';

test('calculateSchoolHealthScore returns null when no health records exist', () => {
  assert.equal(calculateSchoolHealthScore([]), null);
});

test('calculateSchoolHealthScore calculates only from real unresolved records', () => {
  assert.equal(
    calculateSchoolHealthScore([
      { status: 'OPEN', severity: 'LOW' },
      { status: 'IN_PROGRESS', severity: 'HIGH' },
      { status: 'RESOLVED', severity: 'CRITICAL' }
    ]),
    88
  );
});

test('calculateSchoolHealthProgression returns empty months until real health records exist', () => {
  const progression = calculateSchoolHealthProgression([], 2026);
  assert.deepEqual(progression.values, [null, null, null, null, null, null, null, null, null, null, null, null]);
});

test('calculateSchoolHealthProgression follows active records across the school year', () => {
  const progression = calculateSchoolHealthProgression(
    [
      {
        status: 'OPEN',
        severity: 'HIGH',
        createdAt: '2026-09-05T00:00:00.000Z',
        updatedAt: '2026-09-05T00:00:00.000Z',
        resolvedAt: null
      },
      {
        status: 'RESOLVED',
        severity: 'CRITICAL',
        createdAt: '2026-10-10T00:00:00.000Z',
        updatedAt: '2026-11-12T00:00:00.000Z',
        resolvedAt: '2026-11-12T00:00:00.000Z'
      }
    ],
    2026
  );

  assert.equal(progression.values[0], 90);
  assert.equal(progression.values[1], 72);
  assert.equal(progression.values[2], 90);
});

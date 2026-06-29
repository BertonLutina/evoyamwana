import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request, Response } from 'express';
import { getCurrentUser } from './auth.controller.js';

test('getCurrentUser returns the authenticated user without password data', async () => {
  const req = {
    user: {
      id: 'user-1',
      email: 'admin@evoyamwana.test',
      fullName: 'Demo Admin',
      role: 'SCHOOL_ADMIN',
      schoolId: 'school-1'
    }
  } as Request;
  let statusCode = 0;
  let payload: unknown;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      payload = body;
      return this;
    }
  } as Response;

  await getCurrentUser(req, res, () => undefined);

  assert.equal(statusCode, 200);
  assert.deepEqual(payload, {
    success: true,
    data: {
      user: req.user
    }
  });
  assert.equal(JSON.stringify(payload).includes('passwordHash'), false);
});

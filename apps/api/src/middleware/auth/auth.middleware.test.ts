import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { requireAuth } from './auth.middleware.js';

const secret = 'local-development-secret-for-evoyamwana';

test('requireAuth attaches the authenticated user from a valid bearer token', () => {
  const token = jwt.sign(
    {
      sub: 'user-1',
      email: 'admin@evoyamwana.test',
      fullName: 'Demo Admin',
      role: 'SCHOOL_ADMIN',
      schoolId: 'school-1',
      schoolName: 'EVOYAMWANA Institut Lumumba'
    },
    secret
  );
  const req = {
    headers: {
      authorization: `Bearer ${token}`
    }
  } as Request;
  let nextCalled = false;

  requireAuth(req, {} as Response, (() => {
    nextCalled = true;
  }) as NextFunction);

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, {
    id: 'user-1',
    email: 'admin@evoyamwana.test',
    fullName: 'Demo Admin',
    role: 'SCHOOL_ADMIN',
    schoolId: 'school-1',
    schoolName: 'EVOYAMWANA Institut Lumumba'
  });
});

test('requireAuth rejects requests without a bearer token', () => {
  let error: unknown;

  requireAuth({ headers: {} } as Request, {} as Response, ((nextError?: unknown) => {
    error = nextError;
  }) as NextFunction);

  assert.equal(error instanceof Error, true);
  assert.equal((error as { statusCode?: number }).statusCode, 401);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import type { UserRole } from '@evoyamwana/shared';
import type { NextFunction, Request, Response } from 'express';
import { requireRole } from './role.middleware.js';

const createRequest = (role?: UserRole): Request =>
  ({
    user: role
      ? {
          id: 'user-1',
          email: 'admin@evoyamwana.test',
          fullName: 'Demo Admin',
          role,
          schoolId: 'school-1'
        }
      : undefined
  }) as Request;

test('requireRole allows users with an accepted role', () => {
  const middleware = requireRole('SUPER_ADMIN', 'SCHOOL_ADMIN');
  let nextCalled = false;

  middleware(createRequest('SCHOOL_ADMIN'), {} as Response, (() => {
    nextCalled = true;
  }) as NextFunction);

  assert.equal(nextCalled, true);
});

test('requireRole rejects users without an accepted role', () => {
  const middleware = requireRole('SUPER_ADMIN');
  let error: unknown;

  middleware(createRequest('TEACHER'), {} as Response, ((nextError?: unknown) => {
    error = nextError;
  }) as NextFunction);

  assert.equal(error instanceof Error, true);
  assert.equal((error as { statusCode?: number }).statusCode, 403);
});

test('requireRole rejects unauthenticated requests', () => {
  const middleware = requireRole('SCHOOL_ADMIN');
  let error: unknown;

  middleware(createRequest(), {} as Response, ((nextError?: unknown) => {
    error = nextError;
  }) as NextFunction);

  assert.equal(error instanceof Error, true);
  assert.equal((error as { statusCode?: number }).statusCode, 401);
});

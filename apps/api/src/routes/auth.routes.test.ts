import assert from 'node:assert/strict';
import test from 'node:test';
import { registerSchoolSchema } from './auth.routes.js';

test('registerSchoolSchema accepts African school onboarding details', () => {
  const parsed = registerSchoolSchema.parse({
    schoolName: 'EVOYAMWANA Institut Lumumba',
    legalName: 'EVOYAMWANA Institut Lumumba SARL',
    country: 'République démocratique du Congo',
    city: 'Kinshasa',
    address: 'Avenue Lumumba 12, Kinshasa',
    schoolType: 'primary_secondary',
    schoolStatus: 'private',
    accreditationNumber: 'EDU/RDC/2026/001',
    schoolEmail: 'contact@lumumba.evoyamwana.test',
    schoolPhone: '+243810000001',
    ownerFullName: 'Amina Mbala',
    ownerEmail: 'amina.mbala@lumumba.evoyamwana.test',
    password: 'DemoPass123!'
  });

  assert.equal(parsed.country, 'République démocratique du Congo');
  assert.equal(parsed.schoolType, 'primary_secondary');
  assert.equal(parsed.schoolStatus, 'private');
});

test('registerSchoolSchema rejects non-African countries', () => {
  assert.throws(
    () => registerSchoolSchema.parse({
      schoolName: 'EVOYAMWANA Paris',
      country: 'France',
      city: 'Paris',
      schoolEmail: 'contact@paris.evoyamwana.test',
      ownerFullName: 'Demo Owner',
      ownerEmail: 'owner@paris.evoyamwana.test',
      password: 'DemoPass123!'
    }),
    /Country must be an African country/
  );
});

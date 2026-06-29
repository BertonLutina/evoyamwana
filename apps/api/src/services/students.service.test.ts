import assert from 'node:assert/strict';
import test from 'node:test';
import { createStudentsService } from './students.service.js';

test('listStudents always scopes results to the authenticated school', async () => {
  const calls: unknown[] = [];
  const service = createStudentsService({
    student: {
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

  await service.listStudents('school-1', {
    search: 'Noella',
    gender: 'Female',
    status: 'active',
    page: 2,
    pageSize: 10
  });

  assert.deepEqual(calls[0], {
    where: {
      schoolId: 'school-1',
      status: 'ACTIVE',
      isActive: true,
      gender: 'Female',
      OR: [
        { firstName: { contains: 'Noella', mode: 'insensitive' } },
        { lastName: { contains: 'Noella', mode: 'insensitive' } },
        { studentCode: { contains: 'Noella', mode: 'insensitive' } }
      ]
    },
    include: {
      class: true,
      schoolYear: true,
      parents: {
        include: {
          parent: true
        }
      },
      guardians: {
        include: {
          guardian: true
        }
      },
      medicalInfo: true,
      maternelleInfo: true,
      primaryInfo: true,
      secondaryInfo: true,
      universityInfo: true
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    skip: 10,
    take: 10
  });
});

test('listStudents limits parent users to their linked children', async () => {
  const calls: unknown[] = [];
  const service = createStudentsService({
    student: {
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

  await service.listStudents(
    'school-1',
    { status: 'active', page: 1, pageSize: 20 },
    { id: 'user-parent-1', email: 'parent@test.dev', fullName: 'Parent Test', role: 'PARENT', schoolId: 'school-1' }
  );

  assert.deepEqual(calls[0], {
    where: {
      schoolId: 'school-1',
      status: 'ACTIVE',
      isActive: true,
      parents: {
        some: {
          parent: {
            userId: 'user-parent-1',
            schoolId: 'school-1'
          }
        }
      }
    },
    include: {
      class: true,
      schoolYear: true,
      parents: {
        include: {
          parent: true
        }
      },
      guardians: {
        include: {
          guardian: true
        }
      },
      medicalInfo: true,
      maternelleInfo: true,
      primaryInfo: true,
      secondaryInfo: true,
      universityInfo: true
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    skip: 0,
    take: 20
  });
});

test('getStudentById limits parent users to their linked children', async () => {
  const calls: unknown[] = [];
  const service = createStudentsService({
    student: {
      findFirst(args: unknown) {
        calls.push(args);
        return Promise.resolve(null);
      }
    }
  });

  await assert.rejects(
    () =>
      service.getStudentById('school-1', 'student-2', {
        id: 'user-parent-1',
        email: 'parent@test.dev',
        fullName: 'Parent Test',
        role: 'PARENT',
        schoolId: 'school-1'
      }),
    { message: 'Student not found' }
  );

  assert.deepEqual(calls[0], {
    where: {
      id: 'student-2',
      schoolId: 'school-1',
      parents: {
        some: {
          parent: {
            userId: 'user-parent-1',
            schoolId: 'school-1'
          }
        }
      }
    },
    include: {
      class: true,
      schoolYear: true,
      parents: {
        include: {
          parent: true
        }
      },
      guardians: {
        include: {
          guardian: true
        }
      },
      medicalInfo: true,
      maternelleInfo: true,
      primaryInfo: true,
      secondaryInfo: true,
      universityInfo: true
    }
  });
});

test('getStudentById rejects students outside the authenticated school', async () => {
  const service = createStudentsService({
    student: {
      findFirst() {
        return Promise.resolve(null);
      }
    }
  });

  await assert.rejects(() => service.getStudentById('school-1', 'student-2'), {
    message: 'Student not found'
  });
});

test('deleteStudent deactivates only a student in the authenticated school', async () => {
  const calls: unknown[] = [];
  const service = createStudentsService({
    student: {
      findFirst(args: unknown) {
        calls.push(args);
        return Promise.resolve({ id: 'student-1', schoolId: 'school-1' });
      },
      update(args: unknown) {
        calls.push(args);
        return Promise.resolve({ id: 'student-1', isActive: false });
      }
    }
  });

  await service.deleteStudent('school-1', 'student-1');

  assert.deepEqual(calls, [
    {
      where: {
        id: 'student-1',
        schoolId: 'school-1'
      }
    },
    {
      where: { id: 'student-1' },
      data: { isActive: false, status: 'INACTIVE' }
    }
  ]);
});

test('createStudent creates maternelle profile, medical info, guardians, legacy parent links and enrollment log in one transaction', async () => {
  const calls: Array<{ delegate: string; method: string; args: unknown }> = [];
  const tx = {
    student: {
      findFirst(args: unknown) {
        calls.push({ delegate: 'student', method: 'findFirst', args });
        return Promise.resolve(null);
      },
      create(args: unknown) {
        calls.push({ delegate: 'student', method: 'create', args });
        return Promise.resolve({ id: 'student-1', schoolId: 'school-1', studentCode: 'STU-20260619-001' });
      }
    },
    parent: {
      count(args: unknown) {
        calls.push({ delegate: 'parent', method: 'count', args });
        return Promise.resolve(1);
      }
    },
    studentParent: {
      createMany(args: unknown) {
        calls.push({ delegate: 'studentParent', method: 'createMany', args });
        return Promise.resolve({ count: 1 });
      }
    },
    studentGuardian: {
      createMany(args: unknown) {
        calls.push({ delegate: 'studentGuardian', method: 'createMany', args });
        return Promise.resolve({ count: 1 });
      }
    },
    studentMedicalInfo: {
      upsert(args: unknown) {
        calls.push({ delegate: 'studentMedicalInfo', method: 'upsert', args });
        return Promise.resolve({});
      }
    },
    studentMaternelleInfo: {
      upsert(args: unknown) {
        calls.push({ delegate: 'studentMaternelleInfo', method: 'upsert', args });
        return Promise.resolve({});
      }
    },
    studentEnrollmentLog: {
      create(args: unknown) {
        calls.push({ delegate: 'studentEnrollmentLog', method: 'create', args });
        return Promise.resolve({});
      }
    }
  };

  const service = createStudentsService({
    ...tx,
    $transaction(operation) {
      return operation(tx);
    }
  });

  await service.createStudent('school-1', {
    firstName: 'Aline',
    lastName: 'Mbuyi',
    gender: 'F',
    birthDate: '2021-03-10',
    category: 'maternelle',
    guardians: [
      {
        guardianId: '11111111-1111-4111-8111-111111111111',
        relationshipType: 'mother',
        isPrimaryContact: true,
        canPickUpChild: true,
        emergencyContact: true
      }
    ],
    medicalInfo: {
      bloodType: 'O+',
      allergies: 'Peanuts',
      emergencyNotes: 'Call mother first'
    },
    maternelleInfo: {
      toiletTrained: true,
      napNeeded: true,
      favoriteLanguage: 'fr',
      separationDifficulty: false
    }
  });

  assert.equal(calls.some((call) => call.delegate === 'studentMaternelleInfo' && call.method === 'upsert'), true);
  assert.equal(calls.some((call) => call.delegate === 'studentMedicalInfo' && call.method === 'upsert'), true);
  assert.equal(calls.some((call) => call.delegate === 'studentGuardian' && call.method === 'createMany'), true);
  assert.equal(calls.some((call) => call.delegate === 'studentParent' && call.method === 'createMany'), true);
  assert.equal(calls.some((call) => call.delegate === 'studentEnrollmentLog' && call.method === 'create'), true);

  const studentCreate = calls.find((call) => call.delegate === 'student' && call.method === 'create');
  assert.deepEqual(studentCreate?.args, {
    data: {
      schoolId: 'school-1',
      firstName: 'Aline',
      lastName: 'Mbuyi',
      gender: 'F',
      birthDate: new Date('2021-03-10'),
      birthPlace: undefined,
      nationality: undefined,
      photoUrl: undefined,
      studentCode: 'STU-20260619-001',
      category: 'MATERNELLE',
      status: 'ACTIVE',
      classId: undefined,
      schoolYearId: undefined,
      isActive: true
    },
    include: {
      class: true,
      schoolYear: true,
      parents: { include: { parent: true } },
      guardians: { include: { guardian: true } },
      medicalInfo: true,
      maternelleInfo: true,
      primaryInfo: true,
      secondaryInfo: true,
      universityInfo: true
    }
  });
});

test('createStudent rejects secondary enrollment without section and option', async () => {
  const service = createStudentsService({
    student: {
      findFirst() {
        return Promise.resolve(null);
      }
    }
  });

  await assert.rejects(
    () =>
      service.createStudent('school-1', {
        firstName: 'Jean',
        lastName: 'Kazadi',
        studentCode: 'SEC-001',
        category: 'secondaire',
        secondaryInfo: {
          previousSchool: 'College Lumiere',
          academicLevel: '3eme',
          repeatedClass: false
        }
      }),
    {
      message: 'Secondary section and option are required'
    }
  );
});

test('createStudent keeps old payload compatibility with parentIds and explicit studentCode', async () => {
  const calls: Array<{ delegate: string; method: string; args: unknown }> = [];
  const tx = {
    student: {
      findFirst(args: unknown) {
        calls.push({ delegate: 'student', method: 'findFirst', args });
        return Promise.resolve(null);
      },
      create(args: unknown) {
        calls.push({ delegate: 'student', method: 'create', args });
        return Promise.resolve({ id: 'student-legacy', schoolId: 'school-1', studentCode: 'OLD-001' });
      }
    },
    parent: {
      count(args: unknown) {
        calls.push({ delegate: 'parent', method: 'count', args });
        return Promise.resolve(1);
      }
    },
    studentParent: {
      createMany(args: unknown) {
        calls.push({ delegate: 'studentParent', method: 'createMany', args });
        return Promise.resolve({ count: 1 });
      }
    },
    studentEnrollmentLog: {
      create(args: unknown) {
        calls.push({ delegate: 'studentEnrollmentLog', method: 'create', args });
        return Promise.resolve({});
      }
    }
  };

  const service = createStudentsService({
    ...tx,
    $transaction(operation) {
      return operation(tx);
    }
  });

  await service.createStudent('school-1', {
    firstName: 'Legacy',
    lastName: 'Student',
    studentCode: 'OLD-001',
    parentIds: ['22222222-2222-4222-8222-222222222222']
  });

  assert.equal(calls.some((call) => call.delegate === 'studentParent' && call.method === 'createMany'), true);
  assert.equal(calls.some((call) => call.delegate === 'studentEnrollmentLog' && call.method === 'create'), true);
  const studentCreate = calls.find((call) => call.delegate === 'student' && call.method === 'create');
  assert.equal((studentCreate?.args as { data: { studentCode: string; category: string } }).data.studentCode, 'OLD-001');
  assert.equal((studentCreate?.args as { data: { studentCode: string; category: string } }).data.category, 'PRIMAIRE');
});

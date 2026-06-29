import assert from 'node:assert/strict';
import test from 'node:test';
import { createChatPermissionService } from './chat-permissions.service.js';

const users = [
  { id: 'super', fullName: 'Super Admin', email: 'super@test', role: 'SUPER_ADMIN', schoolId: null },
  { id: 'admin-1', fullName: 'Admin One', email: 'admin@test', role: 'SCHOOL_ADMIN', schoolId: 'school-1' },
  { id: 'director-1', fullName: 'Director One', email: 'director@test', role: 'DIRECTOR', schoolId: 'school-1' },
  { id: 'teacher-1', fullName: 'Teacher One', email: 'teacher@test', role: 'TEACHER', schoolId: 'school-1' },
  { id: 'teacher-2', fullName: 'Teacher Two', email: 'teacher2@test', role: 'TEACHER', schoolId: 'school-1' },
  { id: 'parent-1', fullName: 'Parent One', email: 'parent@test', role: 'PARENT', schoolId: 'school-1' },
  { id: 'student-1', fullName: 'Student One', email: 'student@test', role: 'STUDENT', schoolId: 'school-1' },
  { id: 'student-2', fullName: 'Student Two', email: 'student2@test', role: 'STUDENT', schoolId: 'school-1' },
  { id: 'nurse-1', fullName: 'Nurse One', email: 'nurse@test', role: 'NURSE', schoolId: 'school-1' },
  { id: 'admin-2', fullName: 'Other Admin', email: 'other@test', role: 'SCHOOL_ADMIN', schoolId: 'school-2' }
] as const;

const students = [
  { id: 'student-profile-1', userId: 'student-1', schoolId: 'school-1', classId: 'class-a' },
  { id: 'student-profile-2', userId: 'student-2', schoolId: 'school-1', classId: 'class-b' }
] as const;

const teachers = [
  { id: 'teacher-profile-1', userId: 'teacher-1', schoolId: 'school-1', classes: [{ id: 'class-a' }] },
  { id: 'teacher-profile-2', userId: 'teacher-2', schoolId: 'school-1', classes: [{ id: 'class-b' }] }
] as const;

const parents = [
  {
    id: 'parent-profile-1',
    userId: 'parent-1',
    schoolId: 'school-1',
    children: [
      {
        student: {
          id: 'student-profile-1',
          userId: 'student-1',
          classId: 'class-a',
          class: { teacher: { userId: 'teacher-1' } }
        }
      }
    ]
  }
] as const;

const db = {
  user: {
    findUnique({ where: { id } }: { where: { id: string } }) {
      return Promise.resolve(users.find((user) => user.id === id) ?? null);
    },
    findMany({ where }: { where: { schoolId?: string; id?: { not?: string } } }) {
      return Promise.resolve(users.filter((user) => (!where.schoolId || user.schoolId === where.schoolId) && user.id !== where.id?.not));
    }
  },
  student: {
    findFirst({ where }: { where: { userId?: string; schoolId?: string; classId?: string } }) {
      return Promise.resolve(students.find((student) => (!where.userId || student.userId === where.userId) && (!where.schoolId || student.schoolId === where.schoolId) && (!where.classId || student.classId === where.classId)) ?? null);
    }
  },
  teacher: {
    findFirst({ where }: { where: { userId?: string; schoolId?: string; classes?: { some?: { id?: string } } } }) {
      return Promise.resolve(teachers.find((teacher) => (!where.userId || teacher.userId === where.userId) && (!where.schoolId || teacher.schoolId === where.schoolId) && (!where.classes?.some?.id || teacher.classes.some((classRecord) => classRecord.id === where.classes?.some?.id))) ?? null);
    }
  },
  parent: {
    findFirst({ where }: { where: { userId?: string; schoolId?: string } }) {
      return Promise.resolve(parents.find((parent) => (!where.userId || parent.userId === where.userId) && (!where.schoolId || parent.schoolId === where.schoolId)) ?? null);
    }
  },
  schoolChatSettings: {
    findUnique() {
      return Promise.resolve({
        allowStudentDirectorChat: false,
        allowStudentNurseChat: false,
        allowStudentDisciplineChat: false,
        allowStudentLibraryChat: false
      });
    }
  }
};

const testDb = db as unknown as Parameters<typeof createChatPermissionService>[0];

test('school admin can message users in the same school but not another school', async () => {
  const service = createChatPermissionService(testDb);

  assert.equal(await service.canSendMessage('admin-1', 'student-1'), true);
  assert.equal(await service.canSendMessage('admin-1', 'admin-2'), false);
});

test('teacher can message students in assigned classes only', async () => {
  const service = createChatPermissionService(testDb);

  assert.equal(await service.canSendMessage('teacher-1', 'student-1'), true);
  assert.equal(await service.canSendMessage('teacher-1', 'student-2'), false);
});

test('parent can message own child and linked teacher only', async () => {
  const service = createChatPermissionService(testDb);

  assert.equal(await service.canSendMessage('parent-1', 'student-1'), true);
  assert.equal(await service.canSendMessage('parent-1', 'teacher-1'), true);
  assert.equal(await service.canSendMessage('parent-1', 'teacher-2'), false);
});

test('student cannot message director or nurse when school settings disable those channels', async () => {
  const service = createChatPermissionService(testDb);

  assert.equal(await service.canSendMessage('student-1', 'director-1'), false);
  assert.equal(await service.canSendMessage('student-1', 'nurse-1'), false);
});

test('super admin can send to everyone but only receive from school admins and directors', async () => {
  const service = createChatPermissionService(testDb);

  assert.equal(await service.canSendMessage('super', 'student-1'), true);
  assert.equal(await service.canSendMessage('admin-1', 'super'), true);
  assert.equal(await service.canSendMessage('teacher-1', 'super'), false);
  assert.equal(await service.canReceiveMessage('super', 'admin-1'), true);
  assert.equal(await service.canReceiveMessage('super', 'teacher-1'), false);
});

test('allowed contacts only returns contacts that pass send and receive checks', async () => {
  const service = createChatPermissionService(testDb);

  const contacts = await service.getAllowedChatContacts('teacher-1');
  assert.deepEqual(contacts.map((contact) => contact.id).sort(), ['director-1', 'nurse-1', 'student-1', 'teacher-2']);
});

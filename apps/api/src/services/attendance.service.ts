import type { AttendanceStatus } from '@prisma/client';
import type { AuthUser } from '@evoyamwana/shared';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export interface AttendanceRecordInput {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface RecordAttendanceInput {
  classId: string;
  date: string;
  records: AttendanceRecordInput[];
}

interface AttendanceReport {
  PRESENT: number;
  ABSENT: number;
  LATE: number;
  EXCUSED: number;
  total: number;
}

type Delegate = {
  findFirst?: (args: unknown) => Promise<unknown>;
  findMany?: (args: unknown) => Promise<unknown[]>;
  upsert?: (args: unknown) => Promise<unknown>;
  update?: (args: unknown) => Promise<unknown>;
  createMany?: (args: unknown) => Promise<unknown>;
};

type AttendanceDb = {
  class?: Delegate;
  teacher?: Delegate;
  parent?: Delegate;
  student?: Delegate;
  attendance?: Delegate;
  studentParent?: Delegate;
  notification?: Delegate;
  $transaction?: <T>(callback: (tx: AttendanceDb) => Promise<T>) => Promise<T>;
};

const day = (date: string) => new Date(`${date}T00:00:00.000Z`);

const requireSchool = (user: AuthUser) => {
  if (!user.schoolId) {
    throw new AppError('School context is required', 403);
  }
  return user.schoolId;
};

const fullAttendanceAccessRoles = new Set(['SCHOOL_ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'DISCIPLINE_OFFICER', 'NURSE']);

export const createAttendanceService = (db: AttendanceDb = prisma as unknown as AttendanceDb) => {
  const teacherProfile = async (user: AuthUser) => {
    if (user.role !== 'TEACHER' && user.role !== 'CLASS_TUTOR') return null;
    const teacher = await db.teacher?.findFirst?.({ where: { userId: user.id, schoolId: user.schoolId } });
    if (!teacher) throw new AppError('Teacher profile not found', 403);
    return teacher as { id: string };
  };

  const parentProfile = async (user: AuthUser) => {
    if (user.role !== 'PARENT') return null;
    const parent = await db.parent?.findFirst?.({ where: { userId: user.id, schoolId: user.schoolId } });
    if (!parent) throw new AppError('Parent profile not found', 403);
    return parent as { id: string };
  };

  const assertClassAccess = async (user: AuthUser, classId: string) => {
    const schoolId = requireSchool(user);
    if (fullAttendanceAccessRoles.has(user.role)) {
      const classRecord = await db.class?.findFirst?.({ where: { id: classId, schoolId } });
      if (!classRecord) throw new AppError('Class not found', 404);
      return;
    }

    if (user.role === 'TEACHER' || user.role === 'CLASS_TUTOR') {
      const teacher = await teacherProfile(user);
      const classRecord = await db.class?.findFirst?.({ where: { id: classId, schoolId, teacherId: teacher?.id } });
      if (!classRecord) throw new AppError('Class not found or not assigned to this teacher', 403);
      return;
    }

    throw new AppError('You do not have permission to access this class', 403);
  };

  const assertStudentAccess = async (user: AuthUser, studentId: string) => {
    const schoolId = requireSchool(user);
    if (fullAttendanceAccessRoles.has(user.role)) {
      const student = await db.student?.findFirst?.({ where: { id: studentId, schoolId } });
      if (!student) throw new AppError('Student not found', 404);
      return;
    }

    if (user.role === 'PARENT') {
      const parent = await parentProfile(user);
      const link = await db.studentParent?.findFirst?.({ where: { schoolId, studentId, parentId: parent?.id } });
      if (!link) throw new AppError('Student not found for this parent', 403);
      return;
    }

    if (user.role === 'TEACHER' || user.role === 'CLASS_TUTOR') {
      const teacher = await teacherProfile(user);
      const student = await db.student?.findFirst?.({ where: { id: studentId, schoolId, class: { teacherId: teacher?.id } } });
      if (!student) throw new AppError('Student not found for this teacher', 403);
      return;
    }

    if (user.role === 'STUDENT') {
      const student = await db.student?.findFirst?.({ where: { id: studentId, schoolId, userId: user.id } });
      if (!student) throw new AppError('Student profile not found', 403);
      return;
    }

    throw new AppError('You do not have permission to access this student', 403);
  };

  const notifyParents = async (tx: AttendanceDb, schoolId: string, record: AttendanceRecordInput) => {
    if (!['ABSENT', 'LATE'].includes(record.status)) return;
    const links = (await tx.studentParent?.findMany?.({
      where: { schoolId, studentId: record.studentId },
      include: { parent: true }
    })) as Array<{ parent: { userId: string } }> | undefined;
    const data = (links ?? [])
      .filter((link) => link.parent.userId)
      .map((link) => ({
        schoolId,
        userId: link.parent.userId,
        title: `Attendance marked ${record.status.toLowerCase()}`,
        body: `Your child was marked ${record.status.toLowerCase()} today.`,
        type: 'ATTENDANCE' as const
      }));
    if (data.length) await tx.notification?.createMany?.({ data });
  };

  return {
    async getClassAttendance(user: AuthUser, classId: string, date: string) {
      const schoolId = requireSchool(user);
      await assertClassAccess(user, classId);
      const students = (await db.student?.findMany?.({
        where: { schoolId, classId, isActive: true },
        include: { class: true, parents: { include: { parent: true } } },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
      })) ?? [];
      const attendance = (await db.attendance?.findMany?.({
        where: { classId, schoolId, date: day(date) },
        include: { student: true },
        orderBy: [{ student: { lastName: 'asc' } }, { student: { firstName: 'asc' } }]
      })) ?? [];
      return { students, attendance };
    },

    async recordAttendance(user: AuthUser, input: RecordAttendanceInput) {
      const schoolId = requireSchool(user);
      await assertClassAccess(user, input.classId);
      const studentIds = input.records.map((record) => record.studentId);
      const students = (await db.student?.findMany?.({ where: { schoolId, classId: input.classId, id: { in: studentIds }, isActive: true } })) ?? [];
      if (students.length !== studentIds.length) throw new AppError('One or more students are not in this class', 400);

      const date = day(input.date);
      const operation = async (tx: AttendanceDb) => {
        const records = [];
        for (const record of input.records) {
          records.push(
            await tx.attendance?.upsert?.({
              where: { studentId_classId_date: { studentId: record.studentId, classId: input.classId, date } },
              update: { status: record.status, note: record.note },
              create: { schoolId, classId: input.classId, studentId: record.studentId, date, status: record.status, note: record.note }
            })
          );
          await notifyParents(tx, schoolId, record);
        }
        return records;
      };
      return db.$transaction ? db.$transaction(operation) : operation(db);
    },

    async updateAttendance(user: AuthUser, id: string, input: { status: AttendanceStatus; note?: string }) {
      const schoolId = requireSchool(user);
      const existing = (await db.attendance?.findFirst?.({ where: { id, schoolId } })) as { classId: string } | null;
      if (!existing) throw new AppError('Attendance record not found', 404);
      await assertClassAccess(user, existing.classId);
      return db.attendance?.update?.({ where: { id }, data: input });
    },

    async getStudentAttendance(user: AuthUser, studentId: string) {
      const schoolId = requireSchool(user);
      await assertStudentAccess(user, studentId);
      return db.attendance?.findMany?.({
        where: { studentId, schoolId },
        include: { class: true, student: true },
        orderBy: [{ date: 'desc' }]
      });
    },

    async getMyAttendance(user: AuthUser) {
      const schoolId = requireSchool(user);
      if (user.role !== 'STUDENT') throw new AppError('Student access is required', 403);
      const student = (await db.student?.findFirst?.({
        where: { schoolId, userId: user.id },
        include: { class: true }
      })) as { id: string; class?: unknown } | null;
      if (!student) throw new AppError('Student profile not found', 404);

      const attendance = await db.attendance?.findMany?.({
        where: { schoolId, studentId: student.id },
        include: { class: true, student: true },
        orderBy: [{ date: 'desc' }]
      });

      return { student, attendance: attendance ?? [] };
    },

    async getReport(user: AuthUser, date: string) {
      const schoolId = requireSchool(user);
      const records = (await db.attendance?.findMany?.({ where: { schoolId, date: day(date) } })) ?? [];
      return records.reduce<AttendanceReport>(
        (summary, record) => {
          const status = (record as { status: AttendanceStatus }).status;
          summary[status] += 1;
          summary.total += 1;
          return summary;
        },
        { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0 }
      );
    }
  };
};

export const attendanceService = createAttendanceService();

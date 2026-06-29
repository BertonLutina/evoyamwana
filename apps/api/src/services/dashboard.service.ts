import type { AttendanceStatus, PaymentStatus } from '@prisma/client';
import type { AuthUser } from '@evoyamwana/shared';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

type Delegate = {
  count?: (args: unknown) => Promise<number>;
  findFirst?: (args: unknown) => Promise<unknown>;
  findMany?: (args: unknown) => Promise<unknown[]>;
};

type DashboardDb = {
  student?: Delegate;
  teacher?: Delegate;
  class?: Delegate;
  attendance?: Delegate;
  payment?: Delegate;
  notification?: Delegate;
  parent?: Delegate;
  studentParent?: Delegate;
  schoolSectorDossier?: Delegate;
};

const day = (date: string) => new Date(`${date}T00:00:00.000Z`);

const requireSchool = (user: AuthUser) => {
  if (!user.schoolId) {
    throw new AppError('School context is required', 403);
  }
  return user.schoolId;
};

const paymentStatuses: PaymentStatus[] = ['PENDING', 'PARTIAL', 'OVERDUE'];

export const createDashboardService = (db: DashboardDb = prisma as unknown as DashboardDb) => ({
  async getSummary(user: AuthUser, date = new Date().toISOString().slice(0, 10)) {
    const schoolId = requireSchool(user);
    const targetDate = day(date);

    if (user.role === 'STUDENT') {
      const student = (await db.student?.findFirst?.({
        where: { schoolId, userId: user.id, isActive: true },
        select: { id: true, classId: true }
      })) as { id: string; classId: string | null } | null;

      if (!student) {
        return {
          totals: { students: 0, teachers: 0, classes: 0, attendanceToday: 0, pendingPayments: 0, notifications: 0 },
          attendance: { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0, rate: 0 },
          pendingPayments: [],
          recentNotifications: [],
          collaboratorDossiers: []
        };
      }

      const [teachers, attendanceToday, pendingPayments, notifications, attendanceRecords, pendingPaymentRows, recentNotifications] = await Promise.all([
        student.classId ? db.class?.findMany?.({ where: { schoolId, id: student.classId }, select: { teacherId: true } }) ?? [] : [],
        db.attendance?.count?.({ where: { schoolId, studentId: student.id, date: targetDate } }) ?? 0,
        db.payment?.count?.({ where: { schoolId, studentId: student.id, status: { in: paymentStatuses } } }) ?? 0,
        db.notification?.count?.({ where: { schoolId, userId: user.id, readAt: null } }) ?? 0,
        db.attendance?.findMany?.({ where: { schoolId, studentId: student.id }, select: { status: true }, orderBy: [{ date: 'desc' }], take: 30 }) ?? [],
        db.payment?.findMany?.({
          where: { schoolId, studentId: student.id, status: { in: paymentStatuses } },
          include: { student: true },
          orderBy: [{ dueDate: 'asc' }],
          take: 5
        }) ?? [],
        db.notification?.findMany?.({ where: { schoolId, userId: user.id }, orderBy: [{ createdAt: 'desc' }], take: 5 }) ?? []
      ]);

      const attendance = (attendanceRecords as Array<{ status: AttendanceStatus }>).reduce(
        (summary, record) => {
          summary[record.status] += 1;
          summary.total += 1;
          return summary;
        },
        { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0, rate: 0 }
      );
      attendance.rate = attendance.total ? Math.round((attendance.PRESENT / attendance.total) * 1000) / 10 : 0;

      return {
        totals: {
          students: 1,
          teachers: new Set((teachers as Array<{ teacherId: string | null }>).map((item) => item.teacherId).filter(Boolean)).size,
          classes: student.classId ? 1 : 0,
          attendanceToday,
          pendingPayments,
          notifications
        },
        attendance,
        pendingPayments: pendingPaymentRows,
        recentNotifications,
        collaboratorDossiers: []
      };
    }

    if (user.role === 'PARENT') {
      const parent = (await db.parent?.findFirst?.({
        where: { schoolId, userId: user.id },
        select: { id: true }
      })) as { id: string } | null;

      if (!parent) {
        return {
          totals: { students: 0, teachers: 0, classes: 0, attendanceToday: 0, pendingPayments: 0, notifications: 0 },
          attendance: { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0, rate: 0 },
          pendingPayments: [],
          recentNotifications: [],
          collaboratorDossiers: []
        };
      }

      const children = (await db.studentParent?.findMany?.({
        where: { schoolId, parentId: parent.id },
        include: { student: true }
      })) as Array<{ studentId: string; student: { classId: string | null } }> | undefined;
      const childIds = (children ?? []).map((child) => child.studentId);
      const classIds = new Set((children ?? []).map((child) => child.student.classId).filter(Boolean));

      const [attendanceToday, pendingPayments, notifications, attendanceRecords, pendingPaymentRows, recentNotifications] = await Promise.all([
        childIds.length ? db.attendance?.count?.({ where: { schoolId, studentId: { in: childIds }, date: targetDate } }) ?? 0 : 0,
        db.payment?.count?.({ where: { schoolId, OR: [{ parentId: parent.id }, { studentId: { in: childIds } }], status: { in: paymentStatuses } } }) ?? 0,
        db.notification?.count?.({ where: { schoolId, userId: user.id, readAt: null } }) ?? 0,
        childIds.length ? db.attendance?.findMany?.({ where: { schoolId, studentId: { in: childIds } }, select: { status: true }, orderBy: [{ date: 'desc' }], take: 60 }) ?? [] : [],
        db.payment?.findMany?.({
          where: { schoolId, OR: [{ parentId: parent.id }, { studentId: { in: childIds } }], status: { in: paymentStatuses } },
          include: { student: true },
          orderBy: [{ dueDate: 'asc' }],
          take: 5
        }) ?? [],
        db.notification?.findMany?.({ where: { schoolId, userId: user.id }, orderBy: [{ createdAt: 'desc' }], take: 5 }) ?? []
      ]);

      const attendance = (attendanceRecords as Array<{ status: AttendanceStatus }>).reduce(
        (summary, record) => {
          summary[record.status] += 1;
          summary.total += 1;
          return summary;
        },
        { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0, rate: 0 }
      );
      attendance.rate = attendance.total ? Math.round((attendance.PRESENT / attendance.total) * 1000) / 10 : 0;

      return {
        totals: {
          students: childIds.length,
          teachers: 0,
          classes: classIds.size,
          attendanceToday,
          pendingPayments,
          notifications
        },
        attendance,
        pendingPayments: pendingPaymentRows,
        recentNotifications,
        collaboratorDossiers: []
      };
    }

    if (user.role === 'TEACHER' || user.role === 'CLASS_TUTOR') {
      const teacher = (await db.teacher?.findFirst?.({
        where: { schoolId, userId: user.id },
        select: { id: true }
      })) as { id: string } | null;

      if (!teacher) {
        return {
          totals: { students: 0, teachers: 0, classes: 0, attendanceToday: 0, pendingPayments: 0, notifications: 0 },
          attendance: { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0, rate: 0 },
          pendingPayments: [],
          recentNotifications: [],
          collaboratorDossiers: []
        };
      }

      const [classes, students, attendanceToday, notifications, attendanceRecords, recentNotifications] = await Promise.all([
        db.class?.count?.({ where: { schoolId, teacherId: teacher.id } }) ?? 0,
        db.student?.count?.({ where: { schoolId, isActive: true, class: { teacherId: teacher.id } } }) ?? 0,
        db.attendance?.count?.({ where: { schoolId, date: targetDate, class: { teacherId: teacher.id } } }) ?? 0,
        db.notification?.count?.({ where: { schoolId, userId: user.id, readAt: null } }) ?? 0,
        db.attendance?.findMany?.({ where: { schoolId, class: { teacherId: teacher.id } }, select: { status: true }, orderBy: [{ date: 'desc' }], take: 60 }) ?? [],
        db.notification?.findMany?.({ where: { schoolId, userId: user.id }, orderBy: [{ createdAt: 'desc' }], take: 5 }) ?? []
      ]);

      const attendance = (attendanceRecords as Array<{ status: AttendanceStatus }>).reduce(
        (summary, record) => {
          summary[record.status] += 1;
          summary.total += 1;
          return summary;
        },
        { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0, rate: 0 }
      );
      attendance.rate = attendance.total ? Math.round((attendance.PRESENT / attendance.total) * 1000) / 10 : 0;

      return {
        totals: {
          students,
          teachers: 1,
          classes,
          attendanceToday,
          pendingPayments: 0,
          notifications
        },
        attendance,
        pendingPayments: [],
        recentNotifications,
        collaboratorDossiers: []
      };
    }

    const [
      students,
      teachers,
      classes,
      attendanceToday,
      pendingPayments,
      notifications,
      attendanceRecords,
      pendingPaymentRows,
      recentNotifications,
      collaboratorDossiers
    ] = await Promise.all([
      db.student?.count?.({ where: { schoolId, isActive: true } }) ?? 0,
      db.teacher?.count?.({ where: { schoolId } }) ?? 0,
      db.class?.count?.({ where: { schoolId } }) ?? 0,
      db.attendance?.count?.({ where: { schoolId, date: targetDate } }) ?? 0,
      db.payment?.count?.({ where: { schoolId, status: { in: paymentStatuses } } }) ?? 0,
      db.notification?.count?.({ where: { schoolId, userId: user.id, readAt: null } }) ?? 0,
      db.attendance?.findMany?.({ where: { schoolId, date: targetDate }, select: { status: true } }) ?? [],
      db.payment?.findMany?.({
        where: { schoolId, status: { in: paymentStatuses } },
        include: { student: true },
        orderBy: [{ dueDate: 'asc' }],
        take: 5
      }) ?? [],
      db.notification?.findMany?.({
        where: { schoolId, userId: user.id },
        orderBy: [{ createdAt: 'desc' }],
        take: 5
      }) ?? [],
      db.schoolSectorDossier?.findMany?.({
        where: { schoolId, sector: 'COLLABORATORS' },
        select: { id: true, title: true, owner: true, status: true, priority: true, dueDate: true, updatedAt: true },
        orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
        take: 6
      }) ?? []
    ]);

    const attendance = (attendanceRecords as Array<{ status: AttendanceStatus }>).reduce(
      (summary, record) => {
        summary[record.status] += 1;
        summary.total += 1;
        return summary;
      },
      { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0, rate: 0 }
    );
    attendance.rate = attendance.total ? Math.round((attendance.PRESENT / attendance.total) * 1000) / 10 : 0;

    return {
      totals: {
        students,
        teachers,
        classes,
        attendanceToday,
        pendingPayments,
        notifications
      },
      attendance,
      pendingPayments: pendingPaymentRows,
      recentNotifications,
      collaboratorDossiers
    };
  }
});

export const dashboardService = createDashboardService();

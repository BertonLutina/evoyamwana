import type { AuthUser, UserRole } from '@evoyamwana/shared';
import type { Prisma, StudentCategory } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export interface ListQuery {
  search?: string;
  classId?: string;
  teacherId?: string;
  schoolYearId?: string;
  page?: number;
  pageSize?: number;
}

const paginate = (query: ListQuery = {}) => {
  const page = Math.max(query.page ?? 1, 1);
  const pageSize = Math.min(Math.max(query.pageSize ?? 20, 1), 100);
  return { page, pageSize, skip: (page - 1) * pageSize };
};

const ensureSchoolId = (schoolId: string | null | undefined) => {
  if (!schoolId) throw new AppError('School context is required', 403);
  return schoolId;
};

const schoolWideAcademicRoles: UserRole[] = ['SCHOOL_ADMIN', 'DIRECTOR', 'SECRETARY', 'ACCOUNTANT'];

const getAcademicScope = async (user: AuthUser) => {
  const schoolId = ensureSchoolId(user.schoolId);
  if (schoolWideAcademicRoles.includes(user.role)) {
    return { schoolId, schoolWide: true, classIds: [] as string[], categories: [] as StudentCategory[] };
  }

  if (user.role === 'TEACHER' || user.role === 'CLASS_TUTOR') {
    const teacher = await prisma.teacher.findFirst({
      where: { userId: user.id, schoolId },
      include: { classes: { select: { id: true } } }
    });
    if (!teacher) return { schoolId, schoolWide: false, classIds: [], categories: [] as StudentCategory[] };
    const ownedClasses = await prisma.class.findMany({ where: { schoolId, teacherId: teacher.id }, select: { id: true } });
    return {
      schoolId,
      schoolWide: false,
      classIds: Array.from(new Set([...teacher.classes.map((item) => item.id), ...ownedClasses.map((item) => item.id)])),
      categories: [] as StudentCategory[]
    };
  }

  if (user.role === 'PARENT') {
    const parent = await prisma.parent.findFirst({
      where: { userId: user.id, schoolId },
      include: { children: { include: { student: { select: { classId: true, category: true } } } } }
    });
    const students = parent?.children.map((link) => link.student) ?? [];
    return {
      schoolId,
      schoolWide: false,
      classIds: Array.from(new Set(students.map((student) => student.classId).filter(Boolean) as string[])),
      categories: Array.from(new Set(students.map((student) => student.category)))
    };
  }

  if (user.role === 'STUDENT') {
    const student = await prisma.student.findFirst({ where: { userId: user.id, schoolId }, select: { classId: true, category: true } });
    return {
      schoolId,
      schoolWide: false,
      classIds: student?.classId ? [student.classId] : [],
      categories: student?.category ? [student.category] : []
    };
  }

  return { schoolId, schoolWide: false, classIds: [] as string[], categories: [] as StudentCategory[] };
};

const applyClassScope = <T extends { schoolId: string; classId?: string | { in: string[] } | null }>(where: T, scope: Awaited<ReturnType<typeof getAcademicScope>>, requestedClassId?: string) => {
  if (requestedClassId) {
    where.classId = scope.schoolWide || scope.classIds.includes(requestedClassId) ? requestedClassId : { in: [] };
    return where;
  }
  if (!scope.schoolWide) where.classId = { in: scope.classIds };
  return where;
};

export const academicService = {
  async listSubjects(user: AuthUser, query: ListQuery = {}) {
    const scope = await getAcademicScope(user);
    const schoolId = scope.schoolId;
    const { page, pageSize, skip } = paginate(query);
    const where: Prisma.SubjectWhereInput = applyClassScope({ schoolId }, scope, query.classId);
    if (query.teacherId && (scope.schoolWide || user.role === 'TEACHER' || user.role === 'CLASS_TUTOR')) where.teacherId = query.teacherId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({ where, include: { class: true, teacher: true }, orderBy: [{ name: 'asc' }], skip, take: pageSize }),
      prisma.subject.count({ where })
    ]);
    return { subjects, pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) } };
  },

  async createSubject(schoolIdInput: string | null | undefined, input: { name: string; code: string; classId?: string; teacherId?: string; coefficient?: number; description?: string }) {
    const schoolId = ensureSchoolId(schoolIdInput);
    return prisma.subject.create({
      data: {
        schoolId,
        name: input.name,
        code: input.code,
        classId: input.classId,
        teacherId: input.teacherId,
        coefficient: input.coefficient ?? 1,
        description: input.description
      },
      include: { class: true, teacher: true }
    });
  },

  async listSchoolYears(user: AuthUser, query: ListQuery = {}) {
    const schoolId = ensureSchoolId(user.schoolId);
    const { page, pageSize, skip } = paginate(query);
    const where: Record<string, unknown> = { schoolId };
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    const [schoolYears, total] = await Promise.all([
      prisma.schoolYear.findMany({ where, include: { terms: { orderBy: { order: 'asc' } } }, orderBy: [{ isActive: 'desc' }, { name: 'desc' }], skip, take: pageSize }),
      prisma.schoolYear.count({ where })
    ]);
    return { schoolYears, pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) } };
  },

  async createSchoolYear(schoolIdInput: string | null | undefined, input: { name: string; startsAt?: string; endsAt?: string; isActive?: boolean }) {
    const schoolId = ensureSchoolId(schoolIdInput);
    if (input.isActive) await prisma.schoolYear.updateMany({ where: { schoolId }, data: { isActive: false } });
    return prisma.schoolYear.create({
      data: {
        schoolId,
        name: input.name,
        startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
        endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
        isActive: input.isActive ?? false
      },
      include: { terms: true }
    });
  },

  async createTerm(schoolIdInput: string | null | undefined, input: { schoolYearId: string; name: string; startsAt?: string; endsAt?: string; order?: number; isActive?: boolean }) {
    const schoolId = ensureSchoolId(schoolIdInput);
    const schoolYear = await prisma.schoolYear.findFirst({ where: { id: input.schoolYearId, schoolId } });
    if (!schoolYear) throw new AppError('School year not found', 404);
    if (input.isActive) await prisma.schoolTerm.updateMany({ where: { schoolId, schoolYearId: input.schoolYearId }, data: { isActive: false } });
    return prisma.schoolTerm.create({
      data: {
        schoolId,
        schoolYearId: input.schoolYearId,
        name: input.name,
        startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
        endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
        order: input.order ?? 1,
        isActive: input.isActive ?? false
      }
    });
  },

  async listTimetable(user: AuthUser, query: ListQuery = {}) {
    const scope = await getAcademicScope(user);
    const schoolId = scope.schoolId;
    const { page, pageSize, skip } = paginate(query);
    const where: Prisma.TimetableEntryWhereInput = applyClassScope({ schoolId }, scope, query.classId);
    if (query.teacherId && (scope.schoolWide || user.role === 'TEACHER' || user.role === 'CLASS_TUTOR')) where.teacherId = query.teacherId;
    const [entries, total] = await Promise.all([
      prisma.timetableEntry.findMany({ where, include: { class: true, subject: true, teacher: true }, orderBy: [{ dayOfWeek: 'asc' }, { startsAt: 'asc' }], skip, take: pageSize }),
      prisma.timetableEntry.count({ where })
    ]);
    return { entries, pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) } };
  },

  async createTimetableEntry(schoolIdInput: string | null | undefined, input: { classId: string; subjectId: string; teacherId?: string; dayOfWeek: number; startsAt: string; endsAt: string; room?: string; term?: string; notes?: string }) {
    const schoolId = ensureSchoolId(schoolIdInput);
    return prisma.timetableEntry.create({ data: { schoolId, ...input }, include: { class: true, subject: true, teacher: true } });
  },

  async listAssignments(user: AuthUser, query: ListQuery = {}) {
    const scope = await getAcademicScope(user);
    const schoolId = scope.schoolId;
    const { page, pageSize, skip } = paginate(query);
    const where: Prisma.AssignmentWhereInput = applyClassScope({ schoolId }, scope, query.classId);
    if (query.teacherId && (scope.schoolWide || user.role === 'TEACHER' || user.role === 'CLASS_TUTOR')) where.teacherId = query.teacherId;
    if (query.search) where.title = { contains: query.search, mode: 'insensitive' };
    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({ where, include: { class: true, subject: true, teacher: true, _count: { select: { submissions: true, grades: true } } }, orderBy: [{ dueDate: 'asc' }], skip, take: pageSize }),
      prisma.assignment.count({ where })
    ]);
    return { assignments, pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) } };
  },

  async createAssignment(schoolIdInput: string | null | undefined, input: { teacherId: string; classId: string; subjectId: string; title: string; description?: string; dueDate: string; maxScore: number; term: string; attachmentUrl?: string }) {
    const schoolId = ensureSchoolId(schoolIdInput);
    return prisma.assignment.create({ data: { schoolId, ...input, dueDate: new Date(input.dueDate) }, include: { class: true, subject: true, teacher: true } });
  },

  async listFees(user: AuthUser, query: ListQuery = {}) {
    const scope = await getAcademicScope(user);
    const schoolId = scope.schoolId;
    const { page, pageSize, skip } = paginate(query);
    const where: Prisma.FeeWhereInput = { schoolId };
    if (query.classId) {
      where.classId = scope.schoolWide || scope.classIds.includes(query.classId) ? query.classId : { in: [] };
    } else if (!scope.schoolWide) {
      where.OR = [
        { classId: { in: scope.classIds } },
        { category: { in: scope.categories } }
      ];
    }
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    const [fees, total] = await Promise.all([
      prisma.fee.findMany({ where, include: { class: true, _count: { select: { payments: true } } }, orderBy: [{ dueDate: 'asc' }, { name: 'asc' }], skip, take: pageSize }),
      prisma.fee.count({ where })
    ]);
    return { fees, pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) } };
  },

  async createFee(schoolIdInput: string | null | undefined, input: { name: string; amount: number; billingCycle?: 'trimester' | 'annual' | 'monthly' | 'one_time'; classId?: string; category?: string; term?: string; dueDate?: string; description?: string }) {
    const schoolId = ensureSchoolId(schoolIdInput);
    return prisma.fee.create({
      data: {
        schoolId,
        name: input.name,
        amount: input.amount,
        billingCycle: input.billingCycle?.toUpperCase() as 'TRIMESTER' | 'ANNUAL' | 'MONTHLY' | 'ONE_TIME' | undefined,
        classId: input.classId,
        category: input.category?.toUpperCase() as never,
        term: input.term,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        description: input.description
      },
      include: { class: true }
    });
  }
};

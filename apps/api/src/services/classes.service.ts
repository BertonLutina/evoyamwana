import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import type { AuthUser } from '@evoyamwana/shared';

export interface ClassInput {
  name: string;
  level: string;
  section?: string;
  academicYear: string;
  teacherId?: string;
  room?: string;
  capacity?: number;
  cycle?: string;
  option?: string;
  shift?: string;
  description?: string;
}

export interface ClassListQuery {
  search?: string;
  academicYear?: string;
  page?: number;
  pageSize?: number;
}

const includeClassRelations = {
  teacher: {
    include: {
      user: {
        select: {
          email: true
        }
      }
    }
  },
  subjects: true,
  students: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentCode: true
    },
    orderBy: [{ lastName: 'asc' as const }, { firstName: 'asc' as const }]
  },
  _count: {
    select: {
      students: true,
      subjects: true
    }
  }
};

const ensureSchoolId = (schoolId: string | null | undefined) => {
  if (!schoolId) {
    throw new AppError('School context is required', 403);
  }

  return schoolId;
};

const buildWhere = (schoolId: string, query: ClassListQuery = {}, user?: AuthUser) => {
  const where: Record<string, unknown> = { schoolId };

  if (user?.role === 'TEACHER' || user?.role === 'CLASS_TUTOR') {
    const teacherFilter = { userId: user.id, schoolId };
    where.teacher = teacherFilter;
  }

  if (user?.role === 'STUDENT') {
    where.students = { some: { userId: user.id, schoolId, isActive: true } };
  }

  if (user?.role === 'PARENT') {
    where.students = {
      some: {
        parents: {
          some: {
            parent: { userId: user.id, schoolId }
          }
        }
      }
    };
  }

  if (query.academicYear) {
    where.academicYear = query.academicYear;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { level: { contains: query.search, mode: 'insensitive' } },
      { section: { contains: query.search, mode: 'insensitive' } },
      { room: { contains: query.search, mode: 'insensitive' } },
      { cycle: { contains: query.search, mode: 'insensitive' } },
      { option: { contains: query.search, mode: 'insensitive' } },
      { teacher: { firstName: { contains: query.search, mode: 'insensitive' } } },
      { teacher: { lastName: { contains: query.search, mode: 'insensitive' } } }
    ];
  }

  return where;
};

export const classesService = {
  async getClass(user: AuthUser, id: string) {
    const schoolId = ensureSchoolId(user.schoolId);

    const classRecord = await prisma.class.findFirst({
      where: { id, ...buildWhere(schoolId, {}, user) },
      include: includeClassRelations
    });

    if (!classRecord) {
      throw new AppError('Class not found', 404);
    }

    return classRecord;
  },

  async listClasses(user: AuthUser, query: ClassListQuery = {}) {
    const schoolId = ensureSchoolId(user.schoolId);
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 100);
    const where = buildWhere(schoolId, query, user);

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: includeClassRelations,
        orderBy: [{ academicYear: 'desc' }, { level: 'asc' }, { name: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.class.count({ where })
    ]);

    return {
      classes,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1)
      }
    };
  },

  async createClass(schoolId: string, input: ClassInput) {
    ensureSchoolId(schoolId);

    if (input.teacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: {
          id: input.teacherId,
          schoolId
        }
      });

      if (!teacher) {
        throw new AppError('Teacher not found for this school', 400);
      }
    }

    const duplicate = await prisma.class.findFirst({
      where: {
        schoolId,
        name: input.name,
        academicYear: input.academicYear
      }
    });

    if (duplicate) {
      throw new AppError('A class with this name already exists for this academic year', 409);
    }

    return prisma.class.create({
      data: {
        schoolId,
        teacherId: input.teacherId,
        name: input.name,
        level: input.level,
        section: input.section,
        academicYear: input.academicYear,
        room: input.room,
        capacity: input.capacity,
        cycle: input.cycle,
        option: input.option,
        shift: input.shift,
        description: input.description
      },
      include: includeClassRelations
    });
  }
};

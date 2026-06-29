import bcrypt from 'bcryptjs';
import type { AuthUser, TeacherProfileInput } from '@evoyamwana/shared';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export interface TeacherInput {
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber: string;
  phone?: string;
  password?: string;
  birthDate?: string | null;
  birthPlace?: string | null;
  gender?: string | null;
  nationality?: string | null;
  address?: string | null;
  photoUrl?: string | null;
  hireDate?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  nationalId?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  bio?: string | null;
  employmentStatus?: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
}

export interface TeacherListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

const includeTeacherRelations = {
  user: {
    select: {
      id: true,
      email: true,
      fullName: true
    }
  },
  classes: true,
  subjects: true
};

const toDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const compact = <T extends Record<string, unknown>>(data: T) =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));

const ensureSchoolId = (schoolId: string | null | undefined) => {
  if (!schoolId) {
    throw new AppError('School context is required', 403);
  }

  return schoolId;
};

const buildWhere = (schoolId: string, query: TeacherListQuery = {}) => {
  const where: Record<string, unknown> = { schoolId };

  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { employeeNumber: { contains: query.search, mode: 'insensitive' } },
      { user: { email: { contains: query.search, mode: 'insensitive' } } }
    ];
  }

  return where;
};

const teacherProfileData = (input: TeacherProfileInput) =>
  compact({
    firstName: input.firstName,
    lastName: input.lastName,
    employeeNumber: input.employeeNumber,
    phone: input.phone,
    birthDate: input.birthDate !== undefined ? toDate(input.birthDate) : undefined,
    birthPlace: input.birthPlace,
    gender: input.gender,
    nationality: input.nationality,
    address: input.address,
    photoUrl: input.photoUrl,
    hireDate: input.hireDate !== undefined ? toDate(input.hireDate) : undefined,
    qualification: input.qualification,
    specialization: input.specialization,
    nationalId: input.nationalId,
    emergencyContactName: input.emergencyContactName,
    emergencyContactPhone: input.emergencyContactPhone,
    bio: input.bio,
    employmentStatus: input.employmentStatus
  });

const teacherSelfProfileData = (input: TeacherProfileInput) =>
  compact({
    phone: input.phone,
    birthDate: input.birthDate !== undefined ? toDate(input.birthDate) : undefined,
    birthPlace: input.birthPlace,
    gender: input.gender,
    nationality: input.nationality,
    address: input.address,
    photoUrl: input.photoUrl,
    emergencyContactName: input.emergencyContactName,
    emergencyContactPhone: input.emergencyContactPhone,
    bio: input.bio
  });

export const teachersService = {
  async getCurrentTeacher(user: AuthUser) {
    const schoolId = ensureSchoolId(user.schoolId);
    if (user.role !== 'TEACHER' && user.role !== 'CLASS_TUTOR') {
      throw new AppError('Teacher access is required', 403);
    }

    const teacher = await prisma.teacher.findFirst({
      where: { userId: user.id, schoolId },
      include: includeTeacherRelations
    });

    if (!teacher) {
      throw new AppError('Teacher profile not found', 404);
    }

    return teacher;
  },

  async getTeacher(schoolId: string, id: string) {
    ensureSchoolId(schoolId);
    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId },
      include: includeTeacherRelations
    });

    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    return teacher;
  },

  async listTeachers(schoolId: string, query: TeacherListQuery = {}) {
    ensureSchoolId(schoolId);
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 100);
    const where = buildWhere(schoolId, query);

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: includeTeacherRelations,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.teacher.count({ where })
    ]);

    return {
      teachers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1)
      }
    };
  },

  async createTeacher(schoolId: string, input: TeacherInput) {
    ensureSchoolId(schoolId);

    const duplicateUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (duplicateUser) {
      throw new AppError('A user with this email already exists', 409);
    }

    const duplicateTeacher = await prisma.teacher.findFirst({
      where: {
        schoolId,
        employeeNumber: input.employeeNumber
      }
    });
    if (duplicateTeacher) {
      throw new AppError('A teacher with this employee number already exists', 409);
    }

    const passwordHash = await bcrypt.hash(input.password || 'DemoPass123!', 12);
    const fullName = `${input.firstName} ${input.lastName}`;

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName,
          email: input.email,
          passwordHash,
          role: 'TEACHER',
          schoolId
        }
      });

      return tx.teacher.create({
        data: {
          schoolId,
          userId: user.id,
          employeeNumber: input.employeeNumber,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          birthDate: toDate(input.birthDate),
          birthPlace: input.birthPlace,
          gender: input.gender,
          nationality: input.nationality,
          address: input.address,
          photoUrl: input.photoUrl,
          hireDate: toDate(input.hireDate),
          qualification: input.qualification,
          specialization: input.specialization,
          nationalId: input.nationalId,
          emergencyContactName: input.emergencyContactName,
          emergencyContactPhone: input.emergencyContactPhone,
          bio: input.bio,
          employmentStatus: input.employmentStatus ?? 'ACTIVE'
        },
        include: includeTeacherRelations
      });
    });
  },

  async updateCurrentTeacher(user: AuthUser, input: TeacherProfileInput) {
    const teacher = await this.getCurrentTeacher(user);

    return prisma.teacher.update({
      where: { id: teacher.id },
      data: teacherSelfProfileData(input),
      include: includeTeacherRelations
    });
  },

  async updateTeacher(schoolId: string, id: string, input: TeacherProfileInput) {
    ensureSchoolId(schoolId);
    const existing = await this.getTeacher(schoolId, id);

    if (input.email && input.email !== existing.user?.email) {
      const duplicateUser = await prisma.user.findUnique({ where: { email: input.email } });
      if (duplicateUser && duplicateUser.id !== existing.userId) {
        throw new AppError('A user with this email already exists', 409);
      }
    }

    if (input.employeeNumber && input.employeeNumber !== existing.employeeNumber) {
      const duplicateTeacher = await prisma.teacher.findFirst({
        where: { schoolId, employeeNumber: input.employeeNumber, id: { not: id } }
      });
      if (duplicateTeacher) {
        throw new AppError('A teacher with this employee number already exists', 409);
      }
    }

    return prisma.$transaction(async (tx) => {
      const nextFirst = input.firstName ?? existing.firstName;
      const nextLast = input.lastName ?? existing.lastName;

      if (input.email || input.firstName || input.lastName || input.password) {
        await tx.user.update({
          where: { id: existing.userId },
          data: compact({
            email: input.email,
            fullName: input.firstName || input.lastName ? `${nextFirst} ${nextLast}` : undefined,
            passwordHash: input.password ? await bcrypt.hash(input.password, 12) : undefined
          })
        });
      }

      return tx.teacher.update({
        where: { id },
        data: teacherProfileData(input),
        include: includeTeacherRelations
      });
    });
  },

  async deleteTeacher(schoolId: string, id: string) {
    ensureSchoolId(schoolId);
    await this.getTeacher(schoolId, id);

    return prisma.teacher.update({
      where: { id },
      data: { employmentStatus: 'INACTIVE' },
      include: includeTeacherRelations
    });
  }
};

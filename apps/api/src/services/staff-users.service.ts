import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import type { AuthUser, UserRole } from '@evoyamwana/shared';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

const schoolStaffRoles = [
  'DIRECTOR',
  'SECRETARY',
  'ACCOUNTANT',
  'CLASS_TUTOR',
  'DISCIPLINE_OFFICER',
  'LIBRARIAN',
  'NURSE',
  'TRANSPORT_MANAGER',
  'CANTEEN_MANAGER'
] as const satisfies readonly UserRole[];

export type StaffUserRole = (typeof schoolStaffRoles)[number] | 'SCHOOL_ADMIN';

export interface StaffUserInput {
  fullName: string;
  email: string;
  password?: string;
  role: StaffUserRole;
  schoolId?: string;
}

const staffRoleSet = new Set<UserRole>(schoolStaffRoles);

const canCreateRole = (creator: AuthUser, role: StaffUserRole) => {
  if (creator.role === 'SUPER_ADMIN') return role === 'SCHOOL_ADMIN' || staffRoleSet.has(role);
  if (creator.role === 'SCHOOL_ADMIN' || creator.role === 'SECRETARY') return staffRoleSet.has(role);
  return false;
};

const resolveTargetSchoolId = (creator: AuthUser, input: StaffUserInput) => {
  if (creator.role === 'SUPER_ADMIN') {
    if (!input.schoolId) throw new AppError('School is required for this staff account', 400);
    return input.schoolId;
  }

  if (!creator.schoolId) throw new AppError('School context is required', 403);
  return creator.schoolId;
};

export const staffUsersService = {
  async createStaffUser(creator: AuthUser, input: StaffUserInput) {
    if (!canCreateRole(creator, input.role)) {
      throw new AppError('You are not allowed to create this role', 403);
    }

    const schoolId = resolveTargetSchoolId(creator, input);
    const [school, duplicateUser] = await Promise.all([
      prisma.school.findUnique({ where: { id: schoolId }, select: { id: true, name: true } }),
      prisma.user.findUnique({ where: { email: input.email } })
    ]);

    if (!school) throw new AppError('School not found', 404);
    if (duplicateUser) throw new AppError('A user with this email already exists', 409);

    const passwordHash = await bcrypt.hash(input.password || 'DemoPass123!', 12);

    return prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        passwordHash,
        role: input.role,
        schoolId
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        school: { select: { id: true, name: true, city: true } }
      }
    });
  },

  async listStaffUsers(user: AuthUser) {
    const superAdminRoles: UserRole[] = ['SCHOOL_ADMIN', ...schoolStaffRoles];
    const staffRoles: UserRole[] = [...schoolStaffRoles];
    const where: Prisma.UserWhereInput = user.role === 'SUPER_ADMIN'
      ? { role: { in: superAdminRoles } }
      : { schoolId: user.schoolId, role: { in: staffRoles } };

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        school: { select: { id: true, name: true, city: true } }
      },
      orderBy: [{ role: 'asc' }, { fullName: 'asc' }]
    });
  }
};

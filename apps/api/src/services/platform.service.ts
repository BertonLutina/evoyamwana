import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export interface PlatformListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

const paginate = (query: PlatformListQuery = {}) => {
  const page = Math.max(query.page ?? 1, 1);
  const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 100);
  return { page, pageSize, skip: (page - 1) * pageSize };
};

export const platformService = {
  async listSchoolRegistrationRequests(query: PlatformListQuery & { status?: string } = {}) {
    const { page, pageSize, skip } = paginate(query);
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { schoolName: { contains: query.search, mode: 'insensitive' } },
        { legalName: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
        { country: { contains: query.search, mode: 'insensitive' } },
        { schoolEmail: { contains: query.search, mode: 'insensitive' } },
        { ownerFullName: { contains: query.search, mode: 'insensitive' } },
        { ownerEmail: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.schoolRegistrationRequest.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: pageSize
      }),
      prisma.schoolRegistrationRequest.count({ where })
    ]);

    return { requests, pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) } };
  },

  async approveSchoolRegistrationRequest(requestId: string, reviewerUserId: string) {
    const request = await prisma.schoolRegistrationRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new AppError('School registration request not found', 404);
    if (request.status !== 'PENDING') throw new AppError('This request has already been reviewed', 409);

    const existingSchool = await prisma.school.findUnique({ where: { email: request.schoolEmail } });
    const existingUser = await prisma.user.findUnique({ where: { email: request.ownerEmail } });
    if (existingSchool || existingUser) {
      throw new AppError('A school or user with this email already exists', 409);
    }

    return prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: request.schoolName,
          country: request.country,
          city: request.city,
          email: request.schoolEmail,
          phone: request.schoolPhone,
          address: request.address,
          legalName: request.legalName,
          schoolType: request.schoolType,
          schoolStatus: request.schoolStatus,
          accreditationNumber: request.accreditationNumber
        }
      });

      const admin = await tx.user.create({
        data: {
          fullName: request.ownerFullName,
          email: request.ownerEmail,
          passwordHash: request.ownerPasswordHash,
          role: 'SCHOOL_ADMIN',
          schoolId: school.id
        }
      });

      const approved = await tx.schoolRegistrationRequest.update({
        where: { id: request.id },
        data: {
          status: 'APPROVED',
          reviewedByUserId: reviewerUserId,
          reviewedAt: new Date(),
          approvedSchoolId: school.id,
          approvedAdminUserId: admin.id
        }
      });

      return { request: approved, school, admin: { id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role } };
    });
  },

  async rejectSchoolRegistrationRequest(requestId: string, reviewerUserId: string, reason?: string) {
    const request = await prisma.schoolRegistrationRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new AppError('School registration request not found', 404);
    if (request.status !== 'PENDING') throw new AppError('This request has already been reviewed', 409);

    return prisma.schoolRegistrationRequest.update({
      where: { id: request.id },
      data: {
        status: 'REJECTED',
        reviewedByUserId: reviewerUserId,
        reviewedAt: new Date(),
        rejectionReason: reason
      }
    });
  },

  async listSchools(query: PlatformListQuery = {}) {
    const { page, pageSize, skip } = paginate(query);
    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { city: { contains: query.search, mode: 'insensitive' as const } },
            { country: { contains: query.search, mode: 'insensitive' as const } },
            { email: { contains: query.search, mode: 'insensitive' as const } }
          ]
        }
      : {};

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        include: {
          _count: {
            select: { users: true, students: true, teachers: true, parents: true, classes: true }
          }
        },
        orderBy: [{ name: 'asc' }],
        skip,
        take: pageSize
      }),
      prisma.school.count({ where })
    ]);

    return { schools, pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) } };
  },

  async listAdmins(query: PlatformListQuery = {}) {
    return this.listUsers({ ...query, role: 'SCHOOL_ADMIN' });
  },

  async listUsers(query: PlatformListQuery & { role?: string } = {}) {
    const { page, pageSize, skip } = paginate(query);
    const where: Record<string, unknown> = {};
    if (query.role) where.role = query.role;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { school: { name: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
          school: { select: { id: true, name: true, city: true } }
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: pageSize
      }),
      prisma.user.count({ where })
    ]);

    return { users, pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) } };
  },

  async getReports() {
    const [schools, users, students, teachers, parents, classes, attendance, grades, messages] = await Promise.all([
      prisma.school.count(),
      prisma.user.count(),
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count(),
      prisma.parent.count(),
      prisma.class.count(),
      prisma.attendance.count(),
      prisma.grade.count(),
      prisma.message.count()
    ]);

    const roleBreakdown = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
      orderBy: { role: 'asc' }
    });

    return { totals: { schools, users, students, teachers, parents, classes, attendance, grades, messages }, roleBreakdown };
  }
};

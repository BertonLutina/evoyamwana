import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export interface ParentInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  password?: string;
}

export interface ParentListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

const includeParentRelations = {
  user: {
    select: {
      id: true,
      email: true,
      fullName: true
    }
  },
  children: {
    include: {
      student: {
        include: {
          class: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  }
};

const ensureSchoolId = (schoolId: string | null | undefined) => {
  if (!schoolId) {
    throw new AppError('School context is required', 403);
  }
};

const buildWhere = (schoolId: string, query: ParentListQuery = {}) => {
  const where: Record<string, unknown> = { schoolId };

  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
      { user: { email: { contains: query.search, mode: 'insensitive' } } },
      {
        children: {
          some: {
            student: {
              OR: [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
                { studentCode: { contains: query.search, mode: 'insensitive' } }
              ]
            }
          }
        }
      }
    ];
  }

  return where;
};

export const parentsService = {
  async getParent(schoolId: string, id: string) {
    ensureSchoolId(schoolId);
    const parent = await prisma.parent.findFirst({
      where: { id, schoolId },
      include: includeParentRelations
    });

    if (!parent) {
      throw new AppError('Parent not found', 404);
    }

    return parent;
  },

  async listParents(schoolId: string, query: ParentListQuery = {}) {
    ensureSchoolId(schoolId);
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 100);
    const where = buildWhere(schoolId, query);

    const [parents, total] = await Promise.all([
      prisma.parent.findMany({
        where,
        include: includeParentRelations,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.parent.count({ where })
    ]);

    return {
      parents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1)
      }
    };
  },

  async createParent(schoolId: string, input: ParentInput) {
    ensureSchoolId(schoolId);

    const duplicateUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (duplicateUser) {
      throw new AppError('A user with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(input.password || 'DemoPass123!', 12);
    const fullName = `${input.firstName} ${input.lastName}`;

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName,
          email: input.email,
          passwordHash,
          role: 'PARENT',
          schoolId
        }
      });

      return tx.parent.create({
        data: {
          schoolId,
          userId: user.id,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          address: input.address
        },
        include: includeParentRelations
      });
    });
  }
};

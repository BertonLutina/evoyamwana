import type { AuthUser } from '@evoyamwana/shared';
import type { DirectorReportType, SchoolHealthSeverity, SchoolHealthStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export interface DirectorReportInput {
  type: DirectorReportType;
  title: string;
  summary: string;
  period: string;
  owner?: string | null;
  status?: SchoolHealthStatus;
  priority?: SchoolHealthSeverity;
  dueDate?: string | null;
}

export interface DirectorReportQuery {
  search?: string;
  type?: DirectorReportType;
  status?: SchoolHealthStatus;
  priority?: SchoolHealthSeverity;
  page?: number;
  pageSize?: number;
}

const requireSchoolId = (user: AuthUser) => {
  if (!user.schoolId) throw new AppError('School context is required', 403);
  return user.schoolId;
};

const toDate = (value?: string | null) => (value ? new Date(value) : null);

const buildWhere = (user: AuthUser, query: DirectorReportQuery = {}) => {
  const schoolId = requireSchoolId(user);
  const where: Record<string, unknown> = { schoolId };
  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { summary: { contains: query.search, mode: 'insensitive' } },
      { owner: { contains: query.search, mode: 'insensitive' } },
      { period: { contains: query.search, mode: 'insensitive' } }
    ];
  }
  return { schoolId, where };
};

export const directorReportsService = {
  async list(user: AuthUser, query: DirectorReportQuery) {
    const { where } = buildWhere(user, query);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const [reports, total] = await Promise.all([
      prisma.schoolDirectorReport.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize
      }),
      prisma.schoolDirectorReport.count({ where })
    ]);
    return { reports, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 } };
  },

  async summary(user: AuthUser) {
    const schoolId = requireSchoolId(user);
    const [total, open, published, critical, byType, byStatus] = await Promise.all([
      prisma.schoolDirectorReport.count({ where: { schoolId } }),
      prisma.schoolDirectorReport.count({ where: { schoolId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.schoolDirectorReport.count({ where: { schoolId, status: 'RESOLVED' } }),
      prisma.schoolDirectorReport.count({ where: { schoolId, priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'ARCHIVED'] } } }),
      prisma.schoolDirectorReport.groupBy({ by: ['type'], where: { schoolId }, _count: { _all: true } }),
      prisma.schoolDirectorReport.groupBy({ by: ['status'], where: { schoolId }, _count: { _all: true } })
    ]);
    return { totals: { total, open, published, critical }, byType, byStatus };
  },

  async get(user: AuthUser, id: string) {
    const schoolId = requireSchoolId(user);
    const report = await prisma.schoolDirectorReport.findFirst({ where: { id, schoolId } });
    if (!report) throw new AppError('Director report not found', 404);
    return report;
  },

  async create(user: AuthUser, input: DirectorReportInput) {
    const schoolId = requireSchoolId(user);
    const status = input.status ?? 'OPEN';
    return prisma.schoolDirectorReport.create({
      data: {
        schoolId,
        type: input.type,
        title: input.title,
        summary: input.summary,
        period: input.period,
        owner: input.owner || null,
        status,
        priority: input.priority ?? 'MEDIUM',
        dueDate: toDate(input.dueDate),
        publishedAt: status === 'RESOLVED' ? new Date() : null
      }
    });
  },

  async update(user: AuthUser, id: string, input: Partial<DirectorReportInput>) {
    const current = await this.get(user, id);
    const nextStatus = input.status ?? current.status;
    return prisma.schoolDirectorReport.update({
      where: { id: current.id },
      data: {
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.period !== undefined ? { period: input.period } : {}),
        ...(input.owner !== undefined ? { owner: input.owner || null } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.dueDate !== undefined ? { dueDate: toDate(input.dueDate) } : {}),
        publishedAt: nextStatus === 'RESOLVED' && !current.publishedAt ? new Date() : nextStatus !== 'RESOLVED' ? null : current.publishedAt
      }
    });
  },

  async archive(user: AuthUser, id: string) {
    const current = await this.get(user, id);
    return prisma.schoolDirectorReport.update({
      where: { id: current.id },
      data: { status: 'ARCHIVED' }
    });
  }
};

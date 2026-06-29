import type { AuthUser } from '@evoyamwana/shared';
import type { SchoolHealthSeverity, SchoolHealthStatus, SchoolSector } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export interface SectorDossierInput {
  sector: SchoolSector;
  title: string;
  description: string;
  owner?: string | null;
  status?: SchoolHealthStatus;
  priority?: SchoolHealthSeverity;
  dueDate?: string | null;
}

export interface SectorDossierQuery {
  search?: string;
  sector?: SchoolSector;
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

const buildWhere = (user: AuthUser, query: SectorDossierQuery = {}) => {
  const schoolId = requireSchoolId(user);
  const where: Record<string, unknown> = { schoolId };
  if (query.sector) where.sector = query.sector;
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { owner: { contains: query.search, mode: 'insensitive' } }
    ];
  }
  return { schoolId, where };
};

export const sectorDossiersService = {
  async list(user: AuthUser, query: SectorDossierQuery) {
    const { where } = buildWhere(user, query);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const [dossiers, total] = await Promise.all([
      prisma.schoolSectorDossier.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize
      }),
      prisma.schoolSectorDossier.count({ where })
    ]);
    return { dossiers, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 } };
  },

  async summary(user: AuthUser) {
    const schoolId = requireSchoolId(user);
    const [total, open, critical, bySector, byStatus] = await Promise.all([
      prisma.schoolSectorDossier.count({ where: { schoolId } }),
      prisma.schoolSectorDossier.count({ where: { schoolId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.schoolSectorDossier.count({ where: { schoolId, priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'ARCHIVED'] } } }),
      prisma.schoolSectorDossier.groupBy({ by: ['sector'], where: { schoolId }, _count: { _all: true } }),
      prisma.schoolSectorDossier.groupBy({ by: ['status'], where: { schoolId }, _count: { _all: true } })
    ]);
    return { totals: { total, open, critical }, bySector, byStatus };
  },

  async get(user: AuthUser, id: string) {
    const schoolId = requireSchoolId(user);
    const dossier = await prisma.schoolSectorDossier.findFirst({ where: { id, schoolId } });
    if (!dossier) throw new AppError('Sector dossier not found', 404);
    return dossier;
  },

  async create(user: AuthUser, input: SectorDossierInput) {
    const schoolId = requireSchoolId(user);
    return prisma.schoolSectorDossier.create({
      data: {
        schoolId,
        sector: input.sector,
        title: input.title,
        description: input.description,
        owner: input.owner || null,
        status: input.status ?? 'OPEN',
        priority: input.priority ?? 'MEDIUM',
        dueDate: toDate(input.dueDate)
      }
    });
  },

  async update(user: AuthUser, id: string, input: Partial<SectorDossierInput>) {
    const current = await this.get(user, id);
    const nextStatus = input.status ?? current.status;
    return prisma.schoolSectorDossier.update({
      where: { id: current.id },
      data: {
        ...(input.sector !== undefined ? { sector: input.sector } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.owner !== undefined ? { owner: input.owner || null } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.dueDate !== undefined ? { dueDate: toDate(input.dueDate) } : {}),
        closedAt: nextStatus === 'RESOLVED' && !current.closedAt ? new Date() : nextStatus !== 'RESOLVED' ? null : current.closedAt
      }
    });
  },

  async archive(user: AuthUser, id: string) {
    const current = await this.get(user, id);
    return prisma.schoolSectorDossier.update({
      where: { id: current.id },
      data: { status: 'ARCHIVED' }
    });
  }
};

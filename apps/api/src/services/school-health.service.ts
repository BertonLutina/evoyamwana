import type { AuthUser } from '@evoyamwana/shared';
import type { SchoolHealthCategory, SchoolHealthSeverity, SchoolHealthStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export interface SchoolHealthInput {
  title: string;
  description: string;
  category: SchoolHealthCategory;
  status?: SchoolHealthStatus;
  severity?: SchoolHealthSeverity;
  owner?: string | null;
  dueDate?: string | null;
}

export interface SchoolHealthQuery {
  search?: string;
  category?: SchoolHealthCategory;
  status?: SchoolHealthStatus;
  severity?: SchoolHealthSeverity;
  page?: number;
  pageSize?: number;
}

type SchoolHealthProgressRecord = {
  status: SchoolHealthStatus;
  severity: SchoolHealthSeverity;
  createdAt: Date | string;
  updatedAt: Date | string;
  resolvedAt?: Date | string | null;
};

const severityPenaltyByLevel: Record<SchoolHealthSeverity, number> = {
  LOW: 2,
  MEDIUM: 5,
  HIGH: 10,
  CRITICAL: 18
};

const schoolYearMonthLabels = ['Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'];

const getCurrentSchoolYearStart = () => {
  const today = new Date();
  return today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;
};

const getMonthEnd = (schoolYearStart: number, index: number) => new Date(index < 4 ? schoolYearStart : schoolYearStart + 1, (8 + index) % 12 + 1, 0, 23, 59, 59, 999);

const wasRecordActiveAt = (record: SchoolHealthProgressRecord, monthEnd: Date) => {
  if (new Date(record.createdAt) > monthEnd) return false;
  if (record.status === 'RESOLVED') return new Date(record.resolvedAt ?? record.updatedAt) > monthEnd;
  if (record.status === 'ARCHIVED') return new Date(record.updatedAt) > monthEnd;
  return true;
};

const requireSchoolId = (user: AuthUser) => {
  if (!user.schoolId) throw new AppError('School context is required', 403);
  return user.schoolId;
};

const toDate = (value?: string | null) => (value ? new Date(value) : null);

const buildWhere = (user: AuthUser, query: SchoolHealthQuery = {}) => {
  const schoolId = requireSchoolId(user);
  const where: Record<string, unknown> = { schoolId };

  if (query.category) where.category = query.category;
  if (query.status) where.status = query.status;
  if (query.severity) where.severity = query.severity;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { owner: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  return { schoolId, where };
};

export const calculateSchoolHealthScore = (records: Array<{ status: SchoolHealthStatus; severity: SchoolHealthSeverity }>) => {
  if (!records.length) return null;
  const penalty = records.reduce((total, record) => {
    if (record.status === 'RESOLVED' || record.status === 'ARCHIVED') return total;
    const severityPenalty = severityPenaltyByLevel[record.severity];
    return total + severityPenalty;
  }, 0);
  return Math.max(0, Math.min(100, 100 - penalty));
};

export const calculateSchoolHealthProgression = (records: SchoolHealthProgressRecord[], schoolYearStart = getCurrentSchoolYearStart()) => {
  const points = schoolYearMonthLabels.map((label, index) => {
    const monthEnd = getMonthEnd(schoolYearStart, index);
    const knownRecords = records.filter((record) => new Date(record.createdAt) <= monthEnd);
    if (!knownRecords.length) {
      return { label, score: null, monthEnd: monthEnd.toISOString() };
    }

    const penalty = knownRecords.filter((record) => wasRecordActiveAt(record, monthEnd)).reduce((total, record) => total + severityPenaltyByLevel[record.severity], 0);
    return { label, score: Math.max(0, Math.min(100, 100 - penalty)), monthEnd: monthEnd.toISOString() };
  });

  return {
    schoolYear: `${schoolYearStart}-${schoolYearStart + 1}`,
    labels: points.map((point) => point.label),
    values: points.map((point) => point.score),
    points
  };
};

export const schoolHealthService = {
  async list(user: AuthUser, query: SchoolHealthQuery) {
    const { where } = buildWhere(user, query);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [records, total] = await Promise.all([
      prisma.schoolHealthRecord.findMany({
        where,
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize
      }),
      prisma.schoolHealthRecord.count({ where })
    ]);

    return {
      records,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 }
    };
  },

  async summary(user: AuthUser) {
    const schoolId = requireSchoolId(user);
    const [records, byCategory, byStatus, bySeverity] = await Promise.all([
      prisma.schoolHealthRecord.findMany({
        where: { schoolId },
        select: { status: true, severity: true, category: true }
      }),
      prisma.schoolHealthRecord.groupBy({ by: ['category'], where: { schoolId }, _count: { _all: true } }),
      prisma.schoolHealthRecord.groupBy({ by: ['status'], where: { schoolId }, _count: { _all: true } }),
      prisma.schoolHealthRecord.groupBy({ by: ['severity'], where: { schoolId }, _count: { _all: true } })
    ]);

    const open = records.filter((record) => record.status === 'OPEN' || record.status === 'IN_PROGRESS').length;
    const critical = records.filter((record) => record.severity === 'CRITICAL' && record.status !== 'RESOLVED' && record.status !== 'ARCHIVED').length;

    return {
      score: calculateSchoolHealthScore(records),
      totals: {
        records: records.length,
        open,
        critical,
        resolved: records.filter((record) => record.status === 'RESOLVED').length
      },
      byCategory,
      byStatus,
      bySeverity
    };
  },

  async progression(user: AuthUser, schoolYearStart = getCurrentSchoolYearStart()) {
    const schoolId = requireSchoolId(user);
    const schoolYearEnd = getMonthEnd(schoolYearStart, schoolYearMonthLabels.length - 1);
    const records = await prisma.schoolHealthRecord.findMany({
      where: {
        schoolId,
        createdAt: { lte: schoolYearEnd }
      },
      select: {
        status: true,
        severity: true,
        createdAt: true,
        updatedAt: true,
        resolvedAt: true
      }
    });

    return calculateSchoolHealthProgression(records, schoolYearStart);
  },

  async get(user: AuthUser, id: string) {
    const schoolId = requireSchoolId(user);
    const record = await prisma.schoolHealthRecord.findFirst({ where: { id, schoolId } });
    if (!record) throw new AppError('School health record not found', 404);
    return record;
  },

  async create(user: AuthUser, input: SchoolHealthInput) {
    const schoolId = requireSchoolId(user);
    return prisma.schoolHealthRecord.create({
      data: {
        schoolId,
        title: input.title,
        description: input.description,
        category: input.category,
        status: input.status ?? 'OPEN',
        severity: input.severity ?? 'MEDIUM',
        owner: input.owner || null,
        dueDate: toDate(input.dueDate)
      }
    });
  },

  async update(user: AuthUser, id: string, input: Partial<SchoolHealthInput>) {
    const current = await this.get(user, id);
    const nextStatus = input.status ?? current.status;
    return prisma.schoolHealthRecord.update({
      where: { id: current.id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.severity !== undefined ? { severity: input.severity } : {}),
        ...(input.owner !== undefined ? { owner: input.owner || null } : {}),
        ...(input.dueDate !== undefined ? { dueDate: toDate(input.dueDate) } : {}),
        resolvedAt: nextStatus === 'RESOLVED' && !current.resolvedAt ? new Date() : nextStatus !== 'RESOLVED' ? null : current.resolvedAt
      }
    });
  },

  async archive(user: AuthUser, id: string) {
    const current = await this.get(user, id);
    return prisma.schoolHealthRecord.update({
      where: { id: current.id },
      data: { status: 'ARCHIVED' }
    });
  }
};

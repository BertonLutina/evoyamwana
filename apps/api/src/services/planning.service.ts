import type { AuthUser, UserRole } from '@evoyamwana/shared';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export interface PlanningInput {
  title: string;
  description?: string | null;
  location?: string | null;
  date: string;
  startMinutes: number;
  endMinutes: number;
  participantUserIds?: string[];
}

export interface PlanningQuery {
  from?: string;
  to?: string;
}

const ADMIN_ROLES: UserRole[] = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DIRECTOR', 'SECRETARY'];
const STAFF_ROLES: UserRole[] = ['TEACHER', 'CLASS_TUTOR', 'ACCOUNTANT', 'LIBRARIAN', 'NURSE', 'TRANSPORT_MANAGER', 'CANTEEN_MANAGER', 'DISCIPLINE_OFFICER'];
const SELF_ONLY_ROLES: UserRole[] = ['STUDENT', 'PARENT'];

const canTargetRole = (creatorRole: UserRole, targetRole: UserRole): boolean => {
  if (ADMIN_ROLES.includes(creatorRole)) return true;
  if (STAFF_ROLES.includes(creatorRole)) return targetRole === 'STUDENT' || STAFF_ROLES.includes(targetRole) || ADMIN_ROLES.includes(targetRole);
  return false;
};

const requireSchoolId = (user: AuthUser) => {
  if (!user.schoolId) throw new AppError('School context is required', 403);
  return user.schoolId;
};

const planningInclude = {
  creator: { select: { id: true, fullName: true, email: true, role: true } },
  participants: { include: { user: { select: { id: true, fullName: true, email: true, role: true } } } }
} as const;

const validateParticipants = async (user: AuthUser, schoolId: string, participantUserIds: string[]) => {
  const uniqueIds = Array.from(new Set(participantUserIds.filter((id) => id !== user.id)));
  if (!uniqueIds.length) return [] as string[];

  if (SELF_ONLY_ROLES.includes(user.role)) {
    throw new AppError('Vous ne pouvez créer un planning que pour vous-même', 403);
  }

  const targets = await prisma.user.findMany({
    where: { id: { in: uniqueIds }, schoolId },
    select: { id: true, role: true }
  });

  if (targets.length !== uniqueIds.length) {
    throw new AppError('Un ou plusieurs destinataires sont introuvables dans cette école', 400);
  }

  const forbidden = targets.find((target) => !canTargetRole(user.role, target.role));
  if (forbidden) {
    throw new AppError('Vous n’avez pas le droit de créer un planning pour ce rôle', 403);
  }

  return uniqueIds;
};

export const planningService = {
  async list(user: AuthUser, query: PlanningQuery) {
    const schoolId = requireSchoolId(user);
    const where: Record<string, unknown> = {
      schoolId,
      OR: [{ creatorId: user.id }, { participants: { some: { userId: user.id } } }]
    };

    if (query.from || query.to) {
      const dateFilter: Record<string, Date> = {};
      if (query.from) dateFilter.gte = new Date(query.from);
      if (query.to) dateFilter.lte = new Date(query.to);
      where.date = dateFilter;
    }

    const plannings = await prisma.planning.findMany({
      where,
      include: planningInclude,
      orderBy: [{ date: 'asc' }, { startMinutes: 'asc' }]
    });

    return { plannings };
  },

  async get(user: AuthUser, id: string) {
    const schoolId = requireSchoolId(user);
    const planning = await prisma.planning.findFirst({
      where: { id, schoolId, OR: [{ creatorId: user.id }, { participants: { some: { userId: user.id } } }] },
      include: planningInclude
    });
    if (!planning) throw new AppError('Planning introuvable', 404);
    return planning;
  },

  async create(user: AuthUser, input: PlanningInput) {
    const schoolId = requireSchoolId(user);
    const participantIds = await validateParticipants(user, schoolId, input.participantUserIds ?? []);

    return prisma.planning.create({
      data: {
        schoolId,
        creatorId: user.id,
        title: input.title,
        description: input.description || null,
        location: input.location || null,
        date: new Date(input.date),
        startMinutes: input.startMinutes,
        endMinutes: input.endMinutes,
        participants: {
          create: [user.id, ...participantIds].map((userId) => ({ userId }))
        }
      },
      include: planningInclude
    });
  },

  async update(user: AuthUser, id: string, input: Partial<PlanningInput>) {
    const schoolId = requireSchoolId(user);
    const current = await prisma.planning.findFirst({ where: { id, schoolId } });
    if (!current) throw new AppError('Planning introuvable', 404);
    if (current.creatorId !== user.id) throw new AppError('Seul le créateur peut modifier ce planning', 403);

    let participantsUpdate;
    if (input.participantUserIds) {
      const participantIds = await validateParticipants(user, schoolId, input.participantUserIds);
      participantsUpdate = {
        deleteMany: {},
        create: [user.id, ...participantIds].map((userId) => ({ userId }))
      };
    }

    return prisma.planning.update({
      where: { id: current.id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description || null } : {}),
        ...(input.location !== undefined ? { location: input.location || null } : {}),
        ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
        ...(input.startMinutes !== undefined ? { startMinutes: input.startMinutes } : {}),
        ...(input.endMinutes !== undefined ? { endMinutes: input.endMinutes } : {}),
        ...(participantsUpdate ? { participants: participantsUpdate } : {})
      },
      include: planningInclude
    });
  },

  async remove(user: AuthUser, id: string) {
    const schoolId = requireSchoolId(user);
    const current = await prisma.planning.findFirst({ where: { id, schoolId } });
    if (!current) throw new AppError('Planning introuvable', 404);
    if (current.creatorId !== user.id) throw new AppError('Seul le créateur peut supprimer ce planning', 403);
    await prisma.planning.delete({ where: { id: current.id } });
    return { id: current.id };
  },

  async eligibleTargets(user: AuthUser) {
    const schoolId = requireSchoolId(user);
    if (SELF_ONLY_ROLES.includes(user.role)) return [];

    const users = await prisma.user.findMany({
      where: { schoolId, id: { not: user.id } },
      select: { id: true, fullName: true, email: true, role: true },
      orderBy: { fullName: 'asc' }
    });

    return users.filter((target) => canTargetRole(user.role, target.role));
  }
};

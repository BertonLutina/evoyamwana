import { prisma } from '../config/prisma.js';
import type { AuthUser } from '@evoyamwana/shared';
import { AppError } from '../utils/app-error.js';

const schoolStaffRoles = [
  'SCHOOL_ADMIN',
  'DIRECTOR',
  'SECRETARY',
  'ACCOUNTANT',
  'DISCIPLINE_OFFICER',
  'LIBRARIAN',
  'NURSE',
  'TRANSPORT_MANAGER',
  'CANTEEN_MANAGER'
] as const;
const schoolStaffRoleList = [...schoolStaffRoles];

const conversationOpenRoles = new Set<string>(['SUPER_ADMIN', ...schoolStaffRoles]);

const includeMessageUsers = {
  sender: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true
    }
  },
  recipient: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true
    }
  }
};

const requireSchoolId = (schoolId: string | null | undefined) => {
  if (!schoolId) {
    throw new AppError('School context is required', 403);
  }

  return schoolId;
};

const ensureConversationAccess = async (user: AuthUser, otherUserId: string) => {
  const schoolId = requireSchoolId(user.schoolId);

  const otherUser = await prisma.user.findFirst({
    where: {
      id: otherUserId,
      schoolId
    },
    select: {
      id: true,
      role: true,
      schoolId: true
    }
  });

  if (!otherUser) {
    throw new AppError('Conversation user not found in this school', 404);
  }

  if (user.id === otherUserId) {
    throw new AppError('Cannot start a conversation with yourself', 400);
  }

  if (conversationOpenRoles.has(user.role)) {
    return;
  }

  if (user.role === 'TEACHER' || user.role === 'CLASS_TUTOR') {
    const teacher = await prisma.teacher.findFirst({ where: { userId: user.id, schoolId } });
    if (!teacher) throw new AppError('Teacher profile not found', 403);

    if (conversationOpenRoles.has(otherUser.role)) return;

    if (otherUser.role === 'PARENT') {
      const parent = await prisma.parent.findFirst({
        where: {
          userId: otherUserId,
          schoolId,
          children: {
            some: {
              student: {
                class: {
                  teacherId: teacher.id
                }
              }
            }
          }
        }
      });
      if (parent) return;
    }
  }

  if (user.role === 'PARENT') {
    const parent = await prisma.parent.findFirst({ where: { userId: user.id, schoolId } });
    if (!parent) throw new AppError('Parent profile not found', 403);

    if (conversationOpenRoles.has(otherUser.role)) return;

    if (otherUser.role === 'TEACHER' || otherUser.role === 'CLASS_TUTOR') {
      const teacher = await prisma.teacher.findFirst({
        where: {
          userId: otherUserId,
          schoolId,
          classes: {
            some: {
              students: {
                some: {
                  parents: {
                    some: {
                      parentId: parent.id
                    }
                  }
                }
              }
            }
          }
        }
      });
      if (teacher) return;
    }
  }

  if (user.role === 'STUDENT') {
    const student = await prisma.student.findFirst({
      where: { userId: user.id, schoolId },
      select: { classId: true }
    });
    if (!student) throw new AppError('Student profile not found', 403);

    if (conversationOpenRoles.has(otherUser.role)) return;

    if ((otherUser.role === 'TEACHER' || otherUser.role === 'CLASS_TUTOR') && student.classId) {
      const teacher = await prisma.teacher.findFirst({
        where: {
          userId: otherUserId,
          schoolId,
          classes: {
            some: { id: student.classId }
          }
        }
      });
      if (teacher) return;
    }
  }

  throw new AppError('You do not have access to this conversation', 403);
};

export const messagesService = {
  async listMyMessages(user: AuthUser) {
    const schoolId = requireSchoolId(user.schoolId);
    return prisma.message.findMany({
      where: {
        schoolId,
        OR: [{ senderId: user.id }, { recipientId: user.id }]
      },
      include: includeMessageUsers,
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  },

  async listContacts(user: AuthUser) {
    const schoolId = requireSchoolId(user.schoolId);

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { userId: user.id, schoolId },
        include: {
          class: {
            include: {
              teacher: {
                include: { user: true }
              }
            }
          }
        }
      });
      if (!student) throw new AppError('Student profile not found', 403);

      const admins = await prisma.user.findMany({
        where: { schoolId, role: { in: schoolStaffRoleList }, id: { not: user.id } },
        select: { id: true, fullName: true, email: true, role: true },
        orderBy: { fullName: 'asc' }
      });
      const teacherUser = student.class?.teacher?.user
        ? {
            id: student.class.teacher.user.id,
            fullName: student.class.teacher.user.fullName,
            email: student.class.teacher.user.email,
            role: student.class.teacher.user.role
          }
        : null;

      return [...(teacherUser ? [teacherUser] : []), ...admins];
    }

    if (user.role === 'TEACHER' || user.role === 'CLASS_TUTOR') {
      const teacher = await prisma.teacher.findFirst({
        where: { userId: user.id, schoolId },
        include: {
          classes: {
            include: {
              students: {
                include: {
                  parents: {
                    include: {
                      parent: {
                        include: { user: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      if (!teacher) throw new AppError('Teacher profile not found', 403);

      const admins = await prisma.user.findMany({
        where: { schoolId, role: { in: schoolStaffRoleList }, id: { not: user.id } },
        select: { id: true, fullName: true, email: true, role: true },
        orderBy: { fullName: 'asc' }
      });
      const parents = new Map<string, { id: string; fullName: string; email: string; role: 'PARENT' }>();
      teacher.classes.forEach((classRecord) => {
        classRecord.students.forEach((student) => {
          student.parents.forEach((link) => {
            if (link.parent.user) {
              parents.set(link.parent.user.id, {
                id: link.parent.user.id,
                fullName: link.parent.user.fullName,
                email: link.parent.user.email,
                role: 'PARENT'
              });
            }
          });
        });
      });

      return [...admins, ...Array.from(parents.values()).sort((a, b) => a.fullName.localeCompare(b.fullName))];
    }

    return prisma.user.findMany({
      where: {
        schoolId,
        id: { not: user.id },
        role: { in: [...schoolStaffRoleList, 'TEACHER', 'CLASS_TUTOR', 'PARENT', 'STUDENT'] }
      },
      select: { id: true, fullName: true, email: true, role: true },
      orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
      take: 50
    });
  },

  async getConversation(user: AuthUser, otherUserId: string) {
    await ensureConversationAccess(user, otherUserId);
    const schoolId = requireSchoolId(user.schoolId);

    await prisma.message.updateMany({
      where: {
        schoolId,
        senderId: otherUserId,
        recipientId: user.id,
        readAt: null
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });

    return prisma.message.findMany({
      where: {
        schoolId,
        OR: [
          { senderId: user.id, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: user.id }
        ]
      },
      include: includeMessageUsers,
      orderBy: { createdAt: 'asc' }
    });
  },

  async sendMessage(user: AuthUser, input: { recipientId: string; body: string; subject?: string }) {
    await ensureConversationAccess(user, input.recipientId);
    const schoolId = requireSchoolId(user.schoolId);

    return prisma.message.create({
      data: {
        schoolId,
        senderId: user.id,
        recipientId: input.recipientId,
        subject: input.subject || 'Conversation EVOYAMWANA',
        body: input.body
      },
      include: includeMessageUsers
    });
  },

  async markRead(user: AuthUser, id: string) {
    const schoolId = requireSchoolId(user.schoolId);
    const message = await prisma.message.findFirst({
      where: {
        id,
        schoolId,
        recipientId: user.id
      }
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    return prisma.message.update({
      where: { id },
      data: {
        status: 'READ',
        readAt: new Date()
      },
      include: includeMessageUsers
    });
  }
};

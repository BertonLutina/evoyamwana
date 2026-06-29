import type { UserRole } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const permissionDeniedMessage = 'You are not allowed to message this user.';

type ChatUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  schoolId: string | null;
};

type StudentProfile = {
  id: string;
  userId: string | null;
  schoolId: string;
  classId: string | null;
};

type TeacherProfile = {
  id: string;
  userId: string;
  schoolId: string;
  classes?: Array<{ id: string }>;
};

type ParentProfile = {
  id: string;
  userId: string;
  schoolId: string;
  children?: Array<{
    student: {
      id: string;
      userId: string | null;
      classId: string | null;
      class?: {
        teacher?: {
          userId: string;
        } | null;
      } | null;
    };
  }>;
};

type SchoolChatSettings = {
  allowStudentDirectorChat?: boolean;
  allowStudentNurseChat?: boolean;
  allowStudentDisciplineChat?: boolean;
  allowStudentLibraryChat?: boolean;
} | null;

type Delegate = {
  findUnique?: (args: unknown) => Promise<unknown>;
  findFirst?: (args: unknown) => Promise<unknown>;
  findMany?: (args: unknown) => Promise<unknown[]>;
};

type ChatPermissionDb = {
  user: Delegate;
  student?: Delegate;
  teacher?: Delegate;
  parent?: Delegate;
  schoolChatSettings?: Delegate;
  transportAssignment?: Delegate;
  canteenAssignment?: Delegate;
};

const sameSchool = (sender: ChatUser, receiver: ChatUser) => {
  if (sender.role === 'SUPER_ADMIN') return true;
  if (receiver.role === 'SUPER_ADMIN') return sender.role === 'SCHOOL_ADMIN' || sender.role === 'DIRECTOR';
  return Boolean(sender.schoolId && sender.schoolId === receiver.schoolId);
};

const schoolStaffRoles: UserRole[] = ['SCHOOL_ADMIN', 'DIRECTOR', 'SECRETARY', 'ACCOUNTANT', 'DISCIPLINE_OFFICER', 'LIBRARIAN', 'NURSE', 'TRANSPORT_MANAGER', 'CANTEEN_MANAGER'];

const teacherBaseRoles: UserRole[] = ['DIRECTOR', 'SECRETARY', 'CLASS_TUTOR', 'DISCIPLINE_OFFICER', 'NURSE', 'LIBRARIAN'];
const secretaryRoles: UserRole[] = ['SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER', 'PARENT', 'CLASS_TUTOR', 'DISCIPLINE_OFFICER', 'ACCOUNTANT', 'NURSE', 'LIBRARIAN', 'TRANSPORT_MANAGER', 'CANTEEN_MANAGER'];
const classTutorBaseRoles: UserRole[] = ['SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER', 'SECRETARY', 'DISCIPLINE_OFFICER', 'NURSE'];
const disciplineRoles: UserRole[] = ['SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER', 'CLASS_TUTOR', 'STUDENT', 'PARENT', 'SECRETARY'];
const nurseRoles: UserRole[] = ['SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER', 'CLASS_TUTOR', 'STUDENT', 'PARENT', 'SECRETARY'];
const librarianBaseRoles: UserRole[] = ['SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER', 'SECRETARY'];
const accountantRoles: UserRole[] = ['SCHOOL_ADMIN', 'DIRECTOR', 'SECRETARY', 'PARENT'];
const transportBaseRoles: UserRole[] = ['SCHOOL_ADMIN', 'DIRECTOR', 'SECRETARY'];
const canteenBaseRoles: UserRole[] = ['SCHOOL_ADMIN', 'DIRECTOR', 'SECRETARY'];

export const createChatPermissionService = (db: ChatPermissionDb = prisma as unknown as ChatPermissionDb) => {
  const getUser = async (userId: string) => {
    const user = await db.user.findUnique?.({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, role: true, schoolId: true }
    });
    return (user ?? null) as ChatUser | null;
  };

  const getStudent = async (user: ChatUser) => {
    if (!user.schoolId) return null;
    const student = await db.student?.findFirst?.({
      where: { userId: user.id, schoolId: user.schoolId },
      select: { id: true, userId: true, schoolId: true, classId: true }
    });
    return (student ?? null) as StudentProfile | null;
  };

  const getTeacher = async (user: ChatUser) => {
    if (!user.schoolId) return null;
    const teacher = await db.teacher?.findFirst?.({
      where: { userId: user.id, schoolId: user.schoolId },
      include: { classes: { select: { id: true } } }
    });
    return (teacher ?? null) as TeacherProfile | null;
  };

  const getParent = async (user: ChatUser) => {
    if (!user.schoolId) return null;
    const parent = await db.parent?.findFirst?.({
      where: { userId: user.id, schoolId: user.schoolId },
      include: {
        children: {
          include: {
            student: {
              select: {
                id: true,
                userId: true,
                classId: true,
                class: {
                  select: {
                    teacher: { select: { userId: true } }
                  }
                }
              }
            }
          }
        }
      }
    });
    return (parent ?? null) as ParentProfile | null;
  };

  const getSchoolSettings = async (schoolId: string | null) => {
    if (!schoolId) return null;
    const settings = await db.schoolChatSettings?.findUnique?.({ where: { schoolId } });
    return (settings ?? null) as SchoolChatSettings;
  };

  const teacherHasStudent = async (teacherUser: ChatUser, studentUser: ChatUser) => {
    const teacher = await getTeacher(teacherUser);
    const student = await getStudent(studentUser);
    if (!teacher || !student?.classId) return false;
    return teacher.classes?.some((classRecord) => classRecord.id === student.classId) ?? false;
  };

  const sameClass = async (leftUser: ChatUser, rightUser: ChatUser) => {
    const left = await getStudent(leftUser);
    const right = await getStudent(rightUser);
    return Boolean(left?.classId && left.classId === right?.classId);
  };

  const parentHasChild = async (parentUser: ChatUser, childUser: ChatUser) => {
    const parent = await getParent(parentUser);
    return parent?.children?.some((link) => link.student.userId === childUser.id) ?? false;
  };

  const parentLinkedToTeacher = async (parentUser: ChatUser, teacherUser: ChatUser) => {
    const parent = await getParent(parentUser);
    if (!parent) return false;
    const teacher = await getTeacher(teacherUser);
    if (!teacher) return false;
    return parent.children?.some((link) => {
      const teacherOwnsClass = teacher.classes?.some((classRecord) => classRecord.id === link.student.classId);
      const mainTeacher = link.student.class?.teacher?.userId === teacherUser.id;
      return teacherOwnsClass || mainTeacher;
    }) ?? false;
  };

  const studentLinkedToTeacher = async (studentUser: ChatUser, teacherUser: ChatUser) => teacherHasStudent(teacherUser, studentUser);

  const assignedToTransport = async (managerUser: ChatUser, otherUser: ChatUser) => {
    if (!db.transportAssignment?.findFirst || !managerUser.schoolId) return false;
    const student = otherUser.role === 'STUDENT' ? await getStudent(otherUser) : null;
    const parent = otherUser.role === 'PARENT' ? await getParent(otherUser) : null;
    const studentUserIds = parent?.children?.map((link) => link.student.userId).filter(Boolean) ?? (student?.userId ? [student.userId] : []);
    if (!studentUserIds.length) return false;
    const assignment = await db.transportAssignment.findFirst({
      where: {
        transportManagerUserId: managerUser.id,
        studentUserId: { in: studentUserIds }
      }
    });
    return Boolean(assignment);
  };

  const assignedToCanteen = async (managerUser: ChatUser, otherUser: ChatUser) => {
    if (!db.canteenAssignment?.findFirst || !managerUser.schoolId) return false;
    const student = otherUser.role === 'STUDENT' ? await getStudent(otherUser) : null;
    const parent = otherUser.role === 'PARENT' ? await getParent(otherUser) : null;
    const studentUserIds = parent?.children?.map((link) => link.student.userId).filter(Boolean) ?? (student?.userId ? [student.userId] : []);
    if (!studentUserIds.length) return false;
    const assignment = await db.canteenAssignment.findFirst({
      where: {
        canteenManagerUserId: managerUser.id,
        studentUserId: { in: studentUserIds }
      }
    });
    return Boolean(assignment);
  };

  const canSendBetweenUsers = async (sender: ChatUser, receiver: ChatUser): Promise<boolean> => {
    if (sender.id === receiver.id) return false;
    if (!sameSchool(sender, receiver)) return false;

    if (sender.role === 'SUPER_ADMIN') return true;
    if (receiver.role === 'SUPER_ADMIN') return sender.role === 'SCHOOL_ADMIN' || sender.role === 'DIRECTOR';
    if (sender.role === 'SCHOOL_ADMIN') return Boolean(sender.schoolId && sender.schoolId === receiver.schoolId);
    if (sender.role === 'DIRECTOR') return Boolean(sender.schoolId && sender.schoolId === receiver.schoolId);

    if (sender.role === 'TEACHER') {
      if (teacherBaseRoles.includes(receiver.role)) return true;
      if (receiver.role === 'TEACHER') return true;
      if (receiver.role === 'STUDENT') return teacherHasStudent(sender, receiver);
      return false;
    }

    if (sender.role === 'PARENT') {
      if (['DIRECTOR', 'SECRETARY', 'DISCIPLINE_OFFICER'].includes(receiver.role)) return true;
      if (receiver.role === 'STUDENT') return parentHasChild(sender, receiver);
      if (receiver.role === 'TEACHER' || receiver.role === 'CLASS_TUTOR') return parentLinkedToTeacher(sender, receiver);
      return false;
    }

    if (sender.role === 'STUDENT') {
      const settings = await getSchoolSettings(sender.schoolId);
      if (receiver.role === 'STUDENT') return sameClass(sender, receiver);
      if (receiver.role === 'TEACHER' || receiver.role === 'CLASS_TUTOR') return studentLinkedToTeacher(sender, receiver);
      if (receiver.role === 'DIRECTOR') return Boolean(settings?.allowStudentDirectorChat);
      if (receiver.role === 'NURSE') return Boolean(settings?.allowStudentNurseChat);
      if (receiver.role === 'DISCIPLINE_OFFICER') return Boolean(settings?.allowStudentDisciplineChat);
      if (receiver.role === 'LIBRARIAN') return Boolean(settings?.allowStudentLibraryChat);
      return false;
    }

    if (sender.role === 'SECRETARY') return secretaryRoles.includes(receiver.role);
    if (sender.role === 'ACCOUNTANT') return accountantRoles.includes(receiver.role);

    if (sender.role === 'CLASS_TUTOR') {
      if (classTutorBaseRoles.includes(receiver.role)) return true;
      if (receiver.role === 'STUDENT') return teacherHasStudent(sender, receiver);
      if (receiver.role === 'PARENT') return parentLinkedToTeacher(receiver, sender);
      return false;
    }

    if (sender.role === 'DISCIPLINE_OFFICER') return disciplineRoles.includes(receiver.role);

    if (sender.role === 'LIBRARIAN') {
      if (librarianBaseRoles.includes(receiver.role)) return true;
      if (receiver.role === 'STUDENT') {
        const settings = await getSchoolSettings(sender.schoolId);
        return Boolean(settings?.allowStudentLibraryChat);
      }
      return false;
    }

    if (sender.role === 'NURSE') return nurseRoles.includes(receiver.role);

    if (sender.role === 'TRANSPORT_MANAGER') {
      if (transportBaseRoles.includes(receiver.role)) return true;
      if (receiver.role === 'PARENT' || receiver.role === 'STUDENT') return assignedToTransport(sender, receiver);
      return false;
    }

    if (sender.role === 'CANTEEN_MANAGER') {
      if (canteenBaseRoles.includes(receiver.role)) return true;
      if (receiver.role === 'PARENT' || receiver.role === 'STUDENT') return assignedToCanteen(sender, receiver);
      return false;
    }

    return false;
  };

  const canSendMessage = async (senderId: string, receiverId: string) => {
    const [sender, receiver] = await Promise.all([getUser(senderId), getUser(receiverId)]);
    if (!sender || !receiver) return false;
    return canSendBetweenUsers(sender, receiver);
  };

  const canReceiveMessage = async (receiverId: string, senderId: string) => {
    const [receiver, sender] = await Promise.all([getUser(receiverId), getUser(senderId)]);
    if (!sender || !receiver) return false;

    if (receiver.role === 'SUPER_ADMIN') {
      return sender.role === 'SCHOOL_ADMIN' || sender.role === 'DIRECTOR';
    }

    if (receiver.role === 'DIRECTOR' && sender.role === 'STUDENT') {
      const settings = await getSchoolSettings(receiver.schoolId);
      return Boolean(settings?.allowStudentDirectorChat);
    }

    return canSendBetweenUsers(sender, receiver);
  };

  const canCreateConversation = async (userAId: string, userBId: string) => {
    const [canSend, canReceive] = await Promise.all([canSendMessage(userAId, userBId), canReceiveMessage(userBId, userAId)]);
    return canSend && canReceive;
  };

  const getAllowedChatContacts = async (userId: string) => {
    const user = await getUser(userId);
    if (!user) return [];
    const users = await db.user.findMany?.({
      where: user.role === 'SUPER_ADMIN' ? { id: { not: user.id } } : { schoolId: user.schoolId, id: { not: user.id } },
      select: { id: true, fullName: true, email: true, role: true, schoolId: true },
      orderBy: [{ role: 'asc' }, { fullName: 'asc' }]
    });

    const candidates = (users ?? []) as ChatUser[];
    const allowed = await Promise.all(
      candidates.map(async (candidate) => {
        const [canSend, canReceive] = await Promise.all([canSendMessage(user.id, candidate.id), canReceiveMessage(candidate.id, user.id)]);
        return canSend && canReceive ? candidate : null;
      })
    );

    return allowed.filter(Boolean) as ChatUser[];
  };

  return {
    permissionDeniedMessage,
    canSendMessage,
    canReceiveMessage,
    canCreateConversation,
    getAllowedChatContacts
  };
};

export const chatPermissionService = createChatPermissionService();

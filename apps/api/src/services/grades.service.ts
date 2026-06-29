import { prisma } from '../config/prisma.js';
import type { AuthUser } from '@evoyamwana/shared';
import { AppError } from '../utils/app-error.js';

export interface GradeInput {
  studentId: string;
  classId: string;
  subjectId: string;
  score: number;
  maxScore: number;
  coefficient?: number;
  term: string;
  comment?: string;
}

export interface GradeUpdateInput {
  studentId?: string;
  classId?: string;
  subjectId?: string;
  score?: number;
  maxScore?: number;
  coefficient?: number;
  term?: string;
  comment?: string;
}

export interface GradeListQuery {
  search?: string;
  classId?: string;
  subjectId?: string;
  studentId?: string;
  term?: string;
  page?: number;
  pageSize?: number;
}

const includeGradeRelations = {
  student: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentCode: true
    }
  },
  teacher: {
    select: {
      id: true,
      firstName: true,
      lastName: true
    }
  },
  class: {
    select: {
      id: true,
      name: true,
      level: true
    }
  },
  subject: {
    select: {
      id: true,
      name: true,
      code: true
    }
  }
};

const requireSchoolId = (schoolId: string | null | undefined) => {
  if (!schoolId) {
    throw new AppError('School context is required', 403);
  }

  return schoolId;
};

const buildWhere = (schoolId: string, query: GradeListQuery = {}, user?: AuthUser) => {
  const where: Record<string, unknown> = { schoolId };

  if (user?.role === 'STUDENT') {
    where.student = { userId: user.id, schoolId, isActive: true };
  }

  if (user?.role === 'PARENT') {
    where.student = {
      parents: {
        some: {
          parent: { userId: user.id, schoolId }
        }
      }
    };
  }

  if (user?.role === 'TEACHER' || user?.role === 'CLASS_TUTOR') {
    where.teacher = { userId: user.id, schoolId };
  }

  if (query.classId) where.classId = query.classId;
  if (query.subjectId) where.subjectId = query.subjectId;
  if (query.studentId && user?.role !== 'STUDENT') where.studentId = query.studentId;
  if (query.term) where.term = query.term;

  if (query.search) {
    where.OR = [
      { term: { contains: query.search, mode: 'insensitive' } },
      { comment: { contains: query.search, mode: 'insensitive' } },
      { student: { firstName: { contains: query.search, mode: 'insensitive' } } },
      { student: { lastName: { contains: query.search, mode: 'insensitive' } } },
      { student: { studentCode: { contains: query.search, mode: 'insensitive' } } },
      { subject: { name: { contains: query.search, mode: 'insensitive' } } },
      { class: { name: { contains: query.search, mode: 'insensitive' } } }
    ];
  }

  return where;
};

const getTeacherForGrade = async (user: AuthUser, schoolId: string, classId: string, subjectId: string) => {
  if (user.role === 'TEACHER' || user.role === 'CLASS_TUTOR') {
    const teacher = await prisma.teacher.findFirst({ where: { userId: user.id, schoolId } });
    if (!teacher) throw new AppError('Teacher profile not found', 403);
    return teacher.id;
  }

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, schoolId },
    select: { teacherId: true }
  });
  if (subject?.teacherId) return subject.teacherId;

  const classRecord = await prisma.class.findFirst({
    where: { id: classId, schoolId },
    select: { teacherId: true }
  });
  if (classRecord?.teacherId) return classRecord.teacherId;

  throw new AppError('Assign a teacher to the subject or class before recording grades', 400);
};

const validateGradeScope = async (schoolId: string, input: GradeInput) => {
  const [student, classRecord, subject] = await Promise.all([
    prisma.student.findFirst({ where: { id: input.studentId, schoolId, classId: input.classId } }),
    prisma.class.findFirst({ where: { id: input.classId, schoolId } }),
    prisma.subject.findFirst({ where: { id: input.subjectId, schoolId, OR: [{ classId: input.classId }, { classId: null }] } })
  ]);

  if (!student) throw new AppError('Student not found in this class', 400);
  if (!classRecord) throw new AppError('Class not found for this school', 400);
  if (!subject) throw new AppError('Subject not found for this class', 400);
  if (input.score < 0 || input.maxScore <= 0 || input.score > input.maxScore) {
    throw new AppError('Score must be between 0 and max score', 400);
  }
};

const getGradeForWrite = async (user: AuthUser, id: string) => {
  const schoolId = requireSchoolId(user.schoolId);
  const grade = await prisma.grade.findFirst({
    where: {
      id,
      schoolId,
      ...(user.role === 'TEACHER' || user.role === 'CLASS_TUTOR' ? { teacher: { userId: user.id, schoolId } } : {})
    },
    include: includeGradeRelations
  });

  if (!grade) {
    throw new AppError('Grade not found or not accessible', 404);
  }

  return { grade, schoolId };
};

export const gradesService = {
  async listStudentSummaries(user: AuthUser, query: GradeListQuery = {}) {
    const schoolId = requireSchoolId(user.schoolId);
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 100);
    const where = buildWhere(schoolId, query, user);

    const grades = await prisma.grade.findMany({
      where,
      include: includeGradeRelations,
      orderBy: { createdAt: 'desc' }
    });

    const summaryMap = new Map<string, {
      studentId: string;
      student: NonNullable<(typeof grades)[number]['student']>;
      class?: (typeof grades)[number]['class'];
      term?: string;
      gradeCount: number;
      subjectIds: Set<string>;
      totalScore: number;
      totalMaxScore: number;
      weightedScore: number;
      weightedMaxScore: number;
    }>();

    for (const grade of grades) {
      if (!grade.student) continue;
      const current = summaryMap.get(grade.studentId) ?? {
        studentId: grade.studentId,
        student: grade.student,
        class: grade.class,
        term: query.term,
        gradeCount: 0,
        subjectIds: new Set<string>(),
        totalScore: 0,
        totalMaxScore: 0,
        weightedScore: 0,
        weightedMaxScore: 0
      };

      const score = Number(grade.score);
      const maxScore = Number(grade.maxScore);
      const coefficient = Number(grade.coefficient);
      current.gradeCount += 1;
      current.subjectIds.add(grade.subjectId);
      current.totalScore += score;
      current.totalMaxScore += maxScore;
      current.weightedScore += score * coefficient;
      current.weightedMaxScore += maxScore * coefficient;
      summaryMap.set(grade.studentId, current);
    }

    const summaryRows = Array.from(summaryMap.values());
    const metrics = {
      evaluatedStudents: summaryRows.length,
      gradeCount: grades.length,
      subjectCount: new Set(grades.map((grade) => grade.subjectId)).size,
      classCount: new Set(grades.map((grade) => grade.classId)).size,
      averagePercent: (() => {
        const weightedScore = summaryRows.reduce((total, summary) => total + summary.weightedScore, 0);
        const weightedMaxScore = summaryRows.reduce((total, summary) => total + summary.weightedMaxScore, 0);
        return weightedMaxScore ? Math.round((weightedScore / weightedMaxScore) * 100) : null;
      })()
    };

    const summaries = summaryRows
      .map((summary) => ({
        studentId: summary.studentId,
        student: summary.student,
        class: summary.class,
        term: summary.term,
        gradeCount: summary.gradeCount,
        subjectCount: summary.subjectIds.size,
        averagePercent: summary.totalMaxScore ? Math.round((summary.totalScore / summary.totalMaxScore) * 100) : 0,
        weightedAveragePercent: summary.weightedMaxScore ? Math.round((summary.weightedScore / summary.weightedMaxScore) * 100) : 0,
        totalScore: summary.totalScore,
        totalMaxScore: summary.totalMaxScore
      }))
      .sort((a, b) => b.weightedAveragePercent - a.weightedAveragePercent);

    const total = summaries.length;
    const paged = summaries.slice((page - 1) * pageSize, page * pageSize);

    return {
      summaries: paged,
      metrics,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1)
      }
    };
  },

  async listGrades(user: AuthUser, query: GradeListQuery = {}) {
    const schoolId = requireSchoolId(user.schoolId);
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 100);
    const where = buildWhere(schoolId, query, user);

    const [grades, total] = await Promise.all([
      prisma.grade.findMany({
        where,
        include: includeGradeRelations,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.grade.count({ where })
    ]);

    return {
      grades,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1)
      }
    };
  },

  async createGrade(user: AuthUser, input: GradeInput) {
    const schoolId = requireSchoolId(user.schoolId);
    await validateGradeScope(schoolId, input);
    const teacherId = await getTeacherForGrade(user, schoolId, input.classId, input.subjectId);

    return prisma.grade.create({
      data: {
        schoolId,
        studentId: input.studentId,
        teacherId,
        classId: input.classId,
        subjectId: input.subjectId,
        score: input.score,
        maxScore: input.maxScore,
        coefficient: input.coefficient ?? 1,
        term: input.term,
        comment: input.comment
      },
      include: includeGradeRelations
    });
  },

  async updateGrade(user: AuthUser, id: string, input: GradeUpdateInput) {
    const { grade, schoolId } = await getGradeForWrite(user, id);
    const nextInput: GradeInput = {
      studentId: input.studentId ?? grade.studentId,
      classId: input.classId ?? grade.classId,
      subjectId: input.subjectId ?? grade.subjectId,
      score: input.score ?? Number(grade.score),
      maxScore: input.maxScore ?? Number(grade.maxScore),
      coefficient: input.coefficient ?? Number(grade.coefficient),
      term: input.term ?? grade.term,
      comment: input.comment ?? grade.comment ?? undefined
    };

    await validateGradeScope(schoolId, nextInput);

    if (user.role === 'TEACHER' || user.role === 'CLASS_TUTOR') {
      const teacherId = await getTeacherForGrade(user, schoolId, nextInput.classId, nextInput.subjectId);
      if (teacherId !== grade.teacherId) {
        throw new AppError('Grade not found or not accessible', 404);
      }
    }

    return prisma.grade.update({
      where: { id },
      data: {
        studentId: nextInput.studentId,
        classId: nextInput.classId,
        subjectId: nextInput.subjectId,
        score: nextInput.score,
        maxScore: nextInput.maxScore,
        coefficient: nextInput.coefficient ?? 1,
        term: nextInput.term,
        comment: nextInput.comment
      },
      include: includeGradeRelations
    });
  },

  async deleteGrade(user: AuthUser, id: string) {
    await getGradeForWrite(user, id);
    await prisma.grade.delete({ where: { id } });
    return { id };
  }
};

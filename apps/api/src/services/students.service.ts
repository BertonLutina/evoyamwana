import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import type { AuthUser } from '@evoyamwana/shared';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export type StudentCategoryInput = 'creche' | 'maternelle' | 'primaire' | 'secondaire' | 'secondaire_general' | 'secondaire_technique' | 'formation' | 'haute_ecole' | 'universite' | 'mixte';
export type StudentStatusInput = 'active' | 'inactive' | 'transferred' | 'graduated';
export type GuardianRelationshipInput = 'father' | 'mother' | 'guardian' | 'tutor' | 'other';
export type UniversityRegistrationInput = 'new' | 'transfer' | 're_registration';

export interface StudentGuardianInput {
  guardianId?: string;
  parent?: StudentGuardianParentInput;
  relationshipType?: GuardianRelationshipInput;
  isPrimaryContact?: boolean;
  canPickUpChild?: boolean;
  emergencyContact?: boolean;
}

export interface StudentGuardianParentInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface StudentMedicalInfoInput {
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  medication?: string;
  doctorName?: string;
  doctorPhone?: string;
  emergencyNotes?: string;
}

export interface StudentMaternelleInfoInput {
  toiletTrained?: boolean;
  napNeeded?: boolean;
  foodRestrictions?: string;
  authorizedPickupPersons?: unknown;
  adaptationNotes?: string;
  favoriteLanguage?: string;
  separationDifficulty?: boolean;
}

export interface StudentPrimaryInfoInput {
  previousSchool?: string;
  readingLevel?: string;
  writingLevel?: string;
  mathLevel?: string;
  specialNeeds?: string;
  extracurricularNotes?: string;
}

export interface StudentSecondaryInfoInput {
  previousSchool?: string;
  section?: string;
  optionName?: string;
  orientationNotes?: string;
  disciplinaryNotes?: string;
  academicLevel?: string;
  repeatedClass?: boolean;
}

export interface StudentUniversityInfoInput {
  previousInstitution?: string;
  diplomaObtained?: string;
  program?: string;
  faculty?: string;
  department?: string;
  academicYear?: string;
  registrationType?: UniversityRegistrationInput;
  scholarshipStatus?: string;
  studentEmail?: string;
  nationalIdNumber?: string;
}

export interface StudentInput {
  firstName: string;
  lastName: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  photoUrl?: string;
  studentCode?: string;
  studentNumber?: string;
  category?: StudentCategoryInput;
  classId?: string;
  schoolYearId?: string;
  status?: StudentStatusInput;
  parentIds?: string[];
  guardians?: StudentGuardianInput[];
  medicalInfo?: StudentMedicalInfoInput;
  maternelleInfo?: StudentMaternelleInfoInput;
  primaryInfo?: StudentPrimaryInfoInput;
  secondaryInfo?: StudentSecondaryInfoInput;
  universityInfo?: StudentUniversityInfoInput;
}

export interface StudentListQuery {
  search?: string;
  gender?: string;
  classId?: string;
  schoolYearId?: string;
  category?: StudentCategoryInput;
  status?: StudentStatusInput | 'all';
  page?: number;
  pageSize?: number;
}

type Delegate = {
  findMany?: (args: unknown) => Promise<unknown[]>;
  count?: (args: unknown) => Promise<number>;
  findFirst?: (args: unknown) => Promise<unknown>;
  create?: (args: unknown) => Promise<unknown>;
  update?: (args: unknown) => Promise<unknown>;
  deleteMany?: (args: unknown) => Promise<unknown>;
  createMany?: (args: unknown) => Promise<unknown>;
  upsert?: (args: unknown) => Promise<unknown>;
};

type StudentsDb = {
  student: Delegate;
  class?: Delegate;
  parent?: Delegate;
  user?: Delegate;
  schoolYear?: Delegate;
  studentParent?: Delegate;
  studentGuardian?: Delegate;
  studentMedicalInfo?: Delegate;
  studentMaternelleInfo?: Delegate;
  studentPrimaryInfo?: Delegate;
  studentSecondaryInfo?: Delegate;
  studentUniversityInfo?: Delegate;
  studentEnrollmentLog?: Delegate;
  $transaction?: <T>(callback: (tx: StudentsDb) => Promise<T>) => Promise<T>;
};

const categoryToPrisma = {
  creche: 'CRECHE',
  maternelle: 'MATERNELLE',
  primaire: 'PRIMAIRE',
  secondaire: 'SECONDAIRE',
  secondaire_general: 'SECONDAIRE_GENERAL',
  secondaire_technique: 'SECONDAIRE_TECHNIQUE',
  formation: 'FORMATION',
  haute_ecole: 'HAUTE_ECOLE',
  universite: 'UNIVERSITE',
  mixte: 'MIXTE'
} as const;

const statusToPrisma = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  transferred: 'TRANSFERRED',
  graduated: 'GRADUATED'
} as const;

const relationshipToPrisma = {
  father: 'FATHER',
  mother: 'MOTHER',
  guardian: 'GUARDIAN',
  tutor: 'TUTOR',
  other: 'OTHER'
} as const;

const registrationToPrisma = {
  new: 'NEW',
  transfer: 'TRANSFER',
  re_registration: 'RE_REGISTRATION'
} as const;

const earlyCategories: StudentCategoryInput[] = ['creche', 'maternelle'];
const primaryCategories: StudentCategoryInput[] = ['primaire', 'mixte'];
const secondaryCategories: StudentCategoryInput[] = ['secondaire', 'secondaire_general', 'secondaire_technique', 'formation'];
const higherCategories: StudentCategoryInput[] = ['haute_ecole', 'universite'];

const includeStudentRelations = {
  class: true,
  schoolYear: true,
  parents: {
    include: {
      parent: true
    }
  },
  guardians: {
    include: {
      guardian: true
    }
  },
  medicalInfo: true,
  maternelleInfo: true,
  primaryInfo: true,
  secondaryInfo: true,
  universityInfo: true
};

const ensureSchoolId = (schoolId: string | null | undefined) => {
  if (!schoolId) {
    throw new AppError('School context is required', 403);
  }
};

const toDate = (value?: string) => (value ? new Date(value) : undefined);
const compact = <T extends Record<string, unknown>>(input: T) =>
  Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;

const applyUserScope = (where: Record<string, unknown>, schoolId: string, user?: AuthUser) => {
  if (user?.role === 'PARENT') {
    where.parents = {
      some: {
        parent: {
          userId: user.id,
          schoolId
        }
      }
    };
  }

  if (user?.role === 'STUDENT') {
    where.userId = user.id;
  }

  return where;
};

const buildWhere = (schoolId: string, query: StudentListQuery = {}, user?: AuthUser) => {
  const where: Record<string, unknown> = { schoolId };

  if (query.status !== 'all') {
    if (query.status) {
      where.status = statusToPrisma[query.status];
      where.isActive = query.status === 'active';
    } else {
      where.isActive = true;
    }
  }

  if (query.gender) {
    where.gender = query.gender;
  }

  if (query.classId) {
    where.classId = query.classId;
  }

  if (query.schoolYearId) {
    where.schoolYearId = query.schoolYearId;
  }

  if (query.category) {
    where.category = categoryToPrisma[query.category];
  }

  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { studentCode: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  return applyUserScope(where, schoolId, user);
};

const normalizeGuardians = (input: StudentInput): StudentGuardianInput[] => {
  if (input.guardians?.length) {
    return input.guardians.map((guardian, index) => ({
      guardianId: guardian.guardianId,
      parent: guardian.parent,
      relationshipType: guardian.relationshipType ?? 'guardian',
      isPrimaryContact: guardian.isPrimaryContact ?? index === 0,
      canPickUpChild: guardian.canPickUpChild ?? false,
      emergencyContact: guardian.emergencyContact ?? index === 0
    }));
  }

  return (input.parentIds ?? []).map((guardianId, index) => ({
    guardianId,
    relationshipType: 'guardian',
    isPrimaryContact: index === 0,
    canPickUpChild: false,
    emergencyContact: index === 0
  }));
};

const normalizeStudentInput = (input: StudentInput) => {
  const category = input.category ?? 'primaire';
  const studentCode = input.studentCode?.trim() || input.studentNumber?.trim();

  return {
    ...input,
    category,
    status: input.status ?? 'active',
    studentCode,
    guardians: normalizeGuardians(input)
  };
};

const validateCategoryPayload = (input: ReturnType<typeof normalizeStudentInput>, options: { requireCommonFields?: boolean } = {}) => {
  if (options.requireCommonFields !== false && (!input.firstName?.trim() || !input.lastName?.trim())) {
    throw new AppError('Student first name and last name are required', 400);
  }

  if (earlyCategories.includes(input.category)) {
    if (!input.guardians.length) {
      throw new AppError('At least one guardian is required for maternelle enrollment', 400);
    }

    if (!input.medicalInfo || (!input.medicalInfo.bloodType && !input.medicalInfo.allergies && !input.medicalInfo.emergencyNotes)) {
      throw new AppError('Important medical information is required for maternelle enrollment', 400);
    }

    if (!input.maternelleInfo) {
      throw new AppError('Maternelle information is required', 400);
    }
  }

  if (primaryCategories.includes(input.category)) {
    if (!input.guardians.length) {
      throw new AppError('At least one guardian is required for primary enrollment', 400);
    }
  }

  if (secondaryCategories.includes(input.category)) {
    if (!input.secondaryInfo) {
      throw new AppError('Secondary information is required', 400);
    }

    if (!input.secondaryInfo.section?.trim() || !input.secondaryInfo.optionName?.trim()) {
      throw new AppError('Secondary section and option are required', 400);
    }
  }

  if (higherCategories.includes(input.category)) {
    if (!input.universityInfo?.program?.trim()) {
      throw new AppError('University program is required', 400);
    }

    if (input.universityInfo.studentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.universityInfo.studentEmail)) {
      throw new AppError('Student email is invalid', 400);
    }

    if (input.universityInfo.registrationType === 'transfer' && !input.universityInfo.nationalIdNumber?.trim()) {
      throw new AppError('National ID number is required for university transfer enrollment', 400);
    }
  }
};

const generateStudentCode = async (db: StudentsDb, schoolId: string) => {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, '');
  const total = (await db.student.count?.({
    where: {
      schoolId,
      createdAt: {
        gte: new Date(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`)
      }
    }
  })) ?? 0;

  return `STU-${stamp}-${String(total + 1).padStart(3, '0')}`;
};

const detailUpsert = (studentId: string, create: Record<string, unknown>) => ({
  where: { studentId },
  create: { studentId, ...compact(create) },
  update: compact(create)
});

const normalizeText = (value?: string) => value?.trim().replace(/\s+/g, ' ') ?? '';
const normalizeEmail = (value?: string) => normalizeText(value).toLowerCase();
const normalizePhone = (value?: string | null) => normalizeText(value ?? undefined).replace(/[^\d+]/g, '');
const generatedParentEmail = (schoolId: string, parent: StudentGuardianParentInput) => {
  const phone = normalizePhone(parent.phone).replace(/[^\d]/g, '');
  const slug = `${normalizeText(parent.firstName)}-${normalizeText(parent.lastName)}-${phone || randomUUID()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/(^\.|\.$)/g, '');
  return `parent.${schoolId}.${slug}@evoyamwana.local`;
};

const parentSelect = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  user: { select: { email: true } }
};

export const createStudentsService = (db: StudentsDb = prisma as unknown as StudentsDb) => {
  const getStudentById = async (schoolId: string, id: string, user?: AuthUser) => {
    ensureSchoolId(schoolId);

    const student = await db.student.findFirst?.({
      where: applyUserScope({ id, schoolId }, schoolId, user),
      include: includeStudentRelations
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    return student;
  };

  const validateClass = async (schoolId: string, classId?: string) => {
    if (!classId) {
      return;
    }

    const classRecord = await db.class?.findFirst?.({
      where: { id: classId, schoolId }
    });

    if (!classRecord) {
      throw new AppError('Class not found for this school', 400);
    }
  };

  const validateSchoolYear = async (schoolId: string, schoolYearId?: string) => {
    if (!schoolYearId) {
      return;
    }

    const schoolYear = await db.schoolYear?.findFirst?.({
      where: { id: schoolYearId, schoolId }
    });

    if (!schoolYear) {
      throw new AppError('School year not found for this school', 400);
    }
  };

  const validateGuardians = async (schoolId: string, guardians: StudentGuardianInput[] = []) => {
    const guardianIds = [...new Set(guardians.map((guardian) => guardian.guardianId).filter(Boolean))];
    if (!guardianIds.length) {
      return;
    }

    const count = await db.parent?.count?.({
      where: {
        schoolId,
        id: { in: guardianIds }
      }
    });

    if (count !== guardianIds.length) {
      throw new AppError('One or more guardians do not belong to this school', 400);
    }
  };

  const linkLegacyParents = (tx: StudentsDb, schoolId: string, studentId: string, guardians: StudentGuardianInput[] = []) => {
    if (!guardians.length) {
      return Promise.resolve();
    }

    return tx.studentParent?.createMany?.({
      data: guardians.map((guardian) => ({
        schoolId,
        studentId,
        parentId: guardian.guardianId,
        relationship: guardian.relationshipType ?? 'guardian',
        isPrimary: guardian.isPrimaryContact ?? false
      })),
      skipDuplicates: true
    });
  };

  const linkGuardians = (tx: StudentsDb, studentId: string, guardians: StudentGuardianInput[] = []) => {
    if (!guardians.length) {
      return Promise.resolve();
    }

    return tx.studentGuardian?.createMany?.({
      data: guardians.map((guardian) => ({
        studentId,
        guardianId: guardian.guardianId,
        relationshipType: relationshipToPrisma[guardian.relationshipType ?? 'guardian'],
        isPrimaryContact: guardian.isPrimaryContact ?? false,
        canPickUpChild: guardian.canPickUpChild ?? false,
        emergencyContact: guardian.emergencyContact ?? false
      })),
      skipDuplicates: true
    });
  };

  const findSimilarParent = async (tx: StudentsDb, schoolId: string, parent: StudentGuardianParentInput) => {
    const email = normalizeEmail(parent.email);
    const phone = normalizePhone(parent.phone);
    const firstName = normalizeText(parent.firstName);
    const lastName = normalizeText(parent.lastName);
    const parentDelegate = tx.parent as unknown as {
      findFirst: (args: unknown) => Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone?: string | null;
        user?: { email?: string | null };
      } | null>;
      findMany: (args: unknown) => Promise<Array<{
        id: string;
        firstName: string;
        lastName: string;
        phone?: string | null;
        user?: { email?: string | null };
      }>>;
    };

    if (email) {
      const byEmail = await parentDelegate.findFirst({
        where: { schoolId, user: { email: { equals: email, mode: 'insensitive' } } },
        select: parentSelect
      });
      if (byEmail) return byEmail;
    }

    if (phone) {
      const phoneCandidates = await parentDelegate.findMany({
        where: { schoolId, phone: { not: null } },
        select: parentSelect
      });
      const byPhone = phoneCandidates.find((candidate) => normalizePhone(candidate.phone) === phone);
      if (byPhone) return byPhone;
    }

    if (firstName && lastName) {
      return parentDelegate.findFirst({
        where: {
          schoolId,
          firstName: { equals: firstName, mode: 'insensitive' },
          lastName: { equals: lastName, mode: 'insensitive' }
        },
        select: parentSelect
      });
    }

    return null;
  };

  const createParentFromGuardian = async (tx: StudentsDb, schoolId: string, parent: StudentGuardianParentInput) => {
    const firstName = normalizeText(parent.firstName);
    const lastName = normalizeText(parent.lastName);
    const email = normalizeEmail(parent.email) || generatedParentEmail(schoolId, parent);
    const phone = normalizePhone(parent.phone) || undefined;
    const passwordHash = await bcrypt.hash('DemoPass123!', 12);
    const prismaTx = tx as unknown as {
      user: {
        findUnique: (args: unknown) => Promise<{ id: string } | null>;
        create: (args: unknown) => Promise<{ id: string; email: string; fullName: string }>;
      };
      parent: {
        create: (args: unknown) => Promise<{ id: string }>;
      };
    };

    const duplicateUser = await prismaTx.user.findUnique({ where: { email } });
    if (duplicateUser) {
      throw new AppError('A user with this parent email already exists. Select the existing parent instead.', 409);
    }

    const user = await prismaTx.user.create({
      data: {
        fullName: `${firstName} ${lastName}`,
        email,
        passwordHash,
        role: 'PARENT',
        schoolId
      }
    });

    return prismaTx.parent.create({
      data: {
        schoolId,
        userId: user.id,
        firstName,
        lastName,
        phone,
        address: normalizeText(parent.address) || undefined
      }
    });
  };

  const resolveGuardians = async (tx: StudentsDb, schoolId: string, guardians: StudentGuardianInput[]) => {
    const resolved: StudentGuardianInput[] = [];

    for (const guardian of guardians) {
      if (guardian.guardianId) {
        resolved.push(guardian);
        continue;
      }

      if (!guardian.parent?.firstName?.trim() || !guardian.parent?.lastName?.trim() || (!guardian.parent.email?.trim() && !guardian.parent.phone?.trim())) {
        throw new AppError('Parent first name, last name, and phone or email are required', 400);
      }

      const similar = await findSimilarParent(tx, schoolId, guardian.parent);
      if (similar) {
        throw new AppError('A similar parent already exists. Select the existing parent before saving this student.', 409);
      }

      const createdParent = await createParentFromGuardian(tx, schoolId, guardian.parent);
      resolved.push({ ...guardian, guardianId: createdParent.id });
    }

    return resolved;
  };

  const upsertDetails = async (tx: StudentsDb, studentId: string, input: ReturnType<typeof normalizeStudentInput>) => {
    if (input.medicalInfo) {
      await tx.studentMedicalInfo?.upsert?.(
        detailUpsert(studentId, {
          bloodType: input.medicalInfo.bloodType,
          allergies: input.medicalInfo.allergies,
          chronicDiseases: input.medicalInfo.chronicDiseases,
          medication: input.medicalInfo.medication,
          doctorName: input.medicalInfo.doctorName,
          doctorPhone: input.medicalInfo.doctorPhone,
          emergencyNotes: input.medicalInfo.emergencyNotes
        })
      );
    }

    if (earlyCategories.includes(input.category) && input.maternelleInfo) {
      await tx.studentMaternelleInfo?.upsert?.(
        detailUpsert(studentId, {
          toiletTrained: input.maternelleInfo.toiletTrained ?? false,
          napNeeded: input.maternelleInfo.napNeeded ?? false,
          foodRestrictions: input.maternelleInfo.foodRestrictions,
          authorizedPickupPersons: input.maternelleInfo.authorizedPickupPersons,
          adaptationNotes: input.maternelleInfo.adaptationNotes,
          favoriteLanguage: input.maternelleInfo.favoriteLanguage,
          separationDifficulty: input.maternelleInfo.separationDifficulty ?? false
        })
      );
    }

    if (primaryCategories.includes(input.category) && input.primaryInfo) {
      await tx.studentPrimaryInfo?.upsert?.(
        detailUpsert(studentId, {
          previousSchool: input.primaryInfo.previousSchool,
          readingLevel: input.primaryInfo.readingLevel,
          writingLevel: input.primaryInfo.writingLevel,
          mathLevel: input.primaryInfo.mathLevel,
          specialNeeds: input.primaryInfo.specialNeeds,
          extracurricularNotes: input.primaryInfo.extracurricularNotes
        })
      );
    }

    if (secondaryCategories.includes(input.category) && input.secondaryInfo) {
      await tx.studentSecondaryInfo?.upsert?.(
        detailUpsert(studentId, {
          previousSchool: input.secondaryInfo.previousSchool,
          section: input.secondaryInfo.section,
          optionName: input.secondaryInfo.optionName,
          orientationNotes: input.secondaryInfo.orientationNotes,
          disciplinaryNotes: input.secondaryInfo.disciplinaryNotes,
          academicLevel: input.secondaryInfo.academicLevel,
          repeatedClass: input.secondaryInfo.repeatedClass ?? false
        })
      );
    }

    if (higherCategories.includes(input.category) && input.universityInfo) {
      await tx.studentUniversityInfo?.upsert?.(
        detailUpsert(studentId, {
          previousInstitution: input.universityInfo.previousInstitution,
          diplomaObtained: input.universityInfo.diplomaObtained,
          program: input.universityInfo.program,
          faculty: input.universityInfo.faculty,
          department: input.universityInfo.department,
          academicYear: input.universityInfo.academicYear,
          registrationType: input.universityInfo.registrationType ? registrationToPrisma[input.universityInfo.registrationType] : undefined,
          scholarshipStatus: input.universityInfo.scholarshipStatus,
          studentEmail: input.universityInfo.studentEmail,
          nationalIdNumber: input.universityInfo.nationalIdNumber
        })
      );
    }
  };

  const writeEnrollmentLog = (tx: StudentsDb, studentId: string, input: ReturnType<typeof normalizeStudentInput>, action: string) => {
    return tx.studentEnrollmentLog?.create?.({
      data: {
        studentId,
        action,
        category: categoryToPrisma[input.category],
        metadata: {
          classId: input.classId,
          schoolYearId: input.schoolYearId,
          guardianCount: input.guardians.length
        }
      }
    });
  };

  return {
    async getCurrentStudent(user: AuthUser) {
      const schoolId = user.schoolId;
      ensureSchoolId(schoolId);
      if (user.role !== 'STUDENT') {
        throw new AppError('Student access is required', 403);
      }

      const student = await db.student.findFirst?.({
        where: { schoolId, userId: user.id },
        include: includeStudentRelations
      });

      if (!student) {
        throw new AppError('Student profile not found', 404);
      }

      return student;
    },

    async listStudents(schoolId: string, query: StudentListQuery = {}, user?: AuthUser) {
      ensureSchoolId(schoolId);
      const page = Math.max(query.page ?? 1, 1);
      const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 100);
      const where = buildWhere(schoolId, query, user);
      const findArgs = {
        where,
        include: includeStudentRelations,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize
      };

      const [students, total] = await Promise.all([db.student.findMany?.(findArgs), db.student.count?.({ where })]);

      return {
        students: students ?? [],
        pagination: {
          page,
          pageSize,
          total: total ?? 0,
          totalPages: Math.max(Math.ceil((total ?? 0) / pageSize), 1)
        }
      };
    },

    getStudentById,

    async createStudent(schoolId: string, rawInput: StudentInput) {
      ensureSchoolId(schoolId);
      const input = normalizeStudentInput(rawInput);
      validateCategoryPayload(input);
      await validateClass(schoolId, input.classId);
      await validateSchoolYear(schoolId, input.schoolYearId);
      await validateGuardians(schoolId, input.guardians);

      const studentCode = input.studentCode || (await generateStudentCode(db, schoolId));
      const duplicate = await db.student.findFirst?.({
        where: {
          schoolId,
          studentCode
        }
      });

      if (duplicate) {
        throw new AppError('A student with this code already exists', 409);
      }

      const operation = async (tx: StudentsDb) => {
        const resolvedGuardians = await resolveGuardians(tx, schoolId, input.guardians);
        const student = (await tx.student.create?.({
          data: {
            schoolId,
            firstName: input.firstName,
            lastName: input.lastName,
            gender: input.gender,
            birthDate: toDate(input.birthDate),
            birthPlace: input.birthPlace,
            nationality: input.nationality,
            photoUrl: input.photoUrl,
            studentCode,
            category: categoryToPrisma[input.category],
            status: statusToPrisma[input.status],
            classId: input.classId,
            schoolYearId: input.schoolYearId,
            isActive: input.status === 'active'
          },
          include: includeStudentRelations
        })) as { id: string } | undefined;

        if (!student) {
          throw new AppError('Student could not be created', 500);
        }

        const resolvedInput = { ...input, guardians: resolvedGuardians };
        await linkLegacyParents(tx, schoolId, student.id, resolvedGuardians);
        await linkGuardians(tx, student.id, resolvedGuardians);
        await upsertDetails(tx, student.id, resolvedInput);
        await writeEnrollmentLog(tx, student.id, resolvedInput, 'created');

        return (
          (await tx.student.findFirst?.({
            where: { id: student.id, schoolId },
            include: includeStudentRelations
          })) ?? student
        );
      };

      return db.$transaction ? db.$transaction(operation) : operation(db);
    },

    async updateStudent(schoolId: string, id: string, rawInput: Partial<StudentInput>) {
      ensureSchoolId(schoolId);
      await getStudentById(schoolId, id);
      const input = normalizeStudentInput(rawInput as StudentInput);

      if (rawInput.category || rawInput.maternelleInfo || rawInput.primaryInfo || rawInput.secondaryInfo || rawInput.universityInfo) {
        validateCategoryPayload(input, { requireCommonFields: false });
      }

      await validateClass(schoolId, input.classId);
      await validateSchoolYear(schoolId, input.schoolYearId);
      await validateGuardians(schoolId, input.guardians);

      const operation = async (tx: StudentsDb) => {
        const resolvedGuardians = rawInput.parentIds || rawInput.guardians ? await resolveGuardians(tx, schoolId, input.guardians) : input.guardians;
        const student = await tx.student.update?.({
          where: { id },
          data: compact({
            firstName: rawInput.firstName,
            lastName: rawInput.lastName,
            gender: rawInput.gender,
            birthDate: toDate(rawInput.birthDate),
            birthPlace: rawInput.birthPlace,
            nationality: rawInput.nationality,
            photoUrl: rawInput.photoUrl,
            studentCode: rawInput.studentCode ?? rawInput.studentNumber,
            category: rawInput.category ? categoryToPrisma[rawInput.category] : undefined,
            status: rawInput.status ? statusToPrisma[rawInput.status] : undefined,
            classId: rawInput.classId,
            schoolYearId: rawInput.schoolYearId,
            isActive: rawInput.status ? rawInput.status === 'active' : undefined
          }),
          include: includeStudentRelations
        });

        if (rawInput.parentIds || rawInput.guardians) {
          await tx.studentParent?.deleteMany?.({ where: { studentId: id, schoolId } });
          await tx.studentGuardian?.deleteMany?.({ where: { studentId: id } });
          await linkLegacyParents(tx, schoolId, id, resolvedGuardians);
          await linkGuardians(tx, id, resolvedGuardians);
        }

        const resolvedInput = { ...input, guardians: resolvedGuardians };
        await upsertDetails(tx, id, resolvedInput);
        await writeEnrollmentLog(tx, id, resolvedInput, 'updated');

        return student;
      };

      return db.$transaction ? db.$transaction(operation) : operation(db);
    },

    async deleteStudent(schoolId: string, id: string) {
      ensureSchoolId(schoolId);
      await db.student
        .findFirst?.({
          where: {
            id,
            schoolId
          }
        })
        .then((student) => {
          if (!student) {
            throw new AppError('Student not found', 404);
          }
        });

      return db.student.update?.({
        where: { id },
        data: { isActive: false, status: 'INACTIVE' }
      });
    },

    async linkParents(schoolId: string, studentId: string, parentIds: string[] = []) {
      return linkLegacyParents(
        db,
        schoolId,
        studentId,
        parentIds.map((guardianId, index) => ({
          guardianId,
          relationshipType: 'guardian',
          isPrimaryContact: index === 0
        }))
      );
    }
  };
};

export const studentsService = createStudentsService();

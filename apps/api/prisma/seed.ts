import bcrypt from 'bcryptjs';
import { PrismaClient, type AttendanceStatus, type PaymentMethod, type PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

const password = 'DemoPass123!';
const academicYear = '2026';
const today = new Date('2026-05-14T00:00:00.000Z');

const schools = [
  { slug: 'kinshasa-lumumba', name: 'EVOYAMWANA Institut Lumumba', city: 'Kinshasa', province: 'Kinshasa' },
  { slug: 'lubumbashi-umoja', name: 'EVOYAMWANA Complexe Scolaire Umoja', city: 'Lubumbashi', province: 'Haut-Katanga' },
  { slug: 'mbuji-mayi-kasai', name: 'EVOYAMWANA Académie Kasaï', city: 'Mbuji-Mayi', province: 'Kasaï-Oriental' },
  { slug: 'goma-amani', name: 'EVOYAMWANA École Amani', city: 'Goma', province: 'Nord-Kivu' },
  { slug: 'matadi-kongo', name: 'EVOYAMWANA Lycée Kongo', city: 'Matadi', province: 'Kongo Central' }
];

const firstNames = [
  'Amina',
  'Beni',
  'Carine',
  'David',
  'Elikia',
  'Fabrice',
  'Grace',
  'Héritier',
  'Ines',
  'Jonathan',
  'Ketsia',
  'Landry',
  'Merveille',
  'Naomie',
  'Oscar',
  'Prisca',
  'Rachel',
  'Samuel',
  'Trésor',
  'Ursule',
  'Vanessa',
  'Wivine',
  'Yannick',
  'Zawadi',
  'Chadrack',
  'Déborah',
  'Emmanuel',
  'Francine',
  'Gédéon',
  'Josiane'
];

const lastNames = [
  'Mbala',
  'Ilunga',
  'Tshibangu',
  'Kabasele',
  'Mbuyi',
  'Lukusa',
  'Kabongo',
  'Nsimba',
  'Mukendi',
  'Kalombo',
  'Mavungu',
  'Kanku',
  'Banza',
  'Mpoyi',
  'Kasongo',
  'Tshimanga',
  'Nzita',
  'Mutombo',
  'Lumbu',
  'Kiala',
  'Ndaya',
  'Moke',
  'Kabeya',
  'Matondo',
  'Kitenge',
  'Munganga',
  'Tshiala',
  'Kambale',
  'Balume',
  'Ngalula'
];

const classLevels = [
  { name: 'Primaire 1 A', level: 'Primaire 1', section: 'A', room: 'Bâtiment A - Salle 01', capacity: 36, cycle: 'Primaire', option: 'Tronc commun', shift: 'Matin' },
  { name: 'Primaire 2 A', level: 'Primaire 2', section: 'A', room: 'Bâtiment A - Salle 02', capacity: 36, cycle: 'Primaire', option: 'Tronc commun', shift: 'Matin' },
  { name: 'Primaire 3 A', level: 'Primaire 3', section: 'A', room: 'Bâtiment A - Salle 03', capacity: 38, cycle: 'Primaire', option: 'Tronc commun', shift: 'Matin' },
  { name: 'Primaire 4 A', level: 'Primaire 4', section: 'A', room: 'Bâtiment B - Salle 04', capacity: 40, cycle: 'Primaire', option: 'Tronc commun', shift: 'Après-midi' },
  { name: 'Primaire 5 A', level: 'Primaire 5', section: 'A', room: 'Bâtiment B - Salle 05', capacity: 40, cycle: 'Primaire', option: 'Tronc commun', shift: 'Après-midi' }
];

const subjectNames = [
  { name: 'Mathématiques', code: 'MATH' },
  { name: 'Français', code: 'FR' },
  { name: 'Sciences', code: 'SCI' },
  { name: 'Histoire', code: 'HIST' },
  { name: 'Éducation civique', code: 'CIV' }
];

const pick = <T>(items: T[], index: number) => items[index % items.length];

const email = (schoolSlug: string, role: string, index: number) => `${role}.${String(index).padStart(2, '0')}@${schoolSlug}.evoyamwana.test`;

const staffRoles = [
  { role: 'DIRECTOR' as const, label: 'Directeur' },
  { role: 'SECRETARY' as const, label: 'Secrétaire' },
  { role: 'ACCOUNTANT' as const, label: 'Comptable' },
  { role: 'CLASS_TUTOR' as const, label: 'Titulaire' },
  { role: 'DISCIPLINE_OFFICER' as const, label: 'Discipline' },
  { role: 'LIBRARIAN' as const, label: 'Bibliothécaire' },
  { role: 'NURSE' as const, label: 'Infirmier' },
  { role: 'TRANSPORT_MANAGER' as const, label: 'Transport' },
  { role: 'CANTEEN_MANAGER' as const, label: 'Cantine' }
];

async function upsertUser(input: {
  fullName: string;
  email: string;
  role:
    | 'SUPER_ADMIN'
    | 'SCHOOL_ADMIN'
    | 'DIRECTOR'
    | 'SECRETARY'
    | 'ACCOUNTANT'
    | 'TEACHER'
    | 'CLASS_TUTOR'
    | 'PARENT'
    | 'STUDENT'
    | 'DISCIPLINE_OFFICER'
    | 'LIBRARIAN'
    | 'NURSE'
    | 'TRANSPORT_MANAGER'
    | 'CANTEEN_MANAGER';
  schoolId: string;
  passwordHash: string;
}) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      fullName: input.fullName,
      role: input.role,
      schoolId: input.schoolId,
      passwordHash: input.passwordHash
    },
    create: input
  });
}

async function upsertNotification(input: {
  schoolId: string;
  userId: string;
  title: string;
  body: string;
  type: 'SYSTEM' | 'ATTENDANCE' | 'GRADE' | 'PAYMENT' | 'MESSAGE';
}) {
  const existing = await prisma.notification.findFirst({
    where: {
      schoolId: input.schoolId,
      userId: input.userId,
      title: input.title,
      type: input.type
    }
  });

  if (existing) {
    return prisma.notification.update({
      where: { id: existing.id },
      data: { body: input.body }
    });
  }

  return prisma.notification.create({ data: input });
}

async function upsertDemoGrade(input: {
  schoolId: string;
  studentId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  score: number;
  maxScore: number;
  coefficient: number;
  term: string;
  comment: string;
}) {
  const existing = await prisma.grade.findFirst({
    where: {
      schoolId: input.schoolId,
      studentId: input.studentId,
      classId: input.classId,
      subjectId: input.subjectId,
      term: input.term,
      comment: input.comment
    }
  });

  const data = {
    schoolId: input.schoolId,
    studentId: input.studentId,
    teacherId: input.teacherId,
    classId: input.classId,
    subjectId: input.subjectId,
    score: input.score,
    maxScore: input.maxScore,
    coefficient: input.coefficient,
    term: input.term,
    comment: input.comment
  };

  return existing ? prisma.grade.update({ where: { id: existing.id }, data }) : prisma.grade.create({ data });
}

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);

  for (const [schoolIndex, schoolSeed] of schools.entries()) {
    const schoolNumber = schoolIndex + 1;
    const school = await prisma.school.upsert({
      where: { email: `contact@${schoolSeed.slug}.evoyamwana.test` },
      update: {
        name: schoolSeed.name,
        country: 'République démocratique du Congo',
        city: schoolSeed.city,
        address: `${schoolSeed.city}, ${schoolSeed.province}`
      },
      create: {
        name: schoolSeed.name,
        country: 'République démocratique du Congo',
        city: schoolSeed.city,
        email: `contact@${schoolSeed.slug}.evoyamwana.test`,
        phone: `+24381000${String(schoolNumber).padStart(4, '0')}`,
        address: `${schoolSeed.city}, ${schoolSeed.province}`
      }
    });

    for (let index = 1; index <= 5; index += 1) {
      await upsertUser({
        fullName: `Super Admin ${index} ${schoolSeed.city}`,
        email: email(schoolSeed.slug, 'superadmin', index),
        role: 'SUPER_ADMIN',
        schoolId: school.id,
        passwordHash
      });
    }

    for (let index = 1; index <= 10; index += 1) {
      await upsertUser({
        fullName: `Admin Scolaire ${index} ${schoolSeed.city}`,
        email: email(schoolSeed.slug, 'schooladmin', index),
        role: 'SCHOOL_ADMIN',
        schoolId: school.id,
        passwordHash
      });
    }

    for (const staffRole of staffRoles) {
      await upsertUser({
        fullName: `${staffRole.label} ${schoolSeed.city}`,
        email: email(schoolSeed.slug, staffRole.role.toLowerCase(), 1),
        role: staffRole.role,
        schoolId: school.id,
        passwordHash
      });
    }

    const teachers = [];
    for (let index = 1; index <= 5; index += 1) {
      const user = await upsertUser({
        fullName: `${pick(firstNames, index + schoolIndex)} ${pick(lastNames, index + schoolIndex)} Teacher`,
        email: email(schoolSeed.slug, 'teacher', index),
        role: 'TEACHER',
        schoolId: school.id,
        passwordHash
      });

      const teacher = await prisma.teacher.upsert({
        where: {
          schoolId_employeeNumber: {
            schoolId: school.id,
            employeeNumber: `T-${schoolNumber}${String(index).padStart(3, '0')}`
          }
        },
        update: {
          userId: user.id,
          firstName: pick(firstNames, index + schoolIndex),
          lastName: pick(lastNames, index + schoolIndex),
          phone: `+243820${schoolNumber}${String(index).padStart(6, '0')}`
        },
        create: {
          schoolId: school.id,
          userId: user.id,
          employeeNumber: `T-${schoolNumber}${String(index).padStart(3, '0')}`,
          firstName: pick(firstNames, index + schoolIndex),
          lastName: pick(lastNames, index + schoolIndex),
          phone: `+243820${schoolNumber}${String(index).padStart(6, '0')}`
        }
      });
      teachers.push(teacher);
    }

    const classes = [];
    for (const [index, classSeed] of classLevels.entries()) {
      const teacher = teachers[index];
      const classRecord = await prisma.class.upsert({
        where: {
          schoolId_name_academicYear: {
            schoolId: school.id,
            name: classSeed.name,
            academicYear
          }
        },
        update: {
          teacherId: teacher.id,
          level: classSeed.level,
          section: classSeed.section,
          room: classSeed.room,
          capacity: classSeed.capacity,
          cycle: classSeed.cycle,
          option: classSeed.option,
          shift: classSeed.shift,
          description: `${classSeed.name} de ${schoolSeed.name}, organisée pour ${classSeed.shift.toLowerCase()}.`
        },
        create: {
          schoolId: school.id,
          teacherId: teacher.id,
          name: classSeed.name,
          level: classSeed.level,
          section: classSeed.section,
          academicYear,
          room: classSeed.room,
          capacity: classSeed.capacity,
          cycle: classSeed.cycle,
          option: classSeed.option,
          shift: classSeed.shift,
          description: `${classSeed.name} de ${schoolSeed.name}, organisée pour ${classSeed.shift.toLowerCase()}.`
        }
      });
      classes.push(classRecord);

      for (const [subjectIndex, subjectSeed] of subjectNames.entries()) {
        const subjectTeacher = teachers[subjectIndex % teachers.length];
        const subjectCode = subjectIndex === index
          ? `${subjectSeed.code}-${schoolNumber}-${index + 1}`
          : `${subjectSeed.code}-${schoolNumber}-${index + 1}-${subjectIndex + 1}`;

        await prisma.subject.upsert({
          where: {
            schoolId_code: {
              schoolId: school.id,
              code: subjectCode
            }
          },
          update: {
            classId: classRecord.id,
            teacherId: subjectTeacher.id,
            name: subjectSeed.name,
            description: `${subjectSeed.name} - ${classSeed.level}`
          },
          create: {
            schoolId: school.id,
            classId: classRecord.id,
            teacherId: subjectTeacher.id,
            name: subjectSeed.name,
            code: subjectCode,
            description: `${subjectSeed.name} - ${classSeed.level}`
          }
        });
      }
    }

    const parents = [];
    for (let index = 1; index <= 30; index += 1) {
      const firstName = pick(firstNames, index + schoolIndex * 2);
      const lastName = pick(lastNames, index + schoolIndex * 3);
      const user = await upsertUser({
        fullName: `${firstName} ${lastName} Parent`,
        email: email(schoolSeed.slug, 'parent', index),
        role: 'PARENT',
        schoolId: school.id,
        passwordHash
      });

      const parent = await prisma.parent.upsert({
        where: { userId: user.id },
        update: {
          firstName,
          lastName,
          phone: `+243830${schoolNumber}${String(index).padStart(6, '0')}`,
          address: schoolSeed.city
        },
        create: {
          schoolId: school.id,
          userId: user.id,
          firstName,
          lastName,
          phone: `+243830${schoolNumber}${String(index).padStart(6, '0')}`,
          address: schoolSeed.city
        }
      });
      parents.push(parent);
    }

    for (let index = 1; index <= 30; index += 1) {
      const firstName = pick(firstNames, index + schoolIndex);
      const lastName = pick(lastNames, index + schoolIndex);
      const classRecord = classes[(index - 1) % classes.length];
      const parent = parents[index - 1];
      const user = await upsertUser({
        fullName: `${firstName} ${lastName} Student`,
        email: email(schoolSeed.slug, 'student', index),
        role: 'STUDENT',
        schoolId: school.id,
        passwordHash
      });

      const student = await prisma.student.upsert({
        where: {
          schoolId_studentCode: {
            schoolId: school.id,
            studentCode: `ST-${schoolNumber}-${String(index).padStart(4, '0')}`
          }
        },
        update: {
          userId: user.id,
          classId: classRecord.id,
          firstName,
          lastName,
          gender: index % 2 === 0 ? 'Female' : 'Male',
          birthDate: new Date(`${2012 + (index % 6)}-${String((index % 9) + 1).padStart(2, '0')}-15T00:00:00.000Z`),
          address: schoolSeed.city,
          isActive: true
        },
        create: {
          schoolId: school.id,
          userId: user.id,
          classId: classRecord.id,
          studentCode: `ST-${schoolNumber}-${String(index).padStart(4, '0')}`,
          firstName,
          lastName,
          gender: index % 2 === 0 ? 'Female' : 'Male',
          birthDate: new Date(`${2012 + (index % 6)}-${String((index % 9) + 1).padStart(2, '0')}-15T00:00:00.000Z`),
          photoUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(`${firstName} ${lastName}`)}`,
          address: schoolSeed.city,
          isActive: true
        }
      });

      await prisma.studentParent.upsert({
        where: {
          studentId_parentId: {
            studentId: student.id,
            parentId: parent.id
          }
        },
        update: {
          relationship: index % 2 === 0 ? 'Mother' : 'Father',
          isPrimary: true
        },
        create: {
          schoolId: school.id,
          studentId: student.id,
          parentId: parent.id,
          relationship: index % 2 === 0 ? 'Mother' : 'Father',
          isPrimary: true
        }
      });

      const attendanceStatus: AttendanceStatus = index % 13 === 0 ? 'ABSENT' : index % 9 === 0 ? 'LATE' : index % 7 === 0 ? 'EXCUSED' : 'PRESENT';
      await prisma.attendance.upsert({
        where: {
          studentId_classId_date: {
            studentId: student.id,
            classId: classRecord.id,
            date: today
          }
        },
        update: { status: attendanceStatus },
        create: {
          schoolId: school.id,
          studentId: student.id,
          classId: classRecord.id,
          date: today,
          status: attendanceStatus
        }
      });

      const paymentStatus: PaymentStatus = index % 10 === 0 ? 'OVERDUE' : index % 3 === 0 ? 'PARTIAL' : 'PENDING';
      const paymentMethod: PaymentMethod = index % 2 === 0 ? 'MOBILE_MONEY' : 'BANK_TRANSFER';
      await prisma.payment.upsert({
        where: { receiptNumber: `EV-${schoolNumber}-${String(index).padStart(4, '0')}` },
        update: {
          amount: 150000,
          amountPaid: paymentStatus === 'PARTIAL' ? 75000 : 0,
          dueDate: new Date('2026-06-30T00:00:00.000Z'),
          status: paymentStatus,
          paymentMethod,
          description: 'Frais scolaires - Trimestre 2'
        },
        create: {
          schoolId: school.id,
          studentId: student.id,
          parentId: parent.id,
          amount: 150000,
          amountPaid: paymentStatus === 'PARTIAL' ? 75000 : 0,
          dueDate: new Date('2026-06-30T00:00:00.000Z'),
          status: paymentStatus,
          paymentMethod,
          receiptNumber: `EV-${schoolNumber}-${String(index).padStart(4, '0')}`,
          description: 'Frais scolaires - Trimestre 2'
        }
      });

      const classSubjects = await prisma.subject.findMany({
        where: { schoolId: school.id, classId: classRecord.id },
        orderBy: { code: 'asc' }
      });

      if (index <= 15) {
        const terms = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
        for (const [subjectIndex, subject] of classSubjects.entries()) {
          if (!subject.teacherId) continue;

          for (const [termIndex, term] of terms.entries()) {
            await upsertDemoGrade({
              schoolId: school.id,
              studentId: student.id,
              teacherId: subject.teacherId,
              classId: classRecord.id,
              subjectId: subject.id,
              score: Math.min(20, 9 + termIndex + ((index + subjectIndex) % 10)),
              maxScore: 20,
              coefficient: subjectIndex === 0 ? 2 : 1,
              term,
              comment: 'Évaluation demo'
            });
          }
        }
      }
    }

    const admins = await prisma.user.findMany({
      where: { schoolId: school.id, role: 'SCHOOL_ADMIN' },
      take: 3
    });

    const healthRecords = [
      {
        title: 'Retards répétés en matinée',
        description: 'Plusieurs élèves arrivent après le début des cours. Prévoir une sensibilisation parents et transport.',
        category: 'ATTENDANCE' as const,
        severity: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        owner: 'Surveillant général',
        dueDate: new Date('2026-06-10T00:00:00.000Z')
      },
      {
        title: 'Préparation inspection PROVED',
        description: 'Regrouper agrément, listes élèves, rapports de présence et dossiers enseignants avant la visite.',
        category: 'COMPLIANCE' as const,
        severity: 'MEDIUM' as const,
        status: 'OPEN' as const,
        owner: 'Direction',
        dueDate: new Date('2026-06-18T00:00:00.000Z')
      },
      {
        title: 'Renforcement lecture et mathématiques',
        description: 'Identifier les classes avec moyenne faible, organiser des visites de cours et lancer des séances de remédiation.',
        category: 'PEDAGOGY' as const,
        severity: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        owner: 'Direction pédagogique',
        dueDate: new Date('2026-06-19T00:00:00.000Z')
      },
      {
        title: 'Bancs à réparer dans deux salles',
        description: 'Les classes les plus chargées ont besoin de réparation de bancs avant les examens.',
        category: 'INFRASTRUCTURE' as const,
        severity: 'MEDIUM' as const,
        status: 'OPEN' as const,
        owner: 'Intendance',
        dueDate: new Date('2026-06-22T00:00:00.000Z')
      },
      {
        title: 'Suivi familles avec soldes ouverts',
        description: 'La pression sur la caisse augmente. Prioriser une communication respectueuse avec les familles concernées.',
        category: 'FINANCE' as const,
        severity: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        owner: 'Comptabilité',
        dueDate: new Date('2026-06-14T00:00:00.000Z')
      }
    ];

    for (const record of healthRecords) {
      const existing = await prisma.schoolHealthRecord.findFirst({
        where: {
          schoolId: school.id,
          title: record.title
        }
      });

      const data = {
        schoolId: school.id,
        ...record
      };

      if (existing) {
        await prisma.schoolHealthRecord.update({ where: { id: existing.id }, data: record });
      } else {
        await prisma.schoolHealthRecord.create({ data });
      }
    }

    const sectorDossiers = [
      {
        sector: 'TEACHERS' as const,
        title: 'Contrats enseignants à vérifier',
        description: 'Contrôler les contrats, charges horaires et pièces administratives des enseignants avant le conseil de direction.',
        owner: 'Direction pédagogique',
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        dueDate: new Date('2026-06-12T00:00:00.000Z')
      },
      {
        sector: 'ACCOUNTANT' as const,
        title: 'Relances familles avant clôture caisse',
        description: 'Préparer une relance respectueuse pour les familles avec soldes ouverts et rapprocher les reçus mobile money.',
        owner: 'Comptabilité',
        status: 'OPEN' as const,
        priority: 'HIGH' as const,
        dueDate: new Date('2026-06-16T00:00:00.000Z')
      },
      {
        sector: 'DISCIPLINE' as const,
        title: 'Suivi des retards récurrents',
        description: 'Identifier les élèves concernés, contacter les parents et vérifier les trajets qui créent des retards répétés.',
        owner: 'Surveillant général',
        status: 'IN_PROGRESS' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date('2026-06-11T00:00:00.000Z')
      },
      {
        sector: 'CANTEEN' as const,
        title: 'Liste cantine trimestre 2',
        description: 'Mettre à jour la liste des élèves inscrits, allergies signalées et soldes liés aux repas.',
        owner: 'Responsable cantine',
        status: 'OPEN' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date('2026-06-20T00:00:00.000Z')
      },
      {
        sector: 'COLLABORATORS' as const,
        title: 'Sponsor fournitures scolaires',
        description: 'Finaliser le dossier partenaire pour les fournitures, avec convention, visibilité et calendrier de remise.',
        owner: 'Direction',
        status: 'OPEN' as const,
        priority: 'CRITICAL' as const,
        dueDate: new Date('2026-06-08T00:00:00.000Z')
      }
    ];

    for (const dossier of sectorDossiers) {
      const existing = await prisma.schoolSectorDossier.findFirst({
        where: {
          schoolId: school.id,
          sector: dossier.sector,
          title: dossier.title
        }
      });

      const data = {
        schoolId: school.id,
        ...dossier
      };

      if (existing) {
        await prisma.schoolSectorDossier.update({ where: { id: existing.id }, data: dossier });
      } else {
        await prisma.schoolSectorDossier.create({ data });
      }
    }

    const directorReports = [
      {
        type: 'ACADEMIC' as const,
        title: 'Synthèse performance élèves - Trimestre 2',
        summary: 'Analyse des moyennes par classe, matières faibles, élèves à accompagner et progression vers les examens.',
        period: 'Trimestre 2 - 2026',
        owner: 'Direction pédagogique',
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        dueDate: new Date('2026-06-17T00:00:00.000Z')
      },
      {
        type: 'ACADEMIC' as const,
        title: 'Dossier TENAFEP et examens officiels par classe',
        summary: 'Préparer les listes candidats, bulletins, pièces PROVED, convocations parents et suivi des classes terminales.',
        period: 'Examens officiels 2026',
        owner: 'Direction',
        status: 'IN_PROGRESS' as const,
        priority: 'CRITICAL' as const,
        dueDate: new Date('2026-06-21T00:00:00.000Z')
      },
      {
        type: 'FINANCE' as const,
        title: 'Résumé financier et chiffre d’affaires école',
        summary: 'Vue des paiements attendus, montants encaissés, soldes ouverts et prévisions avant clôture du trimestre.',
        period: 'Mai-Juin 2026',
        owner: 'Comptabilité',
        status: 'OPEN' as const,
        priority: 'HIGH' as const,
        dueDate: new Date('2026-06-15T00:00:00.000Z')
      },
      {
        type: 'COMPLIANCE' as const,
        title: 'Dossier conformité ministère',
        summary: 'Préparation PROVED: agrément, listes, registres, affectations enseignants et documents officiels à jour.',
        period: 'Inspection 2026',
        owner: 'Direction',
        status: 'OPEN' as const,
        priority: 'CRITICAL' as const,
        dueDate: new Date('2026-06-09T00:00:00.000Z')
      },
      {
        type: 'DISCIPLINE' as const,
        title: 'Rapport présences et discipline',
        summary: 'Retards, absences récurrentes, incidents disciplinaires et actions de médiation avec les familles.',
        period: 'Semaine 24 - 2026',
        owner: 'Surveillant général',
        status: 'IN_PROGRESS' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date('2026-06-13T00:00:00.000Z')
      },
      {
        type: 'PARTNERSHIP' as const,
        title: 'Partenaires, sponsors et projets humanitaires',
        summary: 'Suivi des contacts sponsors, besoins prioritaires, engagements attendus et preuves de reconnaissance.',
        period: 'Deuxième semestre 2026',
        owner: 'Direction',
        status: 'OPEN' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date('2026-06-25T00:00:00.000Z')
      }
    ];

    for (const report of directorReports) {
      const existing = await prisma.schoolDirectorReport.findFirst({
        where: {
          schoolId: school.id,
          type: report.type,
          title: report.title
        }
      });

      const data = {
        schoolId: school.id,
        ...report
      };

      if (existing) {
        await prisma.schoolDirectorReport.update({ where: { id: existing.id }, data: report });
      } else {
        await prisma.schoolDirectorReport.create({ data });
      }
    }

    for (const [index, admin] of admins.entries()) {
      await upsertNotification({
        schoolId: school.id,
        userId: admin.id,
        title: index === 0 ? 'Présences à vérifier' : index === 1 ? 'Paiements en attente' : 'Rentrée administrative',
        body: index === 0 ? 'Certains élèves sont absents ou en retard aujourd’hui.' : index === 1 ? 'Des familles ont encore des soldes ouverts.' : 'Les données de l’école sont prêtes pour le trimestre.',
        type: index === 0 ? 'ATTENDANCE' : index === 1 ? 'PAYMENT' : 'SYSTEM'
      });
    }

    console.log(`Seeded ${schoolSeed.name}: 5 super admins, 10 school admins, 5 teachers, 30 parents, 30 students.`);
  }

  console.log(`\nEVOYAMWANA seed complete.`);
  console.log(`Password for all seeded users: ${password}`);
  console.log(`Example login: schooladmin.01@${schools[0].slug}.evoyamwana.test`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

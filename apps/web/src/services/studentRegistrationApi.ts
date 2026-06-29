import type { StudentFormPayload } from './students.service';

export type StudentCategory =
  | 'creche'
  | 'maternelle'
  | 'primaire'
  | 'secondaire'
  | 'secondaire_general'
  | 'secondaire_technique'
  | 'formation'
  | 'haute_ecole'
  | 'universite'
  | 'mixte';
export type StudentStatus = 'active' | 'inactive' | 'transferred' | 'graduated';
export type GuardianRelationshipType = 'father' | 'mother' | 'guardian' | 'tutor' | 'other';
export type RegistrationType = 'new' | 'transfer' | 're_registration';

export interface StudentGeneralForm {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  studentCode: string;
  classId: string;
  photoUrl: string;
  schoolYearId: string;
  academicYear: string;
  status: StudentStatus;
}

export interface StudentGuardianForm {
  guardianId: string;
  parent: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  createNew: boolean;
  relationshipType: GuardianRelationshipType;
  isPrimaryContact: boolean;
  emergencyContact: boolean;
  canPickUpChild: boolean;
}

export interface StudentMedicalForm {
  bloodType: string;
  allergies: string;
  chronicDiseases: string;
  medication: string;
  doctorName: string;
  doctorPhone: string;
  emergencyNotes: string;
}

export interface MaternelleSpecificForm {
  toiletTrained: boolean;
  napNeeded: boolean;
  foodRestrictions: string;
  authorizedPickupPersons: string;
  adaptationNotes: string;
  favoriteLanguage: string;
  separationDifficulty: boolean;
}

export interface PrimarySpecificForm {
  previousSchool: string;
  readingLevel: string;
  writingLevel: string;
  mathLevel: string;
  specialNeeds: string;
  extracurricularNotes: string;
}

export interface SecondarySpecificForm {
  previousSchool: string;
  section: string;
  optionName: string;
  academicLevel: string;
  repeatedClass: boolean;
  orientationNotes: string;
  disciplinaryNotes: string;
}

export interface UniversitySpecificForm {
  previousInstitution: string;
  diplomaObtained: string;
  faculty: string;
  department: string;
  program: string;
  academicYear: string;
  registrationType: RegistrationType;
  scholarshipStatus: string;
  studentEmail: string;
  nationalIdNumber: string;
}

export interface StudentSpecificForm {
  maternelle: MaternelleSpecificForm;
  primaire: PrimarySpecificForm;
  secondaire: SecondarySpecificForm;
  universite: UniversitySpecificForm;
}

export interface StudentRegistrationFormData {
  category: StudentCategory;
  general: StudentGeneralForm;
  guardians: StudentGuardianForm[];
  medical: StudentMedicalForm;
  specific: StudentSpecificForm;
}

const optional = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const compact = <T extends Record<string, unknown>>(input: T) =>
  Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== '')) as Partial<T>;

export const createEmptyRegistrationForm = (): StudentRegistrationFormData => ({
  category: 'primaire',
  general: {
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    nationality: '',
    studentCode: '',
    classId: '',
    photoUrl: '',
    schoolYearId: '',
    academicYear: '2026',
    status: 'active'
  },
  guardians: [],
  medical: {
    bloodType: '',
    allergies: '',
    chronicDiseases: '',
    medication: '',
    doctorName: '',
    doctorPhone: '',
    emergencyNotes: ''
  },
  specific: {
    maternelle: {
      toiletTrained: false,
      napNeeded: false,
      foodRestrictions: '',
      authorizedPickupPersons: '',
      adaptationNotes: '',
      favoriteLanguage: '',
      separationDifficulty: false
    },
    primaire: {
      previousSchool: '',
      readingLevel: '',
      writingLevel: '',
      mathLevel: '',
      specialNeeds: '',
      extracurricularNotes: ''
    },
    secondaire: {
      previousSchool: '',
      section: '',
      optionName: '',
      academicLevel: '',
      repeatedClass: false,
      orientationNotes: '',
      disciplinaryNotes: ''
    },
    universite: {
      previousInstitution: '',
      diplomaObtained: '',
      faculty: '',
      department: '',
      program: '',
      academicYear: '',
      registrationType: 'new',
      scholarshipStatus: '',
      studentEmail: '',
      nationalIdNumber: ''
    }
  }
});

export const toBackendStudentPayload = (form: StudentRegistrationFormData): StudentFormPayload => {
  const guardians = form.guardians.filter((guardian) => guardian.guardianId || (guardian.parent.firstName.trim() && guardian.parent.lastName.trim()));
  const payload: StudentFormPayload = {
    category: form.category,
    firstName: form.general.firstName.trim(),
    lastName: form.general.lastName.trim(),
    gender: optional(form.general.gender),
    birthDate: optional(form.general.birthDate),
    birthPlace: optional(form.general.birthPlace),
    nationality: optional(form.general.nationality),
    studentCode: optional(form.general.studentCode),
    classId: optional(form.general.classId),
    photoUrl: optional(form.general.photoUrl),
    schoolYearId: optional(form.general.schoolYearId),
    status: form.general.status,
    parentIds: guardians.map((guardian) => guardian.guardianId).filter(Boolean),
    guardians: guardians.map((guardian) => ({
      guardianId: guardian.guardianId || undefined,
      parent: guardian.guardianId
        ? undefined
        : compact({
            firstName: optional(guardian.parent.firstName),
            lastName: optional(guardian.parent.lastName),
            email: optional(guardian.parent.email),
            phone: optional(guardian.parent.phone),
            address: optional(guardian.parent.address)
          }) as { firstName: string; lastName: string; email?: string; phone?: string; address?: string },
      relationshipType: guardian.relationshipType,
      isPrimaryContact: guardian.isPrimaryContact,
      emergencyContact: guardian.emergencyContact,
      canPickUpChild: guardian.canPickUpChild
    }))
  };

  const medicalInfo = compact({
    bloodType: optional(form.medical.bloodType),
    allergies: optional(form.medical.allergies),
    chronicDiseases: optional(form.medical.chronicDiseases),
    medication: optional(form.medical.medication),
    doctorName: optional(form.medical.doctorName),
    doctorPhone: optional(form.medical.doctorPhone),
    emergencyNotes: optional(form.medical.emergencyNotes)
  });

  if (Object.keys(medicalInfo).length) {
    payload.medicalInfo = medicalInfo;
  }

  if (form.category === 'creche' || form.category === 'maternelle') {
    payload.maternelleInfo = compact({
      ...form.specific.maternelle,
      foodRestrictions: optional(form.specific.maternelle.foodRestrictions),
      adaptationNotes: optional(form.specific.maternelle.adaptationNotes),
      favoriteLanguage: optional(form.specific.maternelle.favoriteLanguage),
      authorizedPickupPersons: form.specific.maternelle.authorizedPickupPersons
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    });
  }

  if (form.category === 'primaire' || form.category === 'mixte') {
    payload.primaryInfo = compact({
      previousSchool: optional(form.specific.primaire.previousSchool),
      readingLevel: optional(form.specific.primaire.readingLevel),
      writingLevel: optional(form.specific.primaire.writingLevel),
      mathLevel: optional(form.specific.primaire.mathLevel),
      specialNeeds: optional(form.specific.primaire.specialNeeds),
      extracurricularNotes: optional(form.specific.primaire.extracurricularNotes)
    });
  }

  if (form.category === 'secondaire' || form.category === 'secondaire_general' || form.category === 'secondaire_technique' || form.category === 'formation') {
    payload.secondaryInfo = compact({
      previousSchool: optional(form.specific.secondaire.previousSchool),
      section: optional(form.specific.secondaire.section),
      optionName: optional(form.specific.secondaire.optionName),
      academicLevel: optional(form.specific.secondaire.academicLevel),
      repeatedClass: form.specific.secondaire.repeatedClass,
      orientationNotes: optional(form.specific.secondaire.orientationNotes),
      disciplinaryNotes: optional(form.specific.secondaire.disciplinaryNotes)
    });
  }

  if (form.category === 'haute_ecole' || form.category === 'universite') {
    payload.universityInfo = compact({
      previousInstitution: optional(form.specific.universite.previousInstitution),
      diplomaObtained: optional(form.specific.universite.diplomaObtained),
      faculty: optional(form.specific.universite.faculty),
      department: optional(form.specific.universite.department),
      program: optional(form.specific.universite.program),
      academicYear: optional(form.specific.universite.academicYear),
      registrationType: form.specific.universite.registrationType,
      scholarshipStatus: optional(form.specific.universite.scholarshipStatus),
      studentEmail: optional(form.specific.universite.studentEmail),
      nationalIdNumber: optional(form.specific.universite.nationalIdNumber)
    });
  }

  return payload;
};

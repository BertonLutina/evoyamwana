import type { TeacherDto, TeacherProfileInput } from '@evoyamwana/shared';

export const employmentStatusLabels: Record<NonNullable<TeacherDto['employmentStatus']>, string> = {
  ACTIVE: 'Actif',
  ON_LEAVE: 'En congé',
  INACTIVE: 'Inactif'
};

export const formatTeacherDate = (value?: string | null) => {
  if (!value) return 'Non renseigné';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
};

export const toDateInputValue = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export const uniqueSubjects = (teacher?: TeacherDto | null) => {
  const map = new Map<string, NonNullable<TeacherDto['subjects']>[number]>();
  for (const subject of teacher?.subjects ?? []) {
    if (!map.has(subject.id)) map.set(subject.id, subject);
  }
  return [...map.values()];
};

export const getTeacherAvatarUrl = (
  teacher?: Pick<TeacherDto, 'photoUrl' | 'firstName' | 'lastName'> | null
) => {
  const photo = teacher?.photoUrl?.trim();
  if (photo) return photo;
  const seed = encodeURIComponent(`${teacher?.firstName ?? 'E'} ${teacher?.lastName ?? 'V'}`);
  return `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;
};

export const getTeacherDisplayName = (teacher?: Pick<TeacherDto, 'firstName' | 'lastName'> | null) =>
  teacher ? `${teacher.firstName} ${teacher.lastName}`.trim() : 'Enseignant';

export const teacherToFormPayload = (teacher: TeacherDto): TeacherProfileInput & {
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber: string;
} => ({
  firstName: teacher.firstName,
  lastName: teacher.lastName,
  email: teacher.user?.email ?? '',
  employeeNumber: teacher.employeeNumber,
  phone: teacher.phone ?? '',
  birthDate: toDateInputValue(teacher.birthDate) || null,
  birthPlace: teacher.birthPlace ?? '',
  gender: teacher.gender ?? '',
  nationality: teacher.nationality ?? '',
  address: teacher.address ?? '',
  photoUrl: teacher.photoUrl ?? '',
  hireDate: toDateInputValue(teacher.hireDate) || null,
  qualification: teacher.qualification ?? '',
  specialization: teacher.specialization ?? '',
  nationalId: teacher.nationalId ?? '',
  emergencyContactName: teacher.emergencyContactName ?? '',
  emergencyContactPhone: teacher.emergencyContactPhone ?? '',
  bio: teacher.bio ?? '',
  employmentStatus: teacher.employmentStatus ?? 'ACTIVE'
});

export const cleanTeacherPayload = (form: TeacherProfileInput) => ({
  ...form,
  phone: form.phone || null,
  birthDate: form.birthDate || null,
  birthPlace: form.birthPlace || null,
  gender: form.gender || null,
  nationality: form.nationality || null,
  address: form.address || null,
  photoUrl: form.photoUrl || null,
  hireDate: form.hireDate || null,
  qualification: form.qualification || null,
  specialization: form.specialization || null,
  nationalId: form.nationalId || null,
  emergencyContactName: form.emergencyContactName || null,
  emergencyContactPhone: form.emergencyContactPhone || null,
  bio: form.bio || null
});

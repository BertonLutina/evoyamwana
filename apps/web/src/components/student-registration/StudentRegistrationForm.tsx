import type { ClassDto, ParentDto, StudentDto } from '@evoyamwana/shared';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Button } from '../Button';
import { createEmptyRegistrationForm, toBackendStudentPayload, type StudentRegistrationFormData } from '../../services/studentRegistrationApi';
import type { StudentFormPayload } from '../../services/students.service';
import { validateCompleteStudentRegistration, validateStudentRegistrationStep, type StudentRegistrationStep, type StudentValidationErrors } from '../../services/studentValidation';
import { StudentCategoryStep } from './StudentCategoryStep';
import { StudentGeneralInfoStep } from './StudentGeneralInfoStep';
import { StudentGuardiansStep } from './StudentGuardiansStep';
import { StudentMedicalInfoStep } from './StudentMedicalInfoStep';
import { StudentSpecificInfoStep } from './StudentSpecificInfoStep';
import { StudentSummaryStep } from './StudentSummaryStep';

interface Props {
  mode: 'create' | 'edit';
  student?: StudentDto;
  classes: ClassDto[];
  parents: ParentDto[];
  isSubmitting: boolean;
  optionsError?: string;
  onSubmit: (payload: StudentFormPayload) => Promise<void>;
  onCancel: () => void;
}

const steps = ['Catégorie', 'Général', 'Responsables', 'Médical', 'Spécifique', 'Résumé'] as const;

const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : '');
const normalizeCategory = (value?: string | null): StudentRegistrationFormData['category'] => {
  const normalized = value?.toLowerCase();
  const categories: StudentRegistrationFormData['category'][] = ['creche', 'maternelle', 'primaire', 'secondaire', 'secondaire_general', 'secondaire_technique', 'formation', 'haute_ecole', 'universite', 'mixte'];
  return categories.includes(normalized as StudentRegistrationFormData['category']) ? normalized as StudentRegistrationFormData['category'] : 'primaire';
};
const normalizeStatus = (value?: string | null): StudentRegistrationFormData['general']['status'] => {
  const normalized = value?.toLowerCase();
  return normalized === 'active' || normalized === 'inactive' || normalized === 'transferred' || normalized === 'graduated' ? normalized : 'active';
};

const createInitialForm = (student?: StudentDto): StudentRegistrationFormData => {
  const base = createEmptyRegistrationForm();
  const extended = student as StudentDto & {
    category?: StudentRegistrationFormData['category'];
    status?: StudentRegistrationFormData['general']['status'];
    birthPlace?: string | null;
    nationality?: string | null;
    schoolYearId?: string | null;
    medicalInfo?: Partial<StudentRegistrationFormData['medical']>;
    guardians?: Array<{
      guardianId?: string;
      guardian?: { id: string };
      relationshipType?: 'father' | 'mother' | 'guardian' | 'tutor' | 'other';
      isPrimaryContact?: boolean;
      emergencyContact?: boolean;
      canPickUpChild?: boolean;
    }>;
  };

  if (!student) return base;

  return {
    ...base,
    category: normalizeCategory(extended.category),
    general: {
      ...base.general,
      firstName: student.firstName ?? '',
      lastName: student.lastName ?? '',
      gender: student.gender ?? '',
      birthDate: toDateInput(student.birthDate),
      birthPlace: extended.birthPlace ?? '',
      nationality: extended.nationality ?? '',
      photoUrl: student.photoUrl ?? '',
      studentCode: student.studentCode ?? '',
      classId: student.classId ?? '',
      schoolYearId: extended.schoolYearId ?? '',
      status: extended.status ? normalizeStatus(extended.status) : student.isActive ? 'active' : 'inactive'
    },
    guardians:
      extended.guardians?.map((guardian, index) => ({
        guardianId: guardian.guardianId ?? guardian.guardian?.id ?? '',
        parent: { firstName: '', lastName: '', email: '', phone: '', address: '' },
        createNew: false,
        relationshipType: guardian.relationshipType ?? 'guardian',
        isPrimaryContact: guardian.isPrimaryContact ?? index === 0,
        emergencyContact: guardian.emergencyContact ?? index === 0,
        canPickUpChild: guardian.canPickUpChild ?? false
      })) ??
      student.parents?.map((item, index) => ({
        guardianId: item.parent.id,
        parent: {
          firstName: item.parent.firstName ?? '',
          lastName: item.parent.lastName ?? '',
          email: (item.parent as { user?: { email?: string } }).user?.email ?? '',
          phone: item.parent.phone ?? '',
          address: (item.parent as { address?: string | null }).address ?? ''
        },
        createNew: false,
        relationshipType: 'guardian',
        isPrimaryContact: index === 0,
        emergencyContact: index === 0,
        canPickUpChild: false
      })) ??
      [],
    medical: { ...base.medical, ...extended.medicalInfo }
  };
};

export const StudentRegistrationForm = ({ mode, student, classes, parents, isSubmitting, optionsError, onSubmit, onCancel }: Props) => {
  const initialForm = useMemo(() => createInitialForm(student), [student]);
  const [form, setForm] = useState<StudentRegistrationFormData>(initialForm);
  const [step, setStep] = useState<StudentRegistrationStep>(0);
  const [errors, setErrors] = useState<StudentValidationErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');

  const currentErrors = useMemo(() => errors, [errors]);
  const isLastStep = step === 5;

  const goNext = () => {
    const stepErrors = validateStudentRegistrationStep(step, form);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) return;
    setStep((current) => Math.min(current + 1, 5) as StudentRegistrationStep);
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0) as StudentRegistrationStep);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    setSuccess('');

    if (!isLastStep) {
      goNext();
      return;
    }

    const validationErrors = validateCompleteStudentRegistration(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setSubmitError('Certaines informations obligatoires sont manquantes.');
      return;
    }

    try {
      await onSubmit(toBackendStudentPayload(form));
      setSuccess(mode === 'create' ? 'Inscription enregistrée.' : 'Inscription mise à jour.');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Impossible d’enregistrer l’inscription.');
    }
  };

  const stepContent = [
    <StudentCategoryStep key="category" form={form} setForm={setForm} errors={currentErrors} />,
    <StudentGeneralInfoStep key="general" form={form} setForm={setForm} classes={classes} errors={currentErrors} />,
    <StudentGuardiansStep key="guardians" form={form} setForm={setForm} parents={parents} errors={currentErrors} />,
    <StudentMedicalInfoStep key="medical" form={form} setForm={setForm} errors={currentErrors} />,
    <StudentSpecificInfoStep key="specific" form={form} setForm={setForm} errors={currentErrors} />,
    <StudentSummaryStep key="summary" form={form} classes={classes} parents={parents} />
  ];

  return (
    <form className="grid gap-5 p-5" onSubmit={handleSubmit}>
      <div className="grid gap-2 md:grid-cols-6">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            className={`rounded-lg border px-3 py-2 text-left text-xs font-black transition ${
              index === step ? 'border-ocean bg-ocean text-white' : index < step ? 'border-canopy/20 bg-canopy/10 text-canopy' : 'border-ocean/10 bg-white text-ink/55'
            }`}
            onClick={() => setStep(index as StudentRegistrationStep)}
          >
            <span className="block text-[0.65rem] uppercase tracking-[0.14em]">{`Étape ${index + 1}`}</span>
            {label}
          </button>
        ))}
      </div>

      {optionsError ? <p className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-ember">{optionsError}</p> : null}
      {success ? (
        <p className="flex items-center gap-2 rounded-lg bg-canopy/10 px-3 py-2 text-sm font-semibold text-canopy">
          <CheckCircle2 size={17} />
          {success}
        </p>
      ) : null}
      {submitError ? <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{submitError}</p> : null}

      <div className="min-h-[360px]">{stepContent[step]}</div>

      <div className="flex flex-col-reverse gap-3 border-t border-ocean/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="ghost" onClick={step === 0 ? onCancel : goBack} disabled={isSubmitting}>
          <ArrowLeft size={17} />
          {step === 0 ? 'Annuler' : 'Retour'}
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          {isLastStep ? (
            <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting}>
              Modifier
            </Button>
          ) : null}
          <Button type="submit" className="gap-2 bg-ocean hover:bg-ink" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : isLastStep ? (mode === 'create' ? 'Inscrire l’élève' : 'Enregistrer') : 'Continuer'}
            {!isLastStep ? <ArrowRight size={17} /> : null}
          </Button>
        </div>
      </div>
    </form>
  );
};

import type { StudentRegistrationFormData } from './studentRegistrationApi';

export type StudentRegistrationStep = 0 | 1 | 2 | 3 | 4 | 5;
export type StudentValidationErrors = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requireText = (errors: StudentValidationErrors, key: string, value: string, message: string) => {
  if (!value.trim()) {
    errors[key] = message;
  }
};

export const validateStudentRegistrationStep = (step: StudentRegistrationStep, form: StudentRegistrationFormData): StudentValidationErrors => {
  const errors: StudentValidationErrors = {};

  if (step === 0 && !form.category) {
    errors.category = 'Choisissez une catégorie.';
  }

  if (step === 1) {
    requireText(errors, 'general.firstName', form.general.firstName, 'Le prénom est obligatoire.');
    requireText(errors, 'general.lastName', form.general.lastName, 'Le nom est obligatoire.');
    if (form.general.birthDate && Number.isNaN(Date.parse(form.general.birthDate))) {
      errors['general.birthDate'] = 'La date de naissance est invalide.';
    }
    if (form.general.photoUrl && !/^https?:\/\/.+/i.test(form.general.photoUrl) && !/^\/files\/[0-9a-f-]+\/download$/i.test(form.general.photoUrl)) {
      errors['general.photoUrl'] = 'Utilisez une URL valide ou importez une image.';
    }
  }

  if (step === 2) {
    if ((form.category === 'creche' || form.category === 'maternelle' || form.category === 'primaire' || form.category === 'mixte') && form.guardians.length === 0) {
      errors.guardians = 'Ajoutez au moins un responsable.';
    }
    form.guardians.forEach((guardian, index) => {
      if (!guardian.guardianId) {
        requireText(errors, `guardians.${index}.parent.firstName`, guardian.parent.firstName, 'Le prénom du parent est obligatoire.');
        requireText(errors, `guardians.${index}.parent.lastName`, guardian.parent.lastName, 'Le nom du parent est obligatoire.');
        if (!guardian.parent.phone.trim() && !guardian.parent.email.trim()) {
          errors[`guardians.${index}.parent.contact`] = 'Ajoutez le téléphone ou l’email du parent.';
        }
        if (guardian.parent.email && !emailPattern.test(guardian.parent.email)) {
          errors[`guardians.${index}.parent.email`] = 'L’email du parent est invalide.';
        }
      }
    });
  }

  if (step === 3 && (form.category === 'creche' || form.category === 'maternelle')) {
    if (!form.medical.bloodType.trim() && !form.medical.allergies.trim() && !form.medical.emergencyNotes.trim()) {
      errors.medical = 'Renseignez au moins le groupe sanguin, les allergies ou une note d’urgence.';
    }
  }

  if (step === 4) {
    if (form.category === 'secondaire' || form.category === 'secondaire_general' || form.category === 'secondaire_technique' || form.category === 'formation') {
      requireText(errors, 'specific.secondaire.section', form.specific.secondaire.section, 'La section est obligatoire.');
      requireText(errors, 'specific.secondaire.optionName', form.specific.secondaire.optionName, 'L’option est obligatoire.');
    }

    if (form.category === 'haute_ecole' || form.category === 'universite') {
      requireText(errors, 'specific.universite.program', form.specific.universite.program, 'Le programme est obligatoire.');
      if (form.specific.universite.studentEmail && !emailPattern.test(form.specific.universite.studentEmail)) {
        errors['specific.universite.studentEmail'] = 'L’email étudiant est invalide.';
      }
      if (form.specific.universite.registrationType === 'transfer' && !form.specific.universite.nationalIdNumber.trim()) {
        errors['specific.universite.nationalIdNumber'] = 'Le numéro d’identification est requis pour un transfert.';
      }
    }
  }

  return errors;
};

export const validateCompleteStudentRegistration = (form: StudentRegistrationFormData): StudentValidationErrors => {
  return [0, 1, 2, 3, 4].reduce<StudentValidationErrors>(
    (allErrors, step) => ({ ...allErrors, ...validateStudentRegistrationStep(step as StudentRegistrationStep, form) }),
    {}
  );
};

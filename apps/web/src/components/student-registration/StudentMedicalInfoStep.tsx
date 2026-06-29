import type { Dispatch, SetStateAction } from 'react';
import { Input } from '../Input';
import type { StudentMedicalForm, StudentRegistrationFormData } from '../../services/studentRegistrationApi';
import type { StudentValidationErrors } from '../../services/studentValidation';

interface Props {
  form: StudentRegistrationFormData;
  setForm: Dispatch<SetStateAction<StudentRegistrationFormData>>;
  errors: StudentValidationErrors;
}

const textAreaClass = 'min-h-28 rounded-lg border border-ink/10 bg-white/88 px-4 py-3 text-base font-semibold outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/10';

export const StudentMedicalInfoStep = ({ form, setForm, errors }: Props) => {
  const updateMedical = (key: keyof StudentMedicalForm, value: string) => {
    setForm((current) => ({ ...current, medical: { ...current.medical, [key]: value } }));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Groupe sanguin" value={form.medical.bloodType} onChange={(event) => updateMedical('bloodType', event.target.value)} />
      <Input label="Nom du médecin" value={form.medical.doctorName} onChange={(event) => updateMedical('doctorName', event.target.value)} />
      <Input label="Téléphone du médecin" value={form.medical.doctorPhone} onChange={(event) => updateMedical('doctorPhone', event.target.value)} />
      <Input label="Médicaments" value={form.medical.medication} onChange={(event) => updateMedical('medication', event.target.value)} />
      <label className="grid gap-2 text-sm font-semibold text-ink">
        <span>Allergies</span>
        <textarea className={textAreaClass} value={form.medical.allergies} onChange={(event) => updateMedical('allergies', event.target.value)} />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-ink">
        <span>Maladies chroniques</span>
        <textarea className={textAreaClass} value={form.medical.chronicDiseases} onChange={(event) => updateMedical('chronicDiseases', event.target.value)} />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-ink md:col-span-2">
        <span>Notes d’urgence</span>
        <textarea className={textAreaClass} value={form.medical.emergencyNotes} onChange={(event) => updateMedical('emergencyNotes', event.target.value)} />
      </label>
      {errors.medical ? <p className="text-sm font-semibold text-clay md:col-span-2">{errors.medical}</p> : null}
    </div>
  );
};

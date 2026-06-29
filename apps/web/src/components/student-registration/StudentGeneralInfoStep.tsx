import type { ClassDto } from '@evoyamwana/shared';
import type { Dispatch, SetStateAction } from 'react';
import { FileUpload } from '../FileUpload';
import { Input } from '../Input';
import type { StudentRegistrationFormData, StudentStatus } from '../../services/studentRegistrationApi';
import type { StudentValidationErrors } from '../../services/studentValidation';

interface Props {
  form: StudentRegistrationFormData;
  setForm: Dispatch<SetStateAction<StudentRegistrationFormData>>;
  classes: ClassDto[];
  errors: StudentValidationErrors;
}

const inputClass = 'h-[54px] rounded-lg border border-ink/10 bg-white/88 px-4 text-base font-semibold outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/10';

const statuses: Array<{ value: StudentStatus; label: string }> = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'transferred', label: 'Transféré' },
  { value: 'graduated', label: 'Diplômé' }
];

export const StudentGeneralInfoStep = ({ form, setForm, classes, errors }: Props) => {
  const updateGeneral = (key: keyof StudentRegistrationFormData['general'], value: string) => {
    setForm((current) => ({ ...current, general: { ...current.general, [key]: value } }));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Prénom" value={form.general.firstName} onChange={(event) => updateGeneral('firstName', event.target.value)} />
      <Input label="Nom" value={form.general.lastName} onChange={(event) => updateGeneral('lastName', event.target.value)} />
      <label className="grid gap-2 text-sm font-semibold text-ink">
        <span className="text-[0.82rem]">Genre</span>
        <select className={inputClass} value={form.general.gender} onChange={(event) => updateGeneral('gender', event.target.value)}>
          <option value="">Sélectionner</option>
          <option value="Female">Féminin</option>
          <option value="Male">Masculin</option>
        </select>
      </label>
      <Input label="Date de naissance" type="date" value={form.general.birthDate} onChange={(event) => updateGeneral('birthDate', event.target.value)} />
      <Input label="Lieu de naissance" value={form.general.birthPlace} onChange={(event) => updateGeneral('birthPlace', event.target.value)} />
      <Input label="Nationalité" value={form.general.nationality} onChange={(event) => updateGeneral('nationality', event.target.value)} />
      <Input label="Matricule élève" value={form.general.studentCode} onChange={(event) => updateGeneral('studentCode', event.target.value)} placeholder="Auto si vide" />
      <label className="grid gap-2 text-sm font-semibold text-ink">
        <span className="text-[0.82rem]">Classe</span>
        <select className={inputClass} value={form.general.classId} onChange={(event) => updateGeneral('classId', event.target.value)}>
          <option value="">Sans classe pour le moment</option>
          {classes.map((classRecord) => (
            <option key={classRecord.id} value={classRecord.id}>
              {classRecord.name} {classRecord.section ? `· ${classRecord.section}` : ''} {classRecord.academicYear ? `· ${classRecord.academicYear}` : ''}
            </option>
          ))}
        </select>
      </label>
      <Input label="Photo URL" value={form.general.photoUrl} onChange={(event) => updateGeneral('photoUrl', event.target.value)} />
      <FileUpload
        accept="image/*"
        label="Upload photo"
        purpose="student-photo"
        value={form.general.photoUrl}
        onUploaded={(file) => updateGeneral('photoUrl', file.downloadUrl)}
      />
      <Input label="Année scolaire" value={form.general.academicYear} onChange={(event) => updateGeneral('academicYear', event.target.value)} />
      <label className="grid gap-2 text-sm font-semibold text-ink">
        <span className="text-[0.82rem]">Statut</span>
        <select className={inputClass} value={form.general.status} onChange={(event) => updateGeneral('status', event.target.value)}>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      {Object.entries(errors).map(([key, message]) =>
        key.startsWith('general.') ? (
          <p key={key} className="text-sm font-semibold text-clay md:col-span-2">
            {message}
          </p>
        ) : null
      )}
    </div>
  );
};

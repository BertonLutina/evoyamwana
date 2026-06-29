import type { Dispatch, SetStateAction } from 'react';
import { Input } from '../Input';
import type { StudentRegistrationFormData } from '../../services/studentRegistrationApi';
import type { StudentValidationErrors } from '../../services/studentValidation';

interface Props {
  form: StudentRegistrationFormData;
  setForm: Dispatch<SetStateAction<StudentRegistrationFormData>>;
  errors: StudentValidationErrors;
}

const textAreaClass = 'min-h-28 rounded-lg border border-ink/10 bg-white/88 px-4 py-3 text-base font-semibold outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/10';
const selectClass = 'h-[54px] rounded-lg border border-ink/10 bg-white/88 px-4 text-base font-semibold outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/10';

export const StudentSpecificInfoStep = ({ form, setForm, errors }: Props) => {
  const updateSpecific = <T extends keyof StudentRegistrationFormData['specific']>(
    category: T,
    key: keyof StudentRegistrationFormData['specific'][T],
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      specific: {
        ...current.specific,
        [category]: { ...current.specific[category], [key]: value }
      }
    }));
  };

  if (form.category === 'creche' || form.category === 'maternelle') {
    const data = form.specific.maternelle;
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex h-[54px] items-center gap-3 rounded-lg border border-ocean/10 bg-sky px-4 font-bold text-ink">
          <input type="checkbox" checked={data.toiletTrained} onChange={(event) => updateSpecific('maternelle', 'toiletTrained', event.target.checked)} />
          Enfant propre ?
        </label>
        <label className="flex h-[54px] items-center gap-3 rounded-lg border border-ocean/10 bg-sky px-4 font-bold text-ink">
          <input type="checkbox" checked={data.napNeeded} onChange={(event) => updateSpecific('maternelle', 'napNeeded', event.target.checked)} />
          Besoin de sieste ?
        </label>
        <Input label="Restrictions alimentaires" value={data.foodRestrictions} onChange={(event) => updateSpecific('maternelle', 'foodRestrictions', event.target.value)} />
        <Input label="Langue préférée" value={data.favoriteLanguage} onChange={(event) => updateSpecific('maternelle', 'favoriteLanguage', event.target.value)} />
        <label className="grid gap-2 text-sm font-semibold text-ink">
          <span>Personnes autorisées à récupérer l’enfant</span>
          <textarea className={textAreaClass} value={data.authorizedPickupPersons} onChange={(event) => updateSpecific('maternelle', 'authorizedPickupPersons', event.target.value)} placeholder="Une personne par ligne" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          <span>Notes d’adaptation</span>
          <textarea className={textAreaClass} value={data.adaptationNotes} onChange={(event) => updateSpecific('maternelle', 'adaptationNotes', event.target.value)} />
        </label>
        <label className="flex h-[54px] items-center gap-3 rounded-lg border border-ocean/10 bg-sky px-4 font-bold text-ink md:col-span-2">
          <input type="checkbox" checked={data.separationDifficulty} onChange={(event) => updateSpecific('maternelle', 'separationDifficulty', event.target.checked)} />
          Difficulté de séparation
        </label>
      </div>
    );
  }

  if (form.category === 'primaire' || form.category === 'mixte') {
    const data = form.specific.primaire;
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="École précédente" value={data.previousSchool} onChange={(event) => updateSpecific('primaire', 'previousSchool', event.target.value)} />
        <Input label="Niveau lecture" value={data.readingLevel} onChange={(event) => updateSpecific('primaire', 'readingLevel', event.target.value)} />
        <Input label="Niveau écriture" value={data.writingLevel} onChange={(event) => updateSpecific('primaire', 'writingLevel', event.target.value)} />
        <Input label="Niveau math" value={data.mathLevel} onChange={(event) => updateSpecific('primaire', 'mathLevel', event.target.value)} />
        <label className="grid gap-2 text-sm font-semibold text-ink">
          <span>Besoins particuliers</span>
          <textarea className={textAreaClass} value={data.specialNeeds} onChange={(event) => updateSpecific('primaire', 'specialNeeds', event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          <span>Activités extrascolaires</span>
          <textarea className={textAreaClass} value={data.extracurricularNotes} onChange={(event) => updateSpecific('primaire', 'extracurricularNotes', event.target.value)} />
        </label>
      </div>
    );
  }

  if (form.category === 'secondaire' || form.category === 'secondaire_general' || form.category === 'secondaire_technique' || form.category === 'formation') {
    const data = form.specific.secondaire;
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="École précédente" value={data.previousSchool} onChange={(event) => updateSpecific('secondaire', 'previousSchool', event.target.value)} />
        <Input label="Section" value={data.section} onChange={(event) => updateSpecific('secondaire', 'section', event.target.value)} />
        <Input label="Option" value={data.optionName} onChange={(event) => updateSpecific('secondaire', 'optionName', event.target.value)} />
        <Input label="Niveau académique" value={data.academicLevel} onChange={(event) => updateSpecific('secondaire', 'academicLevel', event.target.value)} />
        <label className="flex h-[54px] items-center gap-3 rounded-lg border border-ocean/10 bg-sky px-4 font-bold text-ink md:col-span-2">
          <input type="checkbox" checked={data.repeatedClass} onChange={(event) => updateSpecific('secondaire', 'repeatedClass', event.target.checked)} />
          Classe redoublée ?
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          <span>Notes d’orientation</span>
          <textarea className={textAreaClass} value={data.orientationNotes} onChange={(event) => updateSpecific('secondaire', 'orientationNotes', event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          <span>Notes disciplinaires</span>
          <textarea className={textAreaClass} value={data.disciplinaryNotes} onChange={(event) => updateSpecific('secondaire', 'disciplinaryNotes', event.target.value)} />
        </label>
        {Object.values(errors).map((message) => (
          <p key={message} className="text-sm font-semibold text-clay md:col-span-2">{message}</p>
        ))}
      </div>
    );
  }

  const data = form.specific.universite;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Institution précédente" value={data.previousInstitution} onChange={(event) => updateSpecific('universite', 'previousInstitution', event.target.value)} />
      <Input label="Diplôme obtenu" value={data.diplomaObtained} onChange={(event) => updateSpecific('universite', 'diplomaObtained', event.target.value)} />
      <Input label="Faculté" value={data.faculty} onChange={(event) => updateSpecific('universite', 'faculty', event.target.value)} />
      <Input label="Département" value={data.department} onChange={(event) => updateSpecific('universite', 'department', event.target.value)} />
      <Input label="Programme" value={data.program} onChange={(event) => updateSpecific('universite', 'program', event.target.value)} />
      <Input label="Année académique" value={data.academicYear} onChange={(event) => updateSpecific('universite', 'academicYear', event.target.value)} />
      <label className="grid gap-2 text-sm font-semibold text-ink">
        <span>Type d’inscription</span>
        <select className={selectClass} value={data.registrationType} onChange={(event) => updateSpecific('universite', 'registrationType', event.target.value)}>
          <option value="new">Nouvelle</option>
          <option value="transfer">Transfert</option>
          <option value="re_registration">Réinscription</option>
        </select>
      </label>
      <Input label="Bourse" value={data.scholarshipStatus} onChange={(event) => updateSpecific('universite', 'scholarshipStatus', event.target.value)} />
      <Input label="Email étudiant" type="email" value={data.studentEmail} onChange={(event) => updateSpecific('universite', 'studentEmail', event.target.value)} />
      <Input label="Numéro d’identification nationale" value={data.nationalIdNumber} onChange={(event) => updateSpecific('universite', 'nationalIdNumber', event.target.value)} />
      {Object.values(errors).map((message) => (
        <p key={message} className="text-sm font-semibold text-clay md:col-span-2">{message}</p>
      ))}
    </div>
  );
};

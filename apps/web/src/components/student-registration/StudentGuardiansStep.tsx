import type { ParentDto } from '@evoyamwana/shared';
import { Plus, Trash2 } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { Button } from '../Button';
import type { GuardianRelationshipType, StudentGuardianForm, StudentRegistrationFormData } from '../../services/studentRegistrationApi';
import type { StudentValidationErrors } from '../../services/studentValidation';

interface Props {
  form: StudentRegistrationFormData;
  setForm: Dispatch<SetStateAction<StudentRegistrationFormData>>;
  parents: ParentDto[];
  errors: StudentValidationErrors;
}

const selectClass = 'h-11 rounded-lg border border-ink/10 bg-white px-3 text-sm font-bold outline-none focus:border-ocean focus:ring-4 focus:ring-ocean/10';

const relationshipOptions: Array<{ value: GuardianRelationshipType; label: string }> = [
  { value: 'father', label: 'Père' },
  { value: 'mother', label: 'Mère' },
  { value: 'tutor', label: 'Tuteur' },
  { value: 'guardian', label: 'Responsable' },
  { value: 'other', label: 'Autre' }
];

const emptyGuardian = (): StudentGuardianForm => ({
  guardianId: '',
  parent: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  },
  createNew: true,
  relationshipType: 'guardian',
  isPrimaryContact: false,
  emergencyContact: false,
  canPickUpChild: false
});

export const StudentGuardiansStep = ({ form, setForm, parents, errors }: Props) => {
  const normalize = (value?: string | null) => (value ?? '').trim().toLowerCase();
  const normalizePhone = (value?: string | null) => (value ?? '').replace(/[^\d+]/g, '');

  const updateGuardian = (index: number, patch: Partial<StudentGuardianForm>) => {
    setForm((current) => ({
      ...current,
      guardians: current.guardians.map((guardian, guardianIndex) => (guardianIndex === index ? { ...guardian, ...patch } : guardian))
    }));
  };

  const addGuardian = () => {
    setForm((current) => ({ ...current, guardians: [...current.guardians, { ...emptyGuardian(), isPrimaryContact: current.guardians.length === 0 }] }));
  };

  const removeGuardian = (index: number) => {
    setForm((current) => ({ ...current, guardians: current.guardians.filter((_, guardianIndex) => guardianIndex !== index) }));
  };

  const updateParent = (index: number, patch: Partial<StudentGuardianForm['parent']>) => {
    setForm((current) => ({
      ...current,
      guardians: current.guardians.map((guardian, guardianIndex) =>
        guardianIndex === index
          ? { ...guardian, guardianId: '', createNew: true, parent: { ...guardian.parent, ...patch } }
          : guardian
      )
    }));
  };

  const getMatches = (guardian: StudentGuardianForm) => {
    const email = normalize(guardian.parent.email);
    const phone = normalizePhone(guardian.parent.phone);
    const firstName = normalize(guardian.parent.firstName);
    const lastName = normalize(guardian.parent.lastName);

    return parents.filter((parent) => {
      const parentEmail = normalize(parent.user?.email);
      const parentPhone = normalizePhone(parent.phone);
      const sameEmail = email && parentEmail === email;
      const samePhone = phone && parentPhone === phone;
      const sameName = firstName && lastName && normalize(parent.firstName) === firstName && normalize(parent.lastName) === lastName;
      return sameEmail || samePhone || sameName;
    });
  };

  const selectParent = (index: number, parentId: string) => {
    const parent = parents.find((item) => item.id === parentId);
    updateGuardian(index, {
      guardianId: parentId,
      createNew: false,
      parent: {
        firstName: parent?.firstName ?? '',
        lastName: parent?.lastName ?? '',
        email: parent?.user?.email ?? '',
        phone: parent?.phone ?? '',
        address: parent?.address ?? ''
      }
    });
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-black text-ink">Responsables / parents</h3>
          <p className="text-sm text-ink/55">Ajoutez un ou plusieurs responsables avec leur rôle dans l’inscription.</p>
        </div>
        <Button type="button" className="gap-2" onClick={addGuardian}>
          <Plus size={17} />
          Ajouter
        </Button>
      </div>

      {form.guardians.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ocean/25 bg-sky/70 p-5 text-sm font-semibold text-ocean">Aucun responsable sélectionné.</div>
      ) : null}

      {form.guardians.map((guardian, index) => {
        const matches = getMatches(guardian);
        const selectedParent = parents.find((parent) => parent.id === guardian.guardianId);
        return (
        <div key={index} className="grid gap-4 rounded-lg border border-ocean/10 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              <span>Prénom parent</span>
              <input className={selectClass} value={guardian.parent.firstName} onChange={(event) => updateParent(index, { firstName: event.target.value })} placeholder="Luc" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              <span>Nom parent</span>
              <input className={selectClass} value={guardian.parent.lastName} onChange={(event) => updateParent(index, { lastName: event.target.value })} placeholder="Chibola" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              <span>Relation</span>
              <select className={selectClass} value={guardian.relationshipType} onChange={(event) => updateGuardian(index, { relationshipType: event.target.value as GuardianRelationshipType })}>
                {relationshipOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              <span>Téléphone</span>
              <input className={selectClass} value={guardian.parent.phone} onChange={(event) => updateParent(index, { phone: event.target.value })} placeholder="+243..." />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              <span>Email</span>
              <input className={selectClass} type="email" value={guardian.parent.email} onChange={(event) => updateParent(index, { email: event.target.value })} placeholder="parent@email.com" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              <span>Adresse</span>
              <input className={selectClass} value={guardian.parent.address} onChange={(event) => updateParent(index, { address: event.target.value })} placeholder="Adresse familiale" />
            </label>
          </div>

          {selectedParent ? (
            <div className="rounded-lg border border-canopy/20 bg-canopy/10 p-3 text-sm font-semibold text-canopy">
              Parent sélectionné: {selectedParent.firstName} {selectedParent.lastName} {selectedParent.phone ? `- ${selectedParent.phone}` : ''}
            </div>
          ) : matches.length ? (
            <div className="grid gap-2 rounded-lg border border-ocean/10 bg-sky/70 p-3">
              <p className="text-sm font-black text-ink">Parents similaires trouvés</p>
              {matches.map((parent) => (
                <div key={parent.id} className="grid gap-2 rounded-lg border border-white bg-white p-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-black text-ink">{parent.firstName} {parent.lastName}</p>
                    <p className="text-xs font-semibold text-ink/55">{parent.phone || 'Téléphone non renseigné'} · {parent.user?.email || 'Email non renseigné'}</p>
                    <p className="mt-1 text-xs text-ink/55">
                      Enfants liés: {parent.children?.length ? parent.children.map((child) => `${child.student.firstName} ${child.student.lastName}`).join(', ') : 'Aucun enfant lié'}
                    </p>
                  </div>
                  <Button type="button" variant="secondary" onClick={() => selectParent(index, parent.id)}>
                    Utiliser ce parent
                  </Button>
                </div>
              ))}
              <p className="text-xs font-semibold text-ember">Si aucun résultat ne correspond vraiment, laissez non sélectionné: un nouveau parent sera créé.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-ocean/20 bg-sky/50 p-3 text-sm font-semibold text-ocean">
              Aucun parent similaire trouvé. Ce responsable sera créé comme nouveau parent si vous continuez.
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="grid gap-2 text-sm font-semibold text-ink sm:grid-cols-3">
              {[
                ['isPrimaryContact', 'Contact principal'],
                ['emergencyContact', 'Contact d’urgence'],
                ['canPickUpChild', 'Autorisé à récupérer']
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(guardian[key as keyof StudentGuardianForm])}
                    onChange={(event) => updateGuardian(index, { [key]: event.target.checked })}
                  />
                  {label}
                </label>
              ))}
            </div>
            <button type="button" className="grid h-11 w-11 place-items-center self-end rounded-lg text-clay hover:bg-clay/10" onClick={() => removeGuardian(index)} aria-label="Retirer ce responsable">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      );})}

      {Object.values(errors).map((message) => (
        <p key={message} className="text-sm font-semibold text-clay">
          {message}
        </p>
      ))}
    </div>
  );
};

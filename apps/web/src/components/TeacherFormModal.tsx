import type { TeacherDto, TeacherProfileInput } from '@evoyamwana/shared';
import { X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from './Button';
import { FileUpload } from './FileUpload';
import { TeacherAvatar } from './TeacherAvatar';
import type { TeacherFormPayload } from '../services/teachers.service';
import { teacherToFormPayload } from '../utils/teacherProfile';

interface TeacherFormModalProps {
  mode?: 'create' | 'edit';
  teacher?: TeacherDto | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: TeacherFormPayload) => Promise<void>;
}

const emptyForm: TeacherFormPayload = {
  firstName: '',
  lastName: '',
  email: '',
  employeeNumber: '',
  phone: '',
  password: '',
  birthDate: '',
  birthPlace: '',
  gender: '',
  nationality: '',
  address: '',
  photoUrl: '',
  hireDate: '',
  qualification: '',
  specialization: '',
  nationalId: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  bio: '',
  employmentStatus: 'ACTIVE'
};

const fieldClass = 'mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean';
const textareaClass = 'mt-2 min-h-[88px] w-full rounded-md border border-ocean/10 px-3 py-2 outline-none focus:border-ocean';

export const TeacherFormModal = ({ mode = 'create', teacher, isSubmitting, onClose, onSubmit }: TeacherFormModalProps) => {
  const [form, setForm] = useState<TeacherFormPayload>(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && teacher) {
      setForm({ ...emptyForm, ...teacherToFormPayload(teacher), password: '' });
    } else {
      setForm(emptyForm);
    }
  }, [mode, teacher]);

  const updateField = (field: keyof TeacherFormPayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const payload: TeacherFormPayload = {
        ...form,
        password: form.password || undefined
      };
      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible d’enregistrer le profil');
    }
  };

  const isEdit = mode === 'edit';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-6">
      <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-[0_24px_80px_rgba(7,27,58,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Profil enseignant</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">{isEdit ? 'Modifier l’enseignant' : 'Ajouter un enseignant'}</h2>
          </div>
          <Button type="button" variant="ghost" className="h-10 w-10 p-0" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </Button>
        </div>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <div className="mt-5 flex flex-col gap-4 rounded-lg border border-ocean/10 bg-sky/40 p-4 sm:flex-row sm:items-center">
          <TeacherAvatar
            teacher={isEdit && teacher ? teacher : { firstName: form.firstName, lastName: form.lastName, photoUrl: form.photoUrl }}
            size="xl"
            photoUrl={form.photoUrl}
          />
          <label className="min-w-0 flex-1 text-sm font-semibold">
            Photo de profil (URL)
            <input className={fieldClass} value={form.photoUrl ?? ''} onChange={(e) => updateField('photoUrl', e.target.value)} placeholder="https://…" />
            <span className="mt-2 block text-xs font-normal text-ink/55">Avatar généré par défaut si aucune URL n’est fournie.</span>
          </label>
          <div className="min-w-0 flex-1">
            <FileUpload
              accept="image/*"
              label="Upload photo"
              purpose="teacher-photo"
              value={form.photoUrl ?? ''}
              onUploaded={(file) => updateField('photoUrl', file.downloadUrl)}
            />
          </div>
        </div>

        <section className="mt-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean">Identité</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Prénom
              <input className={fieldClass} value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} required />
            </label>
            <label className="text-sm font-semibold">
              Nom
              <input className={fieldClass} value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} required />
            </label>
            <label className="text-sm font-semibold">
              E-mail
              <input type="email" className={fieldClass} value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
            </label>
            <label className="text-sm font-semibold">
              Matricule
              <input className={fieldClass} value={form.employeeNumber} onChange={(e) => updateField('employeeNumber', e.target.value)} required />
            </label>
            <label className="text-sm font-semibold">
              Téléphone
              <input className={fieldClass} value={form.phone ?? ''} onChange={(e) => updateField('phone', e.target.value)} />
            </label>
            <label className="text-sm font-semibold">
              {isEdit ? 'Nouveau mot de passe' : 'Mot de passe'}
              <input type="password" className={fieldClass} placeholder={isEdit ? 'Laisser vide pour conserver' : 'Défaut : DemoPass123!'} value={form.password ?? ''} onChange={(e) => updateField('password', e.target.value)} />
            </label>
            <label className="text-sm font-semibold">
              Date de naissance
              <input type="date" className={fieldClass} value={form.birthDate ?? ''} onChange={(e) => updateField('birthDate', e.target.value)} />
            </label>
            <label className="text-sm font-semibold">
              Lieu de naissance
              <input className={fieldClass} value={form.birthPlace ?? ''} onChange={(e) => updateField('birthPlace', e.target.value)} />
            </label>
            <label className="text-sm font-semibold">
              Genre
              <select className={fieldClass} value={form.gender ?? ''} onChange={(e) => updateField('gender', e.target.value)}>
                <option value="">Non renseigné</option>
                <option value="F">Féminin</option>
                <option value="M">Masculin</option>
                <option value="Autre">Autre</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Nationalité
              <input className={fieldClass} value={form.nationality ?? ''} onChange={(e) => updateField('nationality', e.target.value)} />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Adresse
              <input className={fieldClass} value={form.address ?? ''} onChange={(e) => updateField('address', e.target.value)} />
            </label>
            <label className="text-sm font-semibold">
              N° pièce d’identité
              <input className={fieldClass} value={form.nationalId ?? ''} onChange={(e) => updateField('nationalId', e.target.value)} />
            </label>
          </div>
        </section>

        <section className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean">Parcours professionnel</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Date d’embauche
              <input type="date" className={fieldClass} value={form.hireDate ?? ''} onChange={(e) => updateField('hireDate', e.target.value)} />
            </label>
            <label className="text-sm font-semibold">
              Statut
              <select
                className={fieldClass}
                value={form.employmentStatus ?? 'ACTIVE'}
                onChange={(e) => updateField('employmentStatus', e.target.value as NonNullable<TeacherFormPayload['employmentStatus']>)}
              >
                <option value="ACTIVE">Actif</option>
                <option value="ON_LEAVE">En congé</option>
                <option value="INACTIVE">Inactif</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Diplôme / qualification
              <input className={fieldClass} value={form.qualification ?? ''} onChange={(e) => updateField('qualification', e.target.value)} />
            </label>
            <label className="text-sm font-semibold">
              Spécialisation
              <input className={fieldClass} value={form.specialization ?? ''} onChange={(e) => updateField('specialization', e.target.value)} />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Notes professionnelles
              <textarea className={textareaClass} value={form.bio ?? ''} onChange={(e) => updateField('bio', e.target.value)} />
            </label>
          </div>
        </section>

        <section className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean">Contact d’urgence</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Nom du contact
              <input className={fieldClass} value={form.emergencyContactName ?? ''} onChange={(e) => updateField('emergencyContactName', e.target.value)} />
            </label>
            <label className="text-sm font-semibold">
              Téléphone d’urgence
              <input className={fieldClass} value={form.emergencyContactPhone ?? ''} onChange={(e) => updateField('emergencyContactPhone', e.target.value)} />
            </label>
          </div>
        </section>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-ocean hover:bg-ink" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

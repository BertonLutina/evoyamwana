import type { TeacherDto, TeacherProfileInput } from '@evoyamwana/shared';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  GraduationCap,
  HeartPulse,
  IdCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  UserRoundCheck,
  X
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { StatCard } from '../../components/StatCard';
import { TeacherAvatar } from '../../components/TeacherAvatar';
import { teachersService } from '../../services/teachers.service';
import {
  cleanTeacherPayload,
  employmentStatusLabels,
  formatTeacherDate,
  getTeacherDisplayName,
  toDateInputValue,
  uniqueSubjects
} from '../../utils/teacherProfile';

const fieldClass = 'mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean';
const textareaClass = 'mt-2 min-h-[88px] w-full rounded-md border border-ocean/10 px-3 py-2 outline-none focus:border-ocean';

export const TeacherProfileSelfPage = () => {
  const [teacher, setTeacher] = useState<TeacherDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<TeacherProfileInput>({});

  const loadTeacher = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await teachersService.getMe();
      setTeacher(data);
      setForm(selfFormFromTeacher(data));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger votre profil.');
      setTeacher(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTeacher();
  }, []);

  const subjects = useMemo(() => uniqueSubjects(teacher), [teacher]);
  const classes = teacher?.classes ?? [];

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const updated = await teachersService.updateMe(cleanTeacherPayload(form));
      setTeacher(updated);
      setForm(selfFormFromTeacher(updated));
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer les modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 sm:items-center">
              {isLoading ? (
                <div className="h-24 w-24 shrink-0 animate-pulse rounded-xl bg-sky" />
              ) : (
                <TeacherAvatar teacher={teacher} size="xl" />
              )}
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">Profil enseignant</p>
                <h2 className="mt-2 font-display text-4xl font-bold text-ink">Mon profil</h2>
                {teacher ? (
                  <p className="mt-1 text-sm font-semibold text-ink/55">{getTeacherDisplayName(teacher)} · {teacher.employeeNumber}</p>
                ) : null}
                <p className="mt-2 max-w-2xl text-sm leading-7 text-ink/60">
                  Vos informations professionnelles, coordonnées, parcours et affectations pédagogiques.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              {teacher && !isEditing ? (
                <Button className="gap-2 bg-ocean hover:bg-ink" onClick={() => setIsEditing(true)}>
                  <Pencil size={16} />
                  Modifier mon profil
                </Button>
              ) : null}
              {isEditing ? (
                <Button variant="ghost" className="gap-2" onClick={() => { setIsEditing(false); if (teacher) setForm(selfFormFromTeacher(teacher)); }}>
                  <X size={16} />
                  Annuler
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5 grid gap-4 md:grid-cols-4">
          <StatCard label="Classes" value={isLoading ? '...' : String(classes.length)} icon={GraduationCap} tone="blue" detail="Groupes assignés" />
          <StatCard label="Matières" value={isLoading ? '...' : String(subjects.length)} icon={BookOpen} tone="orange" detail="Cours liés" />
          <StatCard label="Statut" value={teacher?.employmentStatus ? employmentStatusLabels[teacher.employmentStatus] : '—'} icon={Briefcase} tone="green" detail="Situation professionnelle" />
          <StatCard label="Accès" value="Enseignant" icon={UserRoundCheck} tone="gold" detail="Profil sécurisé" />
        </section>

        {isEditing && teacher ? (
          <form onSubmit={handleSave} className="mt-6 rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-ocean">Modifier mes informations</p>
            <div className="mt-4 flex flex-col gap-4 rounded-lg border border-ocean/10 bg-sky/40 p-4 sm:flex-row sm:items-center">
              <TeacherAvatar teacher={teacher} photoUrl={form.photoUrl} size="xl" />
              <div className="min-w-0 flex-1">
                <label className="text-sm font-semibold">
                  Photo de profil (URL)
                  <input
                    className={fieldClass}
                    value={form.photoUrl ?? ''}
                    onChange={(e) => setForm((c) => ({ ...c, photoUrl: e.target.value }))}
                    placeholder="https://…"
                  />
                </label>
                <p className="mt-2 text-xs text-ink/55">Laissez vide pour utiliser l’avatar généré à partir de vos initiales.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Téléphone" value={form.phone ?? ''} onChange={(v) => setForm((c) => ({ ...c, phone: v }))} />
              <Field label="Date de naissance" type="date" value={form.birthDate ?? ''} onChange={(v) => setForm((c) => ({ ...c, birthDate: v }))} />
              <Field label="Lieu de naissance" value={form.birthPlace ?? ''} onChange={(v) => setForm((c) => ({ ...c, birthPlace: v }))} />
              <Field label="Nationalité" value={form.nationality ?? ''} onChange={(v) => setForm((c) => ({ ...c, nationality: v }))} />
              <label className="text-sm font-semibold">
                Genre
                <select className={fieldClass} value={form.gender ?? ''} onChange={(e) => setForm((c) => ({ ...c, gender: e.target.value }))}>
                  <option value="">Non renseigné</option>
                  <option value="F">Féminin</option>
                  <option value="M">Masculin</option>
                  <option value="Autre">Autre</option>
                </select>
              </label>
              <Field label="Adresse" className="sm:col-span-2" value={form.address ?? ''} onChange={(v) => setForm((c) => ({ ...c, address: v }))} />
              <Field label="Contact d’urgence" value={form.emergencyContactName ?? ''} onChange={(v) => setForm((c) => ({ ...c, emergencyContactName: v }))} />
              <Field label="Téléphone d’urgence" value={form.emergencyContactPhone ?? ''} onChange={(v) => setForm((c) => ({ ...c, emergencyContactPhone: v }))} />
              <label className="text-sm font-semibold sm:col-span-2">
                Notes personnelles / professionnelles
                <textarea className={textareaClass} value={form.bio ?? ''} onChange={(e) => setForm((c) => ({ ...c, bio: e.target.value }))} />
              </label>
            </div>
            <div className="mt-5 flex justify-end">
              <Button type="submit" className="gap-2 bg-ocean hover:bg-ink" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        ) : null}

        <section className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
            {isLoading ? (
              <LoadingRows rows={8} />
            ) : teacher ? (
              <>
                <div className="flex items-start gap-4">
                  <TeacherAvatar teacher={teacher} size="lg" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-ember">Identité</p>
                    <h3 className="mt-1 font-display text-3xl font-bold text-ink">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-ink/55">{teacher.employeeNumber}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 text-sm">
                  <InfoRow icon={IdCard} label="Matricule" value={teacher.employeeNumber} />
                  <InfoRow icon={Mail} label="E-mail" value={teacher.user?.email ?? 'Non renseigné'} />
                  <InfoRow icon={Phone} label="Téléphone" value={teacher.phone ?? 'Non renseigné'} />
                  <InfoRow icon={CalendarDays} label="Naissance" value={formatTeacherDate(teacher.birthDate)} />
                  <InfoRow icon={MapPin} label="Lieu de naissance" value={teacher.birthPlace ?? 'Non renseigné'} />
                  <InfoRow icon={MapPin} label="Adresse" value={teacher.address ?? 'Non renseigné'} />
                  <InfoRow icon={IdCard} label="Pièce d’identité" value={teacher.nationalId ?? 'Non renseigné'} />
                </div>
              </>
            ) : (
              <EmptyState icon={UserRoundCheck} title="Profil introuvable" description="Votre compte enseignant n’est pas encore lié à un profil." />
            )}
          </article>

          <div className="grid gap-5">
            <article className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-ocean">Parcours professionnel</p>
              <div className="mt-4 grid gap-3 text-sm">
                <InfoRow icon={Briefcase} label="Statut" value={teacher?.employmentStatus ? employmentStatusLabels[teacher.employmentStatus] : 'Non renseigné'} />
                <InfoRow icon={CalendarDays} label="Date d’embauche" value={formatTeacherDate(teacher?.hireDate)} />
                <InfoRow icon={GraduationCap} label="Diplôme" value={teacher?.qualification ?? 'Non renseigné'} />
                <InfoRow icon={BookOpen} label="Spécialisation" value={teacher?.specialization ?? 'Non renseigné'} />
              </div>
              {teacher?.bio ? <p className="mt-4 rounded-md bg-sky px-4 py-3 text-sm leading-6 text-ink/70">{teacher.bio}</p> : null}
            </article>

            <article className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-ember">Contact d’urgence</p>
              <div className="mt-4 grid gap-3 text-sm">
                <InfoRow icon={HeartPulse} label="Nom" value={teacher?.emergencyContactName ?? 'Non renseigné'} />
                <InfoRow icon={Phone} label="Téléphone" value={teacher?.emergencyContactPhone ?? 'Non renseigné'} />
              </div>
            </article>

            <article className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-ocean">Classes assignées</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {classes.length ? (
                  classes.map((classRecord) => (
                    <span key={classRecord.id} className="rounded-full bg-sky px-3 py-1.5 text-xs font-bold text-ocean">
                      {classRecord.name} · {classRecord.academicYear}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-ink/55">Aucune classe assignée.</span>
                )}
              </div>
            </article>

            <article className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-ember">Matières</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {subjects.length ? (
                  subjects.map((subject) => (
                    <span key={subject.id} className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-ember">
                      {subject.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-ink/55">Aucune matière assignée.</span>
                )}
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};

const selfFormFromTeacher = (teacher: TeacherDto): TeacherProfileInput => ({
  phone: teacher.phone ?? '',
  birthDate: toDateInputValue(teacher.birthDate) || null,
  birthPlace: teacher.birthPlace ?? '',
  gender: teacher.gender ?? '',
  nationality: teacher.nationality ?? '',
  address: teacher.address ?? '',
  photoUrl: teacher.photoUrl ?? '',
  emergencyContactName: teacher.emergencyContactName ?? '',
  emergencyContactPhone: teacher.emergencyContactPhone ?? '',
  bio: teacher.bio ?? ''
});

const Field = ({
  label,
  value,
  onChange,
  type = 'text',
  className = ''
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) => (
  <label className={`text-sm font-semibold ${className}`}>
    {label}
    <input type={type} className={fieldClass} value={value} onChange={(e) => onChange(e.target.value)} />
  </label>
);

const InfoRow = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 rounded-md border border-ocean/10 bg-sky px-4 py-3">
    <span className="flex items-center gap-2 font-bold text-ink">
      <Icon size={17} className="text-ocean" />
      {label}
    </span>
    <span className="text-right text-ink/65">{value}</span>
  </div>
);

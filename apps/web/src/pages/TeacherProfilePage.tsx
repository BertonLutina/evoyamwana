import { ArrowLeft, BookOpen, Briefcase, CalendarDays, GraduationCap, HeartPulse, IdCard, Mail, MapPin, Pencil, Phone, Trash2, UserRoundCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { TeacherDto } from '@evoyamwana/shared';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { LoadingRows } from '../components/LoadingRows';
import { ProfileChat } from '../components/ProfileChat';
import { TeacherAvatar } from '../components/TeacherAvatar';
import { TeacherFormModal } from '../components/TeacherFormModal';
import { teachersService, type TeacherFormPayload } from '../services/teachers.service';
import { cleanTeacherPayload, employmentStatusLabels, formatTeacherDate, uniqueSubjects } from '../utils/teacherProfile';

export const TeacherProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTeacher = async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      setTeacher(await teachersService.get(id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le profil');
      setTeacher(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTeacher();
  }, [id]);

  const subjects = useMemo(() => uniqueSubjects(teacher), [teacher]);

  const handleUpdate = async (payload: TeacherFormPayload) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const updated = await teachersService.update(id, cleanTeacherPayload(payload));
      setTeacher(updated);
      setIsEditOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!id || !teacher) return;
    if (!window.confirm(`Désactiver le profil de ${teacher.firstName} ${teacher.lastName} ?`)) return;
    setIsSubmitting(true);
    try {
      await teachersService.remove(id);
      navigate('/teachers');
    } catch (deactivateError) {
      setError(deactivateError instanceof Error ? deactivateError.message : 'Impossible de désactiver cet enseignant');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <LoadingRows rows={8} />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <EmptyState icon={UserRoundCheck} title="Enseignant introuvable" description={error || 'Ce profil n’est pas disponible.'} />
      </div>
    );
  }

  const fullName = `${teacher.firstName} ${teacher.lastName}`;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/teachers" className="inline-flex items-center gap-2 text-sm font-bold text-ocean">
            <ArrowLeft size={16} />
            Retour aux enseignants
          </Link>
          <div className="flex gap-2">
            <Button className="gap-2 bg-ocean hover:bg-ink" onClick={() => setIsEditOpen(true)}>
              <Pencil size={16} />
              Modifier
            </Button>
            <Button variant="ghost" className="gap-2 text-clay hover:bg-clay/10" onClick={handleDeactivate} disabled={isSubmitting}>
              <Trash2 size={16} />
              Désactiver
            </Button>
          </div>
        </div>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-5">
            <article className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
              <div className="flex items-start gap-4">
                <TeacherAvatar teacher={teacher} size="xl" />
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-ember">Profil enseignant</p>
                  <h2 className="mt-1 font-display text-4xl font-bold text-ink">{fullName}</h2>
                  <p className="mt-2 text-sm font-semibold text-ink/55">{teacher.employeeNumber}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 text-sm">
                <InfoRow icon={Mail} label="E-mail" value={teacher.user?.email ?? 'Non renseigné'} />
                <InfoRow icon={Phone} label="Téléphone" value={teacher.phone ?? 'Non renseigné'} />
                <InfoRow icon={CalendarDays} label="Naissance" value={formatTeacherDate(teacher.birthDate)} />
                <InfoRow icon={MapPin} label="Adresse" value={teacher.address ?? 'Non renseigné'} />
                <InfoRow icon={IdCard} label="Pièce d’identité" value={teacher.nationalId ?? 'Non renseigné'} />
                <InfoRow icon={Briefcase} label="Statut" value={teacher.employmentStatus ? employmentStatusLabels[teacher.employmentStatus] : 'Non renseigné'} />
                <InfoRow icon={GraduationCap} label="Diplôme" value={teacher.qualification ?? 'Non renseigné'} />
                <InfoRow icon={BookOpen} label="Spécialisation" value={teacher.specialization ?? 'Non renseigné'} />
                <InfoRow icon={HeartPulse} label="Urgence" value={teacher.emergencyContactPhone ?? 'Non renseigné'} />
              </div>
            </article>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
                <div className="flex items-center gap-2">
                  <GraduationCap size={20} className="text-ocean" />
                  <h3 className="font-bold">Classes</h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {teacher.classes?.length ? (
                    teacher.classes.map((item) => (
                      <span key={item.id} className="rounded-full bg-sky px-3 py-1.5 text-xs font-bold text-ocean">
                        {item.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-ink/55">Aucune classe assignée</span>
                  )}
                </div>
              </article>
              <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-ember" />
                  <h3 className="font-bold">Matières</h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {subjects.length ? (
                    subjects.map((item) => (
                      <span key={item.id} className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-ember">
                        {item.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-ink/55">Aucune matière assignée</span>
                  )}
                </div>
              </article>
            </section>
          </div>

          {teacher.userId ? (
            <ProfileChat recipientId={teacher.userId} recipientName={fullName} />
          ) : (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <Button disabled>Messagerie indisponible</Button>
            </article>
          )}
        </section>
      </div>

      {isEditOpen ? (
        <TeacherFormModal
          mode="edit"
          teacher={teacher}
          isSubmitting={isSubmitting}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleUpdate}
        />
      ) : null}
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 rounded-md border border-ocean/10 bg-sky px-4 py-3">
    <span className="flex items-center gap-2 font-bold text-ink">
      <Icon size={17} className="text-ocean" />
      {label}
    </span>
    <span className="text-right text-ink/65">{value}</span>
  </div>
);

import type { ClassDto, StudentDto } from '@evoyamwana/shared';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, CalendarDays, GraduationCap, IdCard, Mail, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { StatCard } from '../../components/StatCard';
import { useLocale } from '../../contexts/LocaleContext';
import { useAuth } from '../../hooks/useAuth';
import { classesService } from '../../services/classes.service';
import { messagesService, type MessageContactDto } from '../../services/messages.service';
import { studentsService } from '../../services/students.service';

const localeFormats = {
  fr: 'fr-FR',
  sw: 'sw-CD',
  ln: 'fr-CD',
  lua: 'fr-CD',
  kg: 'fr-CD',
  tll: 'fr-CD'
} as const;

const formatDate = (value: string | null | undefined, locale: keyof typeof localeFormats, fallback: string) => {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(localeFormats[locale], { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
};

export const StudentProfilePage = () => {
  const { user } = useAuth();
  const { locale, t } = useLocale();
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [contacts, setContacts] = useState<MessageContactDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    Promise.all([
      studentsService.getMe(),
      classesService.list({ academicYear: '2026', page: 1, pageSize: 20 }),
      messagesService.listContacts()
    ])
      .then(([loadedStudent, classData, loadedContacts]) => {
        if (!isMounted) return;
        setStudent(loadedStudent);
        setClasses(classData.classes);
        setContacts(loadedContacts);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : t('student.loadProfileError'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const mainClass = classes[0];
  const subjects = useMemo(() => classes.flatMap((classRecord) => classRecord.subjects ?? []), [classes]);
  const teacherName = mainClass?.teacher ? `${mainClass.teacher.firstName} ${mainClass.teacher.lastName}` : t('student.unassigned');
  const parents = student?.parents ?? [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_360px] xl:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">{t('student.space')}</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">{t('student.myProfile')}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">
                {t('student.myProfileDescription')}
              </p>
            </div>
            <article className="rounded-lg border border-ocean/10 bg-sky p-5">
              <UserRound className="text-ocean" size={28} />
              <p className="mt-4 text-sm font-bold text-ink">{student ? `${student.firstName} ${student.lastName}` : user?.fullName ?? 'Profil élève'}</p>
              <p className="mt-1 text-sm text-ink/55">{student?.studentCode ?? t('student.studentCode')}</p>
            </article>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5 grid gap-4 md:grid-cols-4">
          <StatCard label={t('student.class')} value={isLoading ? '...' : mainClass?.name ?? t('student.notSet')} icon={GraduationCap} tone="blue" detail={mainClass?.level ?? t('student.schoolAssignment')} />
          <StatCard label={t('grades.courses')} value={isLoading ? '...' : String(subjects.length)} icon={BookOpen} tone="orange" detail={t('student.programSubjects')} />
          <StatCard label={t('student.guardian')} value={isLoading ? '...' : String(parents.length)} icon={UsersRound} tone="green" detail={t('student.parents')} />
          <StatCard label={t('student.access')} value={t('student.studentRole')} icon={ShieldCheck} tone="gold" detail={t('student.secureProfile')} />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
            <div className="flex items-start gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-lg bg-ocean text-xl font-black text-white">
                {student ? `${student.firstName[0]}${student.lastName[0]}` : 'EV'}
              </span>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-ember">{t('student.identity')}</p>
                <h3 className="mt-1 font-display text-3xl font-bold text-ink">{student ? `${student.firstName} ${student.lastName}` : '...'}</h3>
                <p className="mt-2 text-sm font-semibold text-ink/55">{user?.email}</p>
              </div>
            </div>

            {isLoading ? (
              <div className="mt-6">
                <LoadingRows rows={5} />
              </div>
            ) : student ? (
              <div className="mt-6 grid gap-3 text-sm">
                <InfoRow icon={IdCard} label={t('student.studentCode')} value={student.studentCode} />
                <InfoRow icon={UserRound} label={t('student.gender')} value={student.gender ?? t('student.notSet')} />
                <InfoRow icon={CalendarDays} label={t('student.birthDate')} value={formatDate(student.birthDate, locale, t('student.notSet'))} />
                <InfoRow icon={Mail} label={t('student.accountEmail')} value={user?.email ?? t('student.notSet')} />
              </div>
            ) : (
              <EmptyState icon={UserRound} title={t('student.profileNotFound')} description={t('student.profileNotFoundDetail')} />
            )}
          </article>

          <div className="grid gap-5">
            <article className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-ocean">{t('student.schooling')}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoBlock label={t('student.class')} value={mainClass?.name ?? student?.class?.name ?? t('student.unassigned')} detail={mainClass ? `${mainClass.level} · ${mainClass.academicYear}` : t('student.activeYearMissing')} />
                <InfoBlock label={t('student.mainTeacher')} value={teacherName} detail={mainClass?.teacher?.user?.email ?? t('student.contactViaMessages')} />
                <InfoBlock label={t('student.room')} value={mainClass?.room ?? t('student.notSet')} detail={t('student.mainClassroom')} />
                <InfoBlock label={t('student.cycle')} value={mainClass?.cycle ?? t('student.notSet')} detail={mainClass?.option ?? t('student.optionNotSet')} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {subjects.length ? (
                  subjects.map((subject) => (
                    <span key={subject.id} className="rounded-full bg-sky px-3 py-1.5 text-xs font-bold text-ocean">
                      {subject.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-ink/55">{t('student.noSubjectAssigned')}</span>
                )}
              </div>
            </article>

            <article className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-ember">{t('student.familyContacts')}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {parents.length ? (
                  parents.map((link) => (
                    <InfoBlock
                      key={link.parent.id}
                      label={t('student.guardian')}
                      value={`${link.parent.firstName} ${link.parent.lastName}`}
                      detail={link.parent.phone ?? t('student.phoneNotSet')}
                    />
                  ))
                ) : (
                  <InfoBlock label={t('student.guardian')} value={t('student.notSet')} detail={t('student.adminCanComplete')} />
                )}
                <InfoBlock label={t('student.schoolContacts')} value={`${contacts.length} ${t('student.available')}`} detail={t('student.adminAndTeacher')} />
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 rounded-md border border-ocean/10 bg-sky px-4 py-3">
    <span className="flex items-center gap-2 font-bold text-ink">
      <Icon size={17} className="text-ocean" />
      {label}
    </span>
    <span className="text-right text-ink/65">{value}</span>
  </div>
);

const InfoBlock = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <div className="rounded-lg border border-ocean/10 bg-sky/60 p-4">
    <p className="text-xs font-black uppercase tracking-[0.14em] text-ocean/65">{label}</p>
    <p className="mt-2 text-lg font-bold text-ink">{value}</p>
    <p className="mt-1 text-xs text-ink/50">{detail}</p>
  </div>
);

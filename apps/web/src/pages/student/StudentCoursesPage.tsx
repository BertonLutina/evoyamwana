import type { ClassDto } from '@evoyamwana/shared';
import { BookOpen, DoorOpen, GraduationCap, Search, UserRoundCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { StatCard } from '../../components/StatCard';
import { useLocale } from '../../contexts/LocaleContext';
import { classesService } from '../../services/classes.service';

export const StudentCoursesPage = () => {
  const { t } = useLocale();
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');
    classesService
      .list({ academicYear: '2026', page: 1, pageSize: 20 })
      .then((data) => {
        if (isMounted) setClasses(data.classes);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : t('student.loadCoursesError'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const courses = useMemo(
    () =>
      classes.flatMap((classRecord) =>
        (classRecord.subjects ?? []).map((subject) => ({
          ...subject,
          classRecord
        }))
      ),
    [classes]
  );
  const filteredCourses = courses.filter((course) => `${course.name} ${course.code} ${course.classRecord.name}`.toLowerCase().includes(search.toLowerCase()));
  const mainClass = classes[0];
  const teachers = new Set(classes.map((classRecord) => classRecord.teacher?.id).filter(Boolean));

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_340px] xl:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">{t('student.space')}</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">{t('student.myCourses')}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">
                {t('student.myCoursesDescription')}
              </p>
            </div>
            <article className="rounded-lg border border-ocean/10 bg-sky p-5">
              <GraduationCap className="text-ocean" size={28} />
              <p className="mt-4 text-sm font-bold text-ink">{mainClass?.name ?? t('student.unassignedClass')}</p>
              <p className="mt-1 text-sm text-ink/55">{mainClass ? `${mainClass.level} · ${mainClass.academicYear}` : t('student.finalizeAssignment')}</p>
            </article>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label={t('grades.class')} value={isLoading ? '...' : String(classes.length)} icon={DoorOpen} tone="blue" detail={t('student.classLinked')} />
          <StatCard label={t('grades.courses')} value={isLoading ? '...' : String(courses.length)} icon={BookOpen} tone="orange" detail={t('student.programSubjects')} />
          <StatCard label={t('nav.teachers')} value={isLoading ? '...' : String(teachers.size)} icon={UserRoundCheck} tone="green" detail={t('student.associatedTeachers')} />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
            <Search size={18} className="text-ocean/55" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
              placeholder={t('student.searchCourse')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </section>

        <section className="mt-5">
          {isLoading ? (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <LoadingRows rows={6} />
            </article>
          ) : filteredCourses.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <article key={`${course.classRecord.id}-${course.id}`} className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel transition hover:-translate-y-0.5 hover:border-ocean/25">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean">{course.code}</p>
                      <h3 className="mt-2 text-xl font-bold text-ink">{course.name}</h3>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-sky text-ocean">
                      <BookOpen size={21} />
                    </span>
                  </div>
                  <div className="mt-5 space-y-2 text-sm text-ink/62">
                    <p>
                      <span className="font-bold text-ink">{t('grades.class')} :</span> {course.classRecord.name}
                    </p>
                    <p>
                      <span className="font-bold text-ink">{t('student.teacherRole')} :</span>{' '}
                      {course.classRecord.teacher ? `${course.classRecord.teacher.firstName} ${course.classRecord.teacher.lastName}` : t('student.unassigned')}
                    </p>
                    <p>
                      <span className="font-bold text-ink">{t('student.room')} :</span> {course.classRecord.room ?? t('student.notSet')}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title={t('student.noCoursesFound')} description={t('student.noCoursesDetail')} />
          )}
        </section>
      </div>
    </div>
  );
};

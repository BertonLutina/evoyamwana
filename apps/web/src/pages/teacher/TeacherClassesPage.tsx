import type { ClassDto } from '@evoyamwana/shared';
import { BookOpen, DoorOpen, GraduationCap, Search, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { StatCard } from '../../components/StatCard';
import { classesService } from '../../services/classes.service';

export const TeacherClassesPage = () => {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    classesService
      .list({ academicYear: '2026', page: 1, pageSize: 100 })
      .then((data) => {
        if (isMounted) setClasses(data.classes);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger vos classes.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredClasses = classes.filter((classRecord) => `${classRecord.name} ${classRecord.level} ${classRecord.room ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const studentCount = useMemo(() => classes.reduce((total, classRecord) => total + (classRecord.students?.length ?? classRecord._count?.students ?? 0), 0), [classes]);
  const subjectCount = useMemo(() => classes.reduce((total, classRecord) => total + (classRecord.subjects?.length ?? classRecord._count?.subjects ?? 0), 0), [classes]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">Espace enseignant</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">Mes classes</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">Retrouvez vos groupes assignés, les effectifs, les matières et les accès rapides pour l’appel ou les notes.</p>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Classes assignées" value={isLoading ? '...' : String(classes.length)} icon={DoorOpen} tone="blue" detail="Depuis PostgreSQL" />
          <StatCard label="Élèves suivis" value={isLoading ? '...' : String(studentCount)} icon={UsersRound} tone="green" detail="Dans vos classes" />
          <StatCard label="Cours" value={isLoading ? '...' : String(subjectCount)} icon={BookOpen} tone="orange" detail="Matières liées" />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
            <Search size={18} className="text-ocean/55" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Rechercher une classe" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
        </section>

        <section className="mt-5">
          {isLoading ? (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <LoadingRows rows={6} />
            </article>
          ) : filteredClasses.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredClasses.map((classRecord) => (
                <Link key={classRecord.id} to={`/classes/${classRecord.id}`} className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel transition hover:-translate-y-0.5 hover:border-ocean/30">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean">{classRecord.level}</p>
                      <h3 className="mt-2 text-xl font-bold text-ink">{classRecord.name}</h3>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-sky text-ocean">
                      <GraduationCap size={21} />
                    </span>
                  </div>
                  <div className="mt-5 grid gap-2 text-sm text-ink/62">
                    <p><span className="font-bold text-ink">Élèves :</span> {classRecord.students?.length ?? classRecord._count?.students ?? 0}</p>
                    <p><span className="font-bold text-ink">Cours :</span> {classRecord.subjects?.map((subject) => subject.name).join(', ') || 'Aucun cours'}</p>
                    <p><span className="font-bold text-ink">Salle :</span> {classRecord.room ?? 'Non définie'}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="Aucune classe assignée" description="Les classes de votre profil enseignant apparaîtront ici." />
          )}
        </section>
      </div>
    </div>
  );
};

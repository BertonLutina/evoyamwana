import type { StudentDto } from '@evoyamwana/shared';
import { BookOpen, CalendarCheck, ChevronRight, GraduationCap, ShieldCheck, UserRoundCheck, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { studentsService } from '../../services/students.service';

const categoryLabels: Record<string, string> = {
  maternelle: 'Maternelle',
  primaire: 'Primaire',
  secondaire: 'Secondaire',
  universite: 'Université',
  MATERNELLE: 'Maternelle',
  PRIMAIRE: 'Primaire',
  SECONDAIRE: 'Secondaire',
  UNIVERSITE: 'Université'
};

const statusCopy = {
  active: { label: 'Actif', className: 'bg-canopy/10 text-canopy' },
  inactive: { label: 'Inactif', className: 'bg-clay/10 text-clay' },
  transferred: { label: 'Transféré', className: 'bg-maize/25 text-earth' },
  graduated: { label: 'Diplômé', className: 'bg-ocean/10 text-ocean' }
};

const getStudentName = (student: StudentDto) => `${student.firstName} ${student.lastName}`.trim();

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Impossible de charger les enfants liés à ce parent.');

export const ParentChildrenPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadChildren = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await studentsService.list({ page: 1, pageSize: 100, status: 'all' });
        if (mounted) setStudents(result.students);
      } catch (loadError) {
        if (mounted) setError(getErrorMessage(loadError));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadChildren();

    return () => {
      mounted = false;
    };
  }, []);

  const activeCount = students.filter((student) => student.isActive).length;
  const classCount = useMemo(() => new Set(students.map((student) => student.class?.id).filter(Boolean)).size, [students]);
  const primaryContacts = students.reduce((count, student) => {
    const guardians = student.guardians ?? [];
    return count + guardians.filter((guardian) => guardian.isPrimaryContact || guardian.emergencyContact).length;
  }, 0);

  return (
    <section className="space-y-6">
      <div className="premium-card overflow-hidden p-0">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_320px] md:p-8">
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-ember">Espace parent</p>
            <h1 className="mt-3 font-display text-4xl font-black text-ink md:text-5xl">Mes enfants</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink/62">
              Les profils scolaires rattachés au compte de {user?.fullName ?? 'ce parent'} apparaissent ici.
            </p>
          </div>
          <div className="rounded-lg border border-ocean/15 bg-sky/70 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-ocean shadow-sm">
              <UsersRound size={22} />
            </span>
            <p className="mt-4 text-sm font-bold text-ink">Suivi familial</p>
            <p className="mt-2 text-sm leading-6 text-ink/60">Chaque carte ouvre le dossier scolaire de l’enfant sélectionné.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Enfants liés" value={isLoading ? '...' : String(students.length)} icon={GraduationCap} tone="blue" detail="Compte parent" />
        <StatCard label="Profils actifs" value={isLoading ? '...' : String(activeCount)} icon={ShieldCheck} tone="green" detail="Scolarité en cours" />
        <StatCard label="Classes" value={isLoading ? '...' : String(classCount)} icon={BookOpen} tone="orange" detail={`${primaryContacts} contact(s) prioritaire(s)`} />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="premium-card p-5">
            <LoadingRows rows={5} />
          </div>
        ) : error ? (
          <EmptyState icon={GraduationCap} title="Enfants indisponibles" description={error} />
        ) : students.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {students.map((student) => {
              const statusKey = String(student.status ?? (student.isActive ? 'active' : 'inactive')).toLowerCase() as keyof typeof statusCopy;
              const status = statusCopy[statusKey] ?? statusCopy.inactive;
              const category = student.category ? categoryLabels[student.category] ?? student.category : 'Cycle non renseigné';

              return (
                <article key={student.id} className="premium-card p-5 transition duration-300 hover:-translate-y-0.5 hover:border-ocean/25 hover:shadow-soft">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-ocean/10 text-ocean">
                        <GraduationCap size={25} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xl font-black text-ink">{getStudentName(student)}</p>
                        <p className="mt-1 text-sm font-semibold text-ink/50">{student.studentCode}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${status.className}`}>{status.label}</span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <ChildInfo icon={BookOpen} label="Classe" value={student.class?.name ?? 'Non assignée'} />
                    <ChildInfo icon={UserRoundCheck} label="Niveau" value={student.class?.level ?? category} />
                    <ChildInfo icon={CalendarCheck} label="Cycle" value={category} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/students/${student.id}`)}
                      className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-black text-white transition hover:bg-ocean focus:outline-none focus:ring-4 focus:ring-ocean/20"
                    >
                      Ouvrir le dossier
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/attendance')}
                      className="inline-flex items-center gap-2 rounded-lg border border-ocean/15 px-4 py-3 text-sm font-black text-ocean transition hover:bg-sky focus:outline-none focus:ring-4 focus:ring-ocean/15"
                    >
                      Présences
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/grades')}
                      className="inline-flex items-center gap-2 rounded-lg border border-ocean/15 px-4 py-3 text-sm font-black text-ocean transition hover:bg-sky focus:outline-none focus:ring-4 focus:ring-ocean/15"
                    >
                      Notes
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={GraduationCap} title="Aucun enfant lié" description="Les enfants rattachés à votre compte parent apparaîtront ici après l’inscription." />
        )}
      </div>
    </section>
  );
};

interface ChildInfoProps {
  icon: typeof BookOpen;
  label: string;
  value: string;
}

const ChildInfo = ({ icon: Icon, label, value }: ChildInfoProps) => (
  <div className="rounded-lg border border-ink/8 bg-white/70 p-3">
    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-ink/42">
      <Icon size={14} />
      {label}
    </div>
    <p className="mt-2 truncate text-sm font-black text-ink">{value}</p>
  </div>
);

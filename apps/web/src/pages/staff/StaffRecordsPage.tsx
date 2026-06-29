import type { ClassDto, ParentDto, StudentDto, TeacherDto, UserRole } from '@evoyamwana/shared';
import { BookOpen, GraduationCap, Plus, Search, User, UsersRound, UserRoundCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { StatCard } from '../../components/StatCard';
import { StudentFormModal } from '../../components/StudentFormModal';
import { classesService } from '../../services/classes.service';
import { parentsService } from '../../services/parents.service';
import { studentsService, type StudentFormPayload } from '../../services/students.service';
import { teachersService } from '../../services/teachers.service';

type StaffRole = Extract<UserRole, 'DIRECTOR' | 'SECRETARY' | 'DISCIPLINE_OFFICER' | 'LIBRARIAN' | 'NURSE' | 'TRANSPORT_MANAGER' | 'CANTEEN_MANAGER'>;
type DirectoryKind = 'students' | 'teachers' | 'parents' | 'classes';

const roleCopy: Record<StaffRole, { label: string; eyebrow: string }> = {
  DIRECTOR: { label: 'Direction', eyebrow: 'Pilotage école' },
  SECRETARY: { label: 'Secrétariat', eyebrow: 'Gestion administrative' },
  DISCIPLINE_OFFICER: { label: 'Discipline', eyebrow: 'Suivi discipline' },
  LIBRARIAN: { label: 'Bibliothèque', eyebrow: 'Ressources scolaires' },
  NURSE: { label: 'Infirmerie', eyebrow: 'Suivi santé' },
  TRANSPORT_MANAGER: { label: 'Transport', eyebrow: 'Trajets scolaires' },
  CANTEEN_MANAGER: { label: 'Cantine', eyebrow: 'Restauration scolaire' }
};

export const StaffStudentsPage = ({ role }: { role: StaffRole }) => <StaffRecordsPage role={role} kind="students" />;
export const StaffTeachersPage = ({ role }: { role: StaffRole }) => <StaffRecordsPage role={role} kind="teachers" />;
export const StaffParentsPage = ({ role }: { role: StaffRole }) => <StaffRecordsPage role={role} kind="parents" />;
export const StaffClassesPage = ({ role }: { role: StaffRole }) => <StaffRecordsPage role={role} kind="classes" />;

const StaffRecordsPage = ({ role, kind }: { role: StaffRole; kind: DirectoryKind }) => {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Array<StudentDto | TeacherDto | ParentDto | ClassDto>>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copy = getCopy(role, kind);
  const canEnrollStudent = role === 'DIRECTOR' && kind === 'students';

  const refreshDirectory = async (nextSearch = search) => {
    const data = await loadDirectory(kind, nextSearch);
    setRows(data.rows);
    setTotal(data.total);
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');
    loadDirectory(kind, search)
      .then((data) => {
        if (!isMounted) return;
        setRows(data.rows);
        setTotal(data.total);
      })
      .catch((loadError) => {
        if (isMounted) {
          setRows([]);
          setTotal(0);
          setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les données.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [kind, search]);

  const handleCreateStudent = async (payload: StudentFormPayload) => {
    setIsSubmitting(true);
    setError('');
    try {
      await studentsService.create(payload);
      setIsCreateOpen(false);
      await refreshDirectory();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible d’inscrire l’élève.');
      throw submitError;
    } finally {
      setIsSubmitting(false);
    }
  };

  const secondaryTotal = useMemo(() => getSecondaryTotal(kind, rows), [kind, rows]);
  const Icon = copy.icon;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">{copy.eyebrow}</p>
          <div className="mt-3 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <h2 className="font-display text-4xl font-bold text-ink">{copy.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">{copy.description}</p>
            </div>
            {canEnrollStudent ? (
              <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ocean px-4 text-sm font-bold text-white transition hover:bg-ink" onClick={() => setIsCreateOpen(true)}>
                <Plus size={18} />
                Inscrire un élève
              </button>
            ) : (
              <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ocean px-4 text-sm font-bold text-white transition hover:bg-ink" to={copy.actionPath}>
                <copy.actionIcon size={18} />
                {copy.actionLabel}
              </Link>
            )}
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label={copy.primaryStat} value={isLoading ? '...' : String(total)} icon={Icon} tone="blue" detail="Depuis l'API école" />
          <StatCard label={copy.secondaryStat} value={isLoading ? '...' : String(secondaryTotal)} icon={copy.secondaryIcon} tone="green" detail={copy.secondaryDetail} />
          <StatCard label="Accès" value={roleCopy[role].label} icon={User} tone="orange" detail="Vue séparée par rôle" />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
            <Search size={18} className="text-ocean/55" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder={copy.searchPlaceholder} value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5">
          {isLoading ? (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <LoadingRows rows={7} />
            </article>
          ) : rows.length ? (
            <ResponsiveTable data={rows} getRowKey={(row) => row.id} columns={getColumns(kind, role)} />
          ) : (
            <EmptyState icon={Icon} title={copy.emptyTitle} description="Aucune donnée ne correspond aux filtres actuels." />
          )}
        </section>
      </div>

      {canEnrollStudent && isCreateOpen ? (
        <StudentFormModal mode="create" isSubmitting={isSubmitting} onClose={() => setIsCreateOpen(false)} onSubmit={handleCreateStudent} />
      ) : null}
    </div>
  );
};

async function loadDirectory(kind: DirectoryKind, search: string) {
  const params = { search, page: 1, pageSize: 100 };
  if (kind === 'students') {
    const data = await studentsService.list({ ...params, status: 'all' });
    return { rows: data.students, total: data.pagination.total };
  }
  if (kind === 'teachers') {
    const data = await teachersService.list(params);
    return { rows: data.teachers, total: data.pagination.total };
  }
  if (kind === 'parents') {
    const data = await parentsService.list(params);
    return { rows: data.parents, total: data.pagination.total };
  }
  const data = await classesService.list({ ...params, academicYear: '2026' });
  return { rows: data.classes, total: data.pagination.total };
}

function getCopy(role: StaffRole, kind: DirectoryKind) {
  const base = roleCopy[role];
  const records: Record<DirectoryKind, {
    actionIcon: LucideIcon;
    actionLabel: string;
    actionPath: string;
    description: string;
    emptyTitle: string;
    icon: LucideIcon;
    primaryStat: string;
    searchPlaceholder: string;
    secondaryDetail: string;
    secondaryIcon: LucideIcon;
    secondaryStat: string;
    title: string;
  }> = {
    students: {
      actionIcon: GraduationCap,
      actionLabel: role === 'DIRECTOR' ? 'Voir dossiers élèves' : 'Ouvrir dossiers',
      actionPath: role === 'DIRECTOR' ? '/students' : '/students?action=create',
      description: getStudentDescription(role),
      emptyTitle: 'Aucun élève trouvé',
      icon: GraduationCap,
      primaryStat: role === 'DIRECTOR' ? 'Inscriptions' : 'Élèves',
      searchPlaceholder: role === 'DIRECTOR' ? 'Rechercher inscrit, classe ou matricule' : 'Rechercher nom ou matricule élève',
      secondaryDetail: role === 'DIRECTOR' ? 'Dossiers validés' : 'Dossiers actifs',
      secondaryIcon: GraduationCap,
      secondaryStat: role === 'DIRECTOR' ? 'Validées' : 'Actifs',
      title: getStudentTitle(role)
    },
    teachers: {
      actionIcon: UserRoundCheck,
      actionLabel: 'Voir profils',
      actionPath: '/teachers',
      description: 'Consultez les enseignants, leurs matricules, classes assignées et matières depuis les données existantes.',
      emptyTitle: 'Aucun enseignant trouvé',
      icon: UserRoundCheck,
      primaryStat: 'Enseignants',
      searchPlaceholder: 'Rechercher enseignant, email ou matricule',
      secondaryDetail: 'Affectations visibles',
      secondaryIcon: BookOpen,
      secondaryStat: 'Classes liées',
      title: 'Équipe pédagogique'
    },
    parents: {
      actionIcon: UsersRound,
      actionLabel: 'Voir contacts',
      actionPath: '/parents',
      description: 'Consultez les responsables familiaux, leurs contacts et les enfants rattachés.',
      emptyTitle: 'Aucun parent trouvé',
      icon: UsersRound,
      primaryStat: 'Parents',
      searchPlaceholder: 'Rechercher parent, email ou téléphone',
      secondaryDetail: 'Relations élève-parent',
      secondaryIcon: GraduationCap,
      secondaryStat: 'Enfants liés',
      title: role === 'DIRECTOR' ? 'Parents - Direction' : 'Contacts parents'
    },
    classes: {
      actionIcon: BookOpen,
      actionLabel: 'Voir classes',
      actionPath: '/classes',
      description: role === 'DIRECTOR' ? 'Surveillez la structure académique, les titulaires, effectifs et matières.' : 'Consultez les classes, salles, titulaires et effectifs autorisés pour votre rôle.',
      emptyTitle: 'Aucune classe trouvée',
      icon: BookOpen,
      primaryStat: 'Classes',
      searchPlaceholder: 'Rechercher classe, niveau ou salle',
      secondaryDetail: 'Effectif déclaré',
      secondaryIcon: UsersRound,
      secondaryStat: 'Élèves',
      title: role === 'DIRECTOR' ? 'Classes - Direction' : 'Répertoire des classes'
    }
  };

  return { ...records[kind], eyebrow: base.eyebrow };
}

function getStudentTitle(role: StaffRole) {
  const titles: Partial<Record<StaffRole, string>> = {
    DIRECTOR: 'Inscriptions élèves',
    SECRETARY: 'Dossiers élèves',
    DISCIPLINE_OFFICER: 'Élèves à suivre',
    LIBRARIAN: 'Lecteurs et classes',
    NURSE: 'Dossiers utiles santé',
    TRANSPORT_MANAGER: 'Élèves transportés',
    CANTEEN_MANAGER: 'Élèves cantine'
  };
  return titles[role] ?? 'Élèves';
}

function getStudentDescription(role: StaffRole) {
  const descriptions: Partial<Record<StaffRole, string>> = {
    DIRECTOR: 'Pilotez les inscriptions, les effectifs actifs, les classes d’affectation et les responsables liés à chaque dossier élève.',
    SECRETARY: 'Retrouvez les dossiers élèves, responsables et affectations de classe utiles à l’accueil.',
    DISCIPLINE_OFFICER: 'Consultez les élèves, classes et responsables pour suivre les retards, absences et alertes de discipline.',
    LIBRARIAN: 'Retrouvez les élèves et leurs classes pour préparer les prêts, retours et rappels bibliothèque.',
    NURSE: 'Accédez aux élèves et classes nécessaires au suivi santé, sans ouvrir les workflows administratifs.',
    TRANSPORT_MANAGER: 'Identifiez les élèves, classes et contacts utiles pour organiser les trajets et alertes transport.',
    CANTEEN_MANAGER: 'Suivez les élèves concernés par la cantine et reliez-les aux paiements ou communications famille.'
  };
  return descriptions[role] ?? 'Consultez les dossiers autorisés par votre rôle.';
}

function getSecondaryTotal(kind: DirectoryKind, rows: Array<StudentDto | TeacherDto | ParentDto | ClassDto>) {
  if (kind === 'students') return (rows as StudentDto[]).filter((student) => student.isActive).length;
  if (kind === 'teachers') {
    return new Set(
      (rows as TeacherDto[]).flatMap((teacher) => teacher.classes?.map((classRecord) => classRecord.id) ?? [])
    ).size;
  }
  if (kind === 'parents') return (rows as ParentDto[]).reduce((total, parent) => total + (parent.children?.length ?? 0), 0);
  return (rows as ClassDto[]).reduce((total, classRecord) => total + (classRecord.students?.length ?? classRecord._count?.students ?? 0), 0);
}

function getColumns(kind: DirectoryKind, role: StaffRole) {
  if (kind === 'students') {
    return [
      { key: 'student', header: role === 'DIRECTOR' ? 'Inscrit' : 'Élève', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => renderStudent(row as StudentDto) },
      { key: 'class', header: 'Classe', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => (row as StudentDto).class?.name ?? 'Non assigné' },
      { key: 'parents', header: 'Responsables', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => (row as StudentDto).parents?.map((item) => `${item.parent.firstName} ${item.parent.lastName}`).join(', ') || 'Aucun' },
      { key: 'status', header: role === 'DIRECTOR' ? 'Inscription' : 'Statut', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => ((row as StudentDto).isActive ? 'Validée' : 'Suspendue') },
      { key: 'action', header: 'Dossier', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => <RecordLink to={`/students/${row.id}`} label="Consulter" /> }
    ];
  }
  if (kind === 'teachers') {
    return [
      { key: 'teacher', header: 'Enseignant', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => renderTeacher(row as TeacherDto) },
      { key: 'employeeNumber', header: 'Matricule', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => (row as TeacherDto).employeeNumber },
      { key: 'classes', header: 'Classes', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => renderTeacherClasses(row as TeacherDto) },
      { key: 'subjects', header: 'Matières', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => renderTeacherSubjects(row as TeacherDto) },
      { key: 'action', header: 'Action', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => <RecordLink to={`/teachers/${row.id}`} label="Profil" /> }
    ];
  }
  if (kind === 'parents') {
    return [
      { key: 'parent', header: 'Parent', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => renderParent(row as ParentDto) },
      { key: 'phone', header: 'Téléphone', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => (row as ParentDto).phone ?? 'Non renseigné' },
      { key: 'children', header: 'Enfants', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => (row as ParentDto).children?.map((item) => `${item.student.firstName} ${item.student.lastName}`).join(', ') || 'Aucun' },
      { key: 'action', header: 'Action', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => <RecordLink to={`/parents/${row.id}`} label="Dossier" /> }
    ];
  }
  return [
    { key: 'class', header: 'Classe', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => renderClass(row as ClassDto) },
    { key: 'teacher', header: 'Titulaire', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => {
      const teacher = (row as ClassDto).teacher;
      return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Non assigné';
    } },
    { key: 'students', header: 'Élèves', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => (row as ClassDto).students?.length ?? (row as ClassDto)._count?.students ?? 0 },
    { key: 'subjects', header: 'Matières', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => (row as ClassDto).subjects?.map((item) => item.name).join(', ') || 'Aucune' },
    { key: 'action', header: 'Action', render: (row: StudentDto | TeacherDto | ParentDto | ClassDto) => <RecordLink to={`/classes/${row.id}`} label="Ouvrir" /> }
  ];
}

const RecordLink = ({ label, to }: { label: string; to: string }) => (
  <Link className="font-bold text-ocean hover:text-ember" to={to}>
    {label}
  </Link>
);

const renderStudent = (student: StudentDto) => (
  <div>
    <p className="font-bold">{student.firstName} {student.lastName}</p>
    <p className="text-xs text-ink/50">{student.studentCode}</p>
  </div>
);

const renderTeacher = (teacher: TeacherDto) => (
  <div>
    <p className="font-bold">{teacher.firstName} {teacher.lastName}</p>
    <p className="text-xs text-ink/50">{teacher.user?.email ?? 'Email non renseigné'}</p>
  </div>
);

const renderTeacherClasses = (teacher: TeacherDto) => {
  const classes = uniqueByName(teacher.classes ?? []);
  if (!classes.length) return 'Non assigné';

  return (
    <div>
      <p>{classes.map((classRecord) => classRecord.name).join(', ')}</p>
      {(teacher.classes?.length ?? 0) > classes.length ? (
        <p className="mt-1 text-xs text-ink/50">{teacher.classes?.length} affectations classe</p>
      ) : null}
    </div>
  );
};

const renderTeacherSubjects = (teacher: TeacherDto) => {
  const subjects = uniqueByName(teacher.subjects ?? []);
  if (!subjects.length) return 'Aucune';

  return (
    <div>
      <p>{subjects.map((subject) => subject.name).join(', ')}</p>
      {(teacher.subjects?.length ?? 0) > subjects.length ? (
        <p className="mt-1 text-xs text-ink/50">{teacher.subjects?.length} affectations matière</p>
      ) : null}
    </div>
  );
};

function uniqueByName<T extends { name: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.trim().toLocaleLowerCase('fr');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const renderParent = (parent: ParentDto) => (
  <div>
    <p className="font-bold">{parent.firstName} {parent.lastName}</p>
    <p className="text-xs text-ink/50">{parent.user?.email ?? 'Email non renseigné'}</p>
  </div>
);

const renderClass = (classRecord: ClassDto) => (
  <div>
    <p className="font-bold">{classRecord.name}</p>
    <p className="text-xs text-ink/50">{classRecord.level} · {classRecord.room ?? 'Salle non définie'}</p>
  </div>
);

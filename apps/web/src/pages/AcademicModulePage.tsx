import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, ClipboardList, CreditCard, Plus, School } from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { LoadingRows } from '../components/LoadingRows';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { StatCard } from '../components/StatCard';
import { academicService, type AssignmentDto, type FeeDto, type SchoolYearDto, type SubjectDto, type TimetableEntryDto } from '../services/academic.service';
import { classesService } from '../services/classes.service';
import { teachersService } from '../services/teachers.service';
import type { ClassDto, TeacherDto } from '@evoyamwana/shared';

type ModuleKind = 'subjects' | 'schoolYears' | 'timetable' | 'assignments' | 'fees';

const configs = {
  subjects: { eyebrow: 'Programme', title: 'Matières', icon: BookOpen, description: 'Créez les matières, coefficients, classes et professeurs responsables.' },
  schoolYears: { eyebrow: 'Année scolaire', title: 'Années & trimestres', icon: CalendarDays, description: 'Centralisez les années scolaires et périodes officielles.' },
  timetable: { eyebrow: 'Planning réel', title: 'Timetable', icon: School, description: 'Planifiez classe, matière, professeur, salle, jour et heure.' },
  assignments: { eyebrow: 'Travaux', title: 'Devoirs', icon: ClipboardList, description: 'Créez les devoirs liés aux classes, matières, dates limites et fichiers.' },
  fees: { eyebrow: 'Frais scolaires', title: 'Frais', icon: CreditCard, description: 'Définissez frais annuels, trimestriels, mensuels ou ponctuels.' }
} as const;

const inputClass = 'h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean';

export const AcademicModulePage = ({ kind }: { kind: ModuleKind }) => {
  const config = configs[kind];
  const Icon = config.icon;
  const [items, setItems] = useState<Array<SubjectDto | SchoolYearDto | TimetableEntryDto | AssignmentDto | FeeDto>>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYearDto[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [classData, teacherData, subjectData, yearData] = await Promise.all([
        classesService.list({ page: 1, pageSize: 100 }).catch(() => ({ classes: [] })),
        teachersService.list({ page: 1, pageSize: 100 }).catch(() => ({ teachers: [] })),
        academicService.subjects({ page: 1, pageSize: 100 }).catch(() => ({ items: [] })),
        academicService.schoolYears({ page: 1, pageSize: 100 }).catch(() => ({ items: [] }))
      ]);
      setClasses(classData.classes);
      setTeachers(teacherData.teachers);
      setSubjects(subjectData.items);
      setSchoolYears(yearData.items);

      const data = kind === 'subjects'
        ? await academicService.subjects({ page: 1, pageSize: 100 })
        : kind === 'schoolYears'
          ? await academicService.schoolYears({ page: 1, pageSize: 100 })
          : kind === 'timetable'
            ? await academicService.timetable({ page: 1, pageSize: 100 })
            : kind === 'assignments'
              ? await academicService.assignments({ page: 1, pageSize: 100 })
              : await academicService.fees({ page: 1, pageSize: 100 });
      setItems(data.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger ce module.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void load(); }, [kind]);

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      if (kind === 'subjects') await academicService.createSubject({ name: form.name, code: form.code, classId: form.classId || undefined, teacherId: form.teacherId || undefined, coefficient: Number(form.coefficient || 1), description: form.description || undefined });
      if (kind === 'schoolYears') {
        const year = await academicService.createSchoolYear({ name: form.name, startsAt: form.startsAt || undefined, endsAt: form.endsAt || undefined, isActive: form.isActive === 'true' });
        await Promise.all(['Trimestre 1', 'Trimestre 2', 'Trimestre 3'].map((name, index) => academicService.createTerm({ schoolYearId: year.id, name, order: index + 1, isActive: index === 0 })));
      }
      if (kind === 'timetable') await academicService.createTimetableEntry({ classId: form.classId, subjectId: form.subjectId, teacherId: form.teacherId || undefined, dayOfWeek: Number(form.dayOfWeek || 1), startsAt: form.startsAt, endsAt: form.endsAt, room: form.room || undefined, term: form.term || undefined, notes: form.notes || undefined });
      if (kind === 'assignments') await academicService.createAssignment({ teacherId: form.teacherId, classId: form.classId, subjectId: form.subjectId, title: form.title, description: form.description || undefined, dueDate: form.dueDate, maxScore: Number(form.maxScore || 20), term: form.term || 'Trimestre 1', attachmentUrl: form.attachmentUrl || undefined });
      if (kind === 'fees') await academicService.createFee({ name: form.name, amount: Number(form.amount || 0), billingCycle: form.billingCycle || 'trimester', classId: form.classId || undefined, category: form.category || undefined, term: form.term || undefined, dueDate: form.dueDate || undefined, description: form.description || undefined });
      setForm({});
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer.');
    } finally {
      setIsSaving(false);
    }
  };

  const fields = useMemo(() => getFields(kind, classes, teachers, subjects, schoolYears), [kind, classes, teachers, subjects, schoolYears]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-ember">{config.eyebrow}</p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-black text-ink"><Icon size={28} className="text-ocean" /> {config.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/62">{config.description}</p>
      </section>

      {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <StatCard label="Enregistrements" value={isLoading ? '...' : String(items.length)} icon={Icon} tone="blue" detail="Depuis API" />
        <StatCard label="Classes" value={String(classes.length)} icon={School} tone="green" detail="Disponibles" />
        <StatCard label="Création" value={isSaving ? '...' : 'Prête'} icon={Plus} tone="orange" detail="Formulaire actif" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[24rem_1fr]">
        <form className="rounded-lg border border-ocean/10 bg-white p-4 shadow-panel" onSubmit={submit}>
          <h2 className="text-lg font-black text-ink">Nouvel élément</h2>
          <div className="mt-4 grid gap-3">
            {fields.map((field) => field.type === 'select' ? (
              <label key={field.name} className="grid gap-2 text-sm font-semibold text-ink">
                <span>{field.label}</span>
                <select className={inputClass} value={form[field.name] ?? ''} onChange={(event) => update(field.name, event.target.value)} required={field.required}>
                  <option value="">Sélectionner</option>
                  {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            ) : (
              <Input key={field.name} label={field.label} type={field.type} value={form[field.name] ?? ''} onChange={(event) => update(field.name, event.target.value)} required={field.required} />
            ))}
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Enregistrement...' : 'Créer'}</Button>
          </div>
        </form>

        <div>
          {isLoading ? <LoadingRows rows={6} /> : items.length ? (
            <ResponsiveTable<any>
              data={items}
              getRowKey={(item) => item.id}
              columns={getColumns(kind)}
            />
          ) : <EmptyState icon={Icon} title="Aucun élément" description="Créez le premier enregistrement pour ce module." />}
        </div>
      </section>
    </div>
  );
};

type Field = { name: string; label: string; type: string; required?: boolean; options?: Array<{ value: string; label: string }> };
const option = (value: string, label: string) => ({ value, label });
const classOptions = (classes: ClassDto[]) => classes.map((item) => option(item.id, item.name));
const teacherOptions = (teachers: TeacherDto[]) => teachers.map((item) => option(item.id, `${item.firstName} ${item.lastName}`));
const subjectOptions = (subjects: SubjectDto[]) => subjects.map((item) => option(item.id, item.name));
const yearOptions = (years: SchoolYearDto[]) => years.flatMap((year) => (year.terms?.length ? year.terms.map((term) => option(term.name, `${year.name} - ${term.name}`)) : [option(year.name, year.name)]));
const studentCategoryOptions = [
  option('creche', 'Crèche / garderie'),
  option('maternelle', 'Maternelle'),
  option('primaire', 'Primaire'),
  option('secondaire', 'Secondaire'),
  option('secondaire_general', 'Secondaire général'),
  option('secondaire_technique', 'Secondaire technique'),
  option('formation', 'Centre de formation'),
  option('haute_ecole', 'Haute école'),
  option('universite', 'Université'),
  option('mixte', 'École mixte')
];

function getFields(kind: ModuleKind, classes: ClassDto[], teachers: TeacherDto[], subjects: SubjectDto[], schoolYears: SchoolYearDto[]): Field[] {
  if (kind === 'subjects') return [
    { name: 'name', label: 'Nom matière', type: 'text', required: true },
    { name: 'code', label: 'Code', type: 'text', required: true },
    { name: 'coefficient', label: 'Coefficient', type: 'number' },
    { name: 'classId', label: 'Classe', type: 'select', options: classOptions(classes) },
    { name: 'teacherId', label: 'Professeur', type: 'select', options: teacherOptions(teachers) },
    { name: 'description', label: 'Description', type: 'text' }
  ];
  if (kind === 'schoolYears') return [
    { name: 'name', label: 'Année scolaire', type: 'text', required: true },
    { name: 'startsAt', label: 'Début', type: 'date' },
    { name: 'endsAt', label: 'Fin', type: 'date' },
    { name: 'isActive', label: 'Activer', type: 'select', options: [option('true', 'Oui'), option('false', 'Non')] }
  ];
  if (kind === 'timetable') return [
    { name: 'classId', label: 'Classe', type: 'select', required: true, options: classOptions(classes) },
    { name: 'subjectId', label: 'Matière', type: 'select', required: true, options: subjectOptions(subjects) },
    { name: 'teacherId', label: 'Professeur', type: 'select', options: teacherOptions(teachers) },
    { name: 'dayOfWeek', label: 'Jour 1-7', type: 'number', required: true },
    { name: 'startsAt', label: 'Début', type: 'time', required: true },
    { name: 'endsAt', label: 'Fin', type: 'time', required: true },
    { name: 'room', label: 'Salle', type: 'text' },
    { name: 'term', label: 'Trimestre', type: 'select', options: yearOptions(schoolYears) }
  ];
  if (kind === 'assignments') return [
    { name: 'title', label: 'Titre devoir', type: 'text', required: true },
    { name: 'classId', label: 'Classe', type: 'select', required: true, options: classOptions(classes) },
    { name: 'subjectId', label: 'Matière', type: 'select', required: true, options: subjectOptions(subjects) },
    { name: 'teacherId', label: 'Professeur', type: 'select', required: true, options: teacherOptions(teachers) },
    { name: 'dueDate', label: 'Date limite', type: 'date', required: true },
    { name: 'maxScore', label: 'Points', type: 'number' },
    { name: 'term', label: 'Trimestre', type: 'select', options: yearOptions(schoolYears) },
    { name: 'attachmentUrl', label: 'Fichier joint URL', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' }
  ];
  return [
    { name: 'name', label: 'Nom du frais', type: 'text', required: true },
    { name: 'amount', label: 'Montant', type: 'number', required: true },
    { name: 'billingCycle', label: 'Cycle', type: 'select', options: [option('trimester', 'Trimestriel'), option('annual', 'Annuel'), option('monthly', 'Mensuel'), option('one_time', 'Ponctuel')] },
    { name: 'classId', label: 'Classe', type: 'select', options: classOptions(classes) },
    { name: 'category', label: 'Catégorie élève', type: 'select', options: studentCategoryOptions },
    { name: 'term', label: 'Trimestre', type: 'select', options: yearOptions(schoolYears) },
    { name: 'dueDate', label: 'Échéance', type: 'date' },
    { name: 'description', label: 'Description', type: 'text' }
  ];
}

function getColumns(kind: ModuleKind) {
  if (kind === 'subjects') return [
    { key: 'name', header: 'Matière', render: (item: SubjectDto) => <div><p className="font-bold">{item.name}</p><p className="text-xs text-ink/50">{item.code}</p></div> },
    { key: 'coefficient', header: 'Coeff.', render: (item: SubjectDto) => item.coefficient },
    { key: 'class', header: 'Classe', render: (item: SubjectDto) => item.class?.name ?? '-' },
    { key: 'teacher', header: 'Professeur', render: (item: SubjectDto) => item.teacher ? `${item.teacher.firstName} ${item.teacher.lastName}` : '-' }
  ];
  if (kind === 'schoolYears') return [
    { key: 'name', header: 'Année', render: (item: SchoolYearDto) => <strong>{item.name}</strong> },
    { key: 'active', header: 'Active', render: (item: SchoolYearDto) => item.isActive ? 'Oui' : 'Non' },
    { key: 'terms', header: 'Trimestres', render: (item: SchoolYearDto) => item.terms?.map((term) => term.name).join(', ') || '-' }
  ];
  if (kind === 'timetable') return [
    { key: 'day', header: 'Jour', render: (item: TimetableEntryDto) => item.dayOfWeek },
    { key: 'time', header: 'Heure', render: (item: TimetableEntryDto) => `${item.startsAt} - ${item.endsAt}` },
    { key: 'class', header: 'Classe', render: (item: TimetableEntryDto) => item.class?.name ?? '-' },
    { key: 'subject', header: 'Matière', render: (item: TimetableEntryDto) => item.subject?.name ?? '-' },
    { key: 'teacher', header: 'Professeur', render: (item: TimetableEntryDto) => item.teacher ? `${item.teacher.firstName} ${item.teacher.lastName}` : '-' }
  ];
  if (kind === 'assignments') return [
    { key: 'title', header: 'Devoir', render: (item: AssignmentDto) => <div><p className="font-bold">{item.title}</p><p className="text-xs text-ink/50">{item.term}</p></div> },
    { key: 'due', header: 'Date limite', render: (item: AssignmentDto) => new Date(item.dueDate).toLocaleDateString('fr-FR') },
    { key: 'class', header: 'Classe', render: (item: AssignmentDto) => item.class?.name ?? '-' },
    { key: 'subject', header: 'Matière', render: (item: AssignmentDto) => item.subject?.name ?? '-' },
    { key: 'submissions', header: 'Rendus', render: (item: AssignmentDto) => item._count?.submissions ?? 0 }
  ];
  return [
    { key: 'name', header: 'Frais', render: (item: FeeDto) => <strong>{item.name}</strong> },
    { key: 'amount', header: 'Montant', render: (item: FeeDto) => `${item.amount} FC` },
    { key: 'cycle', header: 'Cycle', render: (item: FeeDto) => item.billingCycle },
    { key: 'class', header: 'Classe', render: (item: FeeDto) => item.class?.name ?? item.category ?? '-' },
    { key: 'due', header: 'Échéance', render: (item: FeeDto) => item.dueDate ? new Date(item.dueDate).toLocaleDateString('fr-FR') : '-' }
  ];
}

import type { GradeDto } from '@evoyamwana/shared';

export const termColumns = [
  { key: 'trim1', label: 'Trim 1', aliases: ['Trimestre 1', 'Term 1', 'Trim 1'] },
  { key: 'trim2', label: 'Trim 2', aliases: ['Trimestre 2', 'Term 2', 'Trim 2'] },
  { key: 'trim3', label: 'Trim 3', aliases: ['Trimestre 3', 'Term 3', 'Trim 3'] }
] as const;

export type TermColumnKey = typeof termColumns[number]['key'];

export interface GradeMatrixRow {
  id: string;
  studentName: string;
  studentId?: string;
  className: string;
  subjectName: string;
  coefficient: string;
  terms: Record<TermColumnKey, GradeDto | null>;
  comments: string[];
  grades: GradeDto[];
}

export const termKeyFor = (term: string): TermColumnKey | null => {
  const normalized = term.trim().toLowerCase();
  const match = termColumns.find((column) => column.aliases.some((alias) => alias.toLowerCase() === normalized));
  return match?.key ?? null;
};

export const formatGradePoints = (grade: GradeDto | null) => (grade ? `${Number(grade.score)}/${Number(grade.maxScore)}` : '-');

export const buildGradeMatrixRows = (grades: GradeDto[], groupBy: 'subject' | 'student-subject' = 'subject') => {
  const rows = new Map<string, GradeMatrixRow>();

  grades.forEach((grade) => {
    const studentName = grade.student ? `${grade.student.firstName} ${grade.student.lastName}` : '-';
    const subjectName = grade.subject?.name ?? '-';
    const className = grade.class?.name ?? '-';
    const groupKey = groupBy === 'student-subject'
      ? `${grade.studentId}:${grade.classId}:${grade.subjectId}`
      : `${grade.classId}:${grade.subjectId}`;
    const current = rows.get(groupKey) ?? {
      id: groupKey,
      studentName,
      studentId: grade.studentId,
      className,
      subjectName,
      coefficient: String(Number(grade.coefficient)),
      terms: { trim1: null, trim2: null, trim3: null },
      comments: [],
      grades: []
    };
    const termKey = termKeyFor(grade.term);
    if (termKey) current.terms[termKey] = grade;
    if (grade.comment && !current.comments.includes(grade.comment)) current.comments.push(grade.comment);
    current.grades.push(grade);
    rows.set(groupKey, current);
  });

  return Array.from(rows.values());
};

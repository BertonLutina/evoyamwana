import type { ClassDto, GradeDto } from '@evoyamwana/shared';
import { FormEvent, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { useLocale } from '../contexts/LocaleContext';
import type { GradeFormPayload } from '../services/grades.service';

interface GradeFormModalProps {
  classes: ClassDto[];
  initialGrade?: GradeDto | null;
  defaultClassId?: string;
  defaultClassLabel?: string;
  defaultStudentId?: string;
  defaultStudentLabel?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: GradeFormPayload) => Promise<void>;
}

const assessmentTypes = ['Interro', 'Examen', 'Devoir'];
const examPeriods = ['Période 1', 'Période 2', 'Période 3'];

const splitAssessmentComment = (comment = '') => {
  const examPeriod = examPeriods.find((period) => comment.startsWith(`Examen ${period} - `));
  if (examPeriod) {
    return {
      type: 'Examen',
      period: examPeriod,
      comment: comment.slice(`Examen ${examPeriod} - `.length)
    };
  }

  const match = assessmentTypes.find((type) => comment.startsWith(`${type} - `));
  return {
    type: match ?? 'Interro',
    period: 'Période 1',
    comment: match ? comment.slice(match.length + 3) : comment
  };
};

export const GradeFormModal = ({ classes, initialGrade, defaultClassId = '', defaultClassLabel = 'Classe sélectionnée', defaultStudentId = '', defaultStudentLabel = 'Élève sélectionné', isSubmitting, onClose, onSubmit }: GradeFormModalProps) => {
  const { t } = useLocale();
  const firstClass = classes[0];
  const initialComment = splitAssessmentComment(initialGrade?.comment ?? '');
  const [classId, setClassId] = useState(initialGrade?.classId ?? defaultClassId ?? firstClass?.id ?? '');
  const selectedClass = useMemo(() => classes.find((item) => item.id === classId), [classId, classes]);
  const defaultClassIsAvailable = classes.some((classRecord) => classRecord.id === defaultClassId);
  const defaultStudentIsAvailable = selectedClass?.students?.some((student) => student.id === defaultStudentId);
  const [form, setForm] = useState({
    studentId: initialGrade?.studentId ?? defaultStudentId ?? '',
    subjectId: initialGrade?.subjectId ?? '',
    score: initialGrade ? String(Number(initialGrade.score)) : '',
    maxScore: initialGrade ? String(Number(initialGrade.maxScore)) : '20',
    coefficient: initialGrade ? String(Number(initialGrade.coefficient)) : '1',
    term: initialGrade?.term ?? 'Trimestre 2',
    comment: initialComment.comment
  });
  const [assessmentType, setAssessmentType] = useState(initialComment.type);
  const [examPeriod, setExamPeriod] = useState(initialComment.period);
  const [error, setError] = useState('');

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await onSubmit({
        classId,
        studentId: form.studentId,
        subjectId: form.subjectId,
        score: Number(form.score),
        maxScore: Number(form.maxScore),
        coefficient: form.coefficient ? Number(form.coefficient) : undefined,
        term: form.term,
        comment: `${assessmentType === 'Examen' ? `Examen ${examPeriod}` : assessmentType}${form.comment ? ` - ${form.comment}` : ''}`
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('gradeForm.error'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-6">
      <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-[0_24px_80px_rgba(7,27,58,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">{t('gradeForm.assessment')}</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">{initialGrade ? 'Modifier la note' : t('gradeForm.title')}</h2>
          </div>
          <Button type="button" variant="ghost" className="h-10 w-10 p-0" onClick={onClose} aria-label="Close form">
            <X size={18} />
          </Button>
        </div>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">
            {t('gradeForm.class')}
            <select className="mt-2 h-11 w-full rounded-md border border-ocean/10 bg-white px-3 outline-none focus:border-ocean" value={classId} onChange={(event) => {
              setClassId(event.target.value);
              setForm((current) => ({ ...current, studentId: '', subjectId: '' }));
            }} required>
              <option value="">{t('gradeForm.selectClass')}</option>
              {defaultClassId && !defaultClassIsAvailable ? (
                <option value={defaultClassId}>{defaultClassLabel}</option>
              ) : null}
              {classes.map((classRecord) => (
                <option key={classRecord.id} value={classRecord.id}>{classRecord.name} · {classRecord.academicYear}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            {t('gradeForm.student')}
            <select className="mt-2 h-11 w-full rounded-md border border-ocean/10 bg-white px-3 outline-none focus:border-ocean" value={form.studentId} onChange={(event) => updateField('studentId', event.target.value)} required>
              <option value="">{t('gradeForm.selectStudent')}</option>
              {defaultStudentId && !defaultStudentIsAvailable ? (
                <option value={defaultStudentId}>{defaultStudentLabel}</option>
              ) : null}
              {selectedClass?.students?.map((student) => (
                <option key={student.id} value={student.id}>{student.firstName} {student.lastName} · {student.studentCode}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            {t('gradeForm.subject')}
            <select className="mt-2 h-11 w-full rounded-md border border-ocean/10 bg-white px-3 outline-none focus:border-ocean" value={form.subjectId} onChange={(event) => updateField('subjectId', event.target.value)} required>
              <option value="">{t('gradeForm.selectSubject')}</option>
              {selectedClass?.subjects?.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            {t('gradeForm.score')}
            <input type="number" min="0" step="0.01" className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" value={form.score} onChange={(event) => updateField('score', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold">
            {t('gradeForm.maxScore')}
            <input type="number" min="1" step="0.01" className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" value={form.maxScore} onChange={(event) => updateField('maxScore', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold">
            {t('gradeForm.coefficient')}
            <input type="number" min="0.1" step="0.1" className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" value={form.coefficient} onChange={(event) => updateField('coefficient', event.target.value)} />
          </label>
          <label className="text-sm font-semibold">
            {t('gradeForm.term')}
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" value={form.term} onChange={(event) => updateField('term', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Type d’évaluation
            <div className="mt-2 grid grid-cols-3 gap-2">
              {assessmentTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAssessmentType(type)}
                  className={`h-10 rounded-md text-sm font-black transition ${assessmentType === type ? 'bg-ocean text-white' : 'border border-ocean/10 bg-sky text-ocean hover:bg-white'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </label>
          {assessmentType === 'Examen' ? (
            <label className="text-sm font-semibold sm:col-span-2">
              Période d’examen
              <select className="mt-2 h-11 w-full rounded-md border border-ocean/10 bg-white px-3 outline-none focus:border-ocean" value={examPeriod} onChange={(event) => setExamPeriod(event.target.value)}>
                {examPeriods.map((period) => <option key={period} value={period}>{period}</option>)}
              </select>
            </label>
          ) : null}
          <label className="text-sm font-semibold sm:col-span-2">
            {t('gradeForm.comment')}
            <textarea className="mt-2 min-h-24 w-full rounded-md border border-ocean/10 px-3 py-3 outline-none focus:border-ocean" value={form.comment} onChange={(event) => updateField('comment', event.target.value)} />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>{t('gradeForm.cancel')}</Button>
          <Button type="submit" className="bg-ocean hover:bg-ink" disabled={isSubmitting}>
            {isSubmitting ? t('gradeForm.saving') : initialGrade ? 'Mettre à jour' : t('gradeForm.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
};

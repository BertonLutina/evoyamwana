import type { ClassDto, ParentDto, StudentDto } from '@evoyamwana/shared';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './Button';
import { StudentRegistrationForm } from './student-registration/StudentRegistrationForm';
import { classesService } from '../services/classes.service';
import { parentsService } from '../services/parents.service';
import type { StudentFormPayload } from '../services/students.service';

interface StudentFormModalProps {
  mode: 'create' | 'edit';
  student?: StudentDto;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: StudentFormPayload) => Promise<void>;
}

export const StudentFormModal = ({ mode, student, isSubmitting, onClose, onSubmit }: StudentFormModalProps) => {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [parents, setParents] = useState<ParentDto[]>([]);
  const [optionsError, setOptionsError] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      classesService.list({ page: 1, pageSize: 100, academicYear: '2026' }),
      parentsService.list({ page: 1, pageSize: 100 })
    ])
      .then(([classData, parentData]) => {
        if (!isMounted) return;
        setClasses(classData.classes);
        setParents(parentData.parents);
      })
      .catch(() => {
        if (isMounted) setOptionsError('Impossible de charger les classes ou responsables.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-soft">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ocean/10 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ember">{mode === 'create' ? 'Nouvelle inscription' : 'Modifier inscription'}</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">{mode === 'create' ? 'Inscrire un élève' : 'Modifier l’élève'}</h2>
          </div>
          <Button type="button" variant="ghost" className="h-10 w-10 p-0" onClick={onClose} aria-label="Fermer le formulaire">
            <X size={20} />
          </Button>
        </div>

        <StudentRegistrationForm
          mode={mode}
          student={student}
          classes={classes}
          parents={parents}
          isSubmitting={isSubmitting}
          optionsError={optionsError}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

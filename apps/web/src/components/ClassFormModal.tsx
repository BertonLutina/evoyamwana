import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import type { TeacherDto } from '@evoyamwana/shared';
import { Button } from './Button';
import type { ClassFormPayload } from '../services/classes.service';

interface ClassFormModalProps {
  teachers: TeacherDto[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ClassFormPayload) => Promise<void>;
}

const initialForm: ClassFormPayload = {
  name: '',
  level: '',
  section: '',
  academicYear: '2026',
  teacherId: '',
  room: '',
  capacity: undefined,
  cycle: '',
  option: '',
  shift: '',
  description: ''
};

export const ClassFormModal = ({ teachers, isSubmitting, onClose, onSubmit }: ClassFormModalProps) => {
  const [form, setForm] = useState<ClassFormPayload>(initialForm);
  const [error, setError] = useState('');

  const updateField = (field: keyof ClassFormPayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await onSubmit({
        ...form,
        section: form.section || undefined,
        teacherId: form.teacherId || undefined,
        room: form.room || undefined,
        capacity: form.capacity || undefined,
        cycle: form.cycle || undefined,
        option: form.option || undefined,
        shift: form.shift || undefined,
        description: form.description || undefined
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save class');
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-6">
      <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-[0_24px_80px_rgba(7,27,58,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Classroom</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">Create class</h2>
          </div>
          <Button type="button" variant="ghost" className="h-10 w-10 p-0" onClick={onClose} aria-label="Close form">
            <X size={18} />
          </Button>
        </div>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Class name
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" placeholder="Primaire 6 A" value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold">
            Level
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" placeholder="Primaire 6" value={form.level} onChange={(event) => updateField('level', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold">
            Section
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" placeholder="A" value={form.section} onChange={(event) => updateField('section', event.target.value)} />
          </label>
          <label className="text-sm font-semibold">
            Academic year
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" value={form.academicYear} onChange={(event) => updateField('academicYear', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold">
            Room
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" placeholder="Bâtiment A - Salle 01" value={form.room ?? ''} onChange={(event) => updateField('room', event.target.value)} />
          </label>
          <label className="text-sm font-semibold">
            Capacity
            <input type="number" min="1" className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" placeholder="40" value={form.capacity ?? ''} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value ? Number(event.target.value) : undefined }))} />
          </label>
          <label className="text-sm font-semibold">
            Cycle
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" placeholder="Primaire" value={form.cycle ?? ''} onChange={(event) => updateField('cycle', event.target.value)} />
          </label>
          <label className="text-sm font-semibold">
            Option / Filière
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" placeholder="Tronc commun" value={form.option ?? ''} onChange={(event) => updateField('option', event.target.value)} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Vacation
            <select className="mt-2 h-11 w-full rounded-md border border-ocean/10 bg-white px-3 outline-none focus:border-ocean" value={form.shift ?? ''} onChange={(event) => updateField('shift', event.target.value)}>
              <option value="">Not set</option>
              <option value="Matin">Matin</option>
              <option value="Après-midi">Après-midi</option>
              <option value="Soir">Soir</option>
            </select>
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Main teacher
            <select className="mt-2 h-11 w-full rounded-md border border-ocean/10 bg-white px-3 outline-none focus:border-ocean" value={form.teacherId} onChange={(event) => updateField('teacherId', event.target.value)}>
              <option value="">No teacher assigned</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName} · {teacher.employeeNumber}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Description
            <textarea className="mt-2 min-h-24 w-full rounded-md border border-ocean/10 px-3 py-3 outline-none focus:border-ocean" placeholder="Notes internes sur cette classe" value={form.description ?? ''} onChange={(event) => updateField('description', event.target.value)} />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-ocean hover:bg-ink" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create class'}
          </Button>
        </div>
      </form>
    </div>
  );
};

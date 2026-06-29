import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import type { ParentFormPayload } from '../services/parents.service';

interface ParentFormModalProps {
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ParentFormPayload) => Promise<void>;
}

const initialForm: ParentFormPayload = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  password: ''
};

export const ParentFormModal = ({ isSubmitting, onClose, onSubmit }: ParentFormModalProps) => {
  const [form, setForm] = useState<ParentFormPayload>(initialForm);
  const [error, setError] = useState('');

  const updateField = (field: keyof ParentFormPayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await onSubmit({
        ...form,
        phone: form.phone || undefined,
        address: form.address || undefined,
        password: form.password || undefined
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save parent');
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-6">
      <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-[0_24px_80px_rgba(7,27,58,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Family contact</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">Add parent</h2>
          </div>
          <Button type="button" variant="ghost" className="h-10 w-10 p-0" onClick={onClose} aria-label="Close form">
            <X size={18} />
          </Button>
        </div>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            First name
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold">
            Last name
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold">
            Email
            <input type="email" className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" value={form.email} onChange={(event) => updateField('email', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold">
            Phone
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Address
            <input className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" value={form.address} onChange={(event) => updateField('address', event.target.value)} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Password
            <input type="password" className="mt-2 h-11 w-full rounded-md border border-ocean/10 px-3 outline-none focus:border-ocean" placeholder="Default: DemoPass123!" value={form.password} onChange={(event) => updateField('password', event.target.value)} />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-ocean hover:bg-ink" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create parent'}
          </Button>
        </div>
      </form>
    </div>
  );
};

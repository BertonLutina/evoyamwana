import type { PlanningDto, PlanningTargetDto, UserRole } from '@evoyamwana/shared';
import { CalendarDays, Clock, MapPin, Pencil, Plus, Trash2, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { LoadingRows } from '../components/LoadingRows';
import WeekCalendar, { type CalendarEvent } from '../components/WeekCalendar';
import { useAuth } from '../hooks/useAuth';
import { planningService } from '../services/planning.service';

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super administrateur',
  SCHOOL_ADMIN: 'Administrateur',
  DIRECTOR: 'Directeur',
  SECRETARY: 'Secrétaire',
  ACCOUNTANT: 'Comptable',
  TEACHER: 'Enseignant',
  CLASS_TUTOR: 'Titulaire de classe',
  PARENT: 'Parent',
  STUDENT: 'Élève',
  DISCIPLINE_OFFICER: 'Responsable discipline',
  LIBRARIAN: 'Bibliothécaire',
  NURSE: 'Infirmier(ère)',
  TRANSPORT_MANAGER: 'Responsable transport',
  CANTEEN_MANAGER: 'Responsable cantine'
};

const todayIso = new Date().toISOString().slice(0, 10);

interface PlanningFormState {
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  participantUserIds: string[];
}

const initialForm: PlanningFormState = {
  title: '',
  description: '',
  location: '',
  date: todayIso,
  startTime: '08:00',
  endTime: '09:00',
  participantUserIds: []
};

const toEvent = (planning: PlanningDto): CalendarEvent => ({
  id: planning.id,
  title: planning.title,
  subtitle: planning.location || undefined,
  date: new Date(planning.date),
  startMinutes: planning.startMinutes,
  endMinutes: planning.endMinutes,
  status: 'confirmed'
});

const minutesToTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const PlanningPage = () => {
  const { user } = useAuth();
  const [plannings, setPlannings] = useState<PlanningDto[]>([]);
  const [targets, setTargets] = useState<PlanningTargetDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<PlanningDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<PlanningDto | null>(null);
  const [form, setForm] = useState<PlanningFormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [list, targetList] = await Promise.all([planningService.list(), planningService.targets()]);
      setPlannings(list);
      setTargets(targetList);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le planning.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const events = useMemo(() => plannings.map(toEvent), [plannings]);

  const handleEventClick = (event: CalendarEvent) => {
    const planning = plannings.find((item) => item.id === event.id);
    if (planning) setSelected(planning);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setSelected(null);
    setIsFormOpen(true);
  };

  const openEdit = (planning: PlanningDto) => {
    setEditing(planning);
    setForm({
      title: planning.title,
      description: planning.description ?? '',
      location: planning.location ?? '',
      date: planning.date.slice(0, 10),
      startTime: minutesToTime(planning.startMinutes),
      endTime: minutesToTime(planning.endMinutes),
      participantUserIds: planning.participants.filter((item) => item.userId !== user?.id).map((item) => item.userId)
    });
    setSelected(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setForm(initialForm);
  };

  const toggleTarget = (targetId: string) => {
    setForm((current) => ({
      ...current,
      participantUserIds: current.participantUserIds.includes(targetId)
        ? current.participantUserIds.filter((id) => id !== targetId)
        : [...current.participantUserIds, targetId]
    }));
  };

  const save = async () => {
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        date: form.date,
        startMinutes: timeToMinutes(form.startTime),
        endMinutes: timeToMinutes(form.endTime),
        participantUserIds: form.participantUserIds
      };
      if (editing) {
        await planningService.update(editing.id, payload);
      } else {
        await planningService.create(payload);
      }
      closeForm();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer ce planning.');
    } finally {
      setIsSaving(false);
    }
  };

  const removePlanning = async (planning: PlanningDto) => {
    if (!window.confirm(`Supprimer « ${planning.title} » ?`)) return;
    setError('');
    try {
      await planningService.remove(planning.id);
      setSelected(null);
      await load();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Impossible de supprimer ce planning.');
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col justify-between gap-4 rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:flex-row sm:items-end sm:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Agenda</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-ink">Planning</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">
              Créez, modifiez et supprimez vos propres créneaux. Cliquez sur un créneau pour voir qui y participe.
            </p>
          </div>
          <Button type="button" className="gap-2 bg-ocean hover:bg-ink" onClick={openCreate}>
            <Plus size={18} />
            Nouveau planning
          </Button>
        </div>

        {error ? <p className="rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        {isLoading ? (
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <LoadingRows rows={6} />
          </article>
        ) : events.length ? (
          <WeekCalendar events={events} onEventClick={handleEventClick} focusDate={new Date()} />
        ) : (
          <EmptyState icon={CalendarDays} title="Aucun planning" description="Créez votre premier créneau avec le bouton « Nouveau planning »." />
        )}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-soft" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Créneau</p>
                <h3 className="mt-1 text-2xl font-bold text-ink">{selected.title}</h3>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="grid h-10 w-10 place-items-center rounded-md bg-sky text-ocean" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-ink/70">
              <p className="inline-flex items-center gap-2">
                <CalendarDays size={16} className="text-ocean" />
                {new Date(selected.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="inline-flex items-center gap-2">
                <Clock size={16} className="text-ocean" />
                {minutesToTime(selected.startMinutes)} – {minutesToTime(selected.endMinutes)}
              </p>
              {selected.location ? (
                <p className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-ocean" />
                  {selected.location}
                </p>
              ) : null}
            </div>

            {selected.description ? <p className="mt-4 text-sm leading-6 text-ink/70">{selected.description}</p> : null}

            <div className="mt-5 rounded-md border border-ocean/10 bg-sky/50 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-bold text-ocean">
                <Users size={16} />
                Participants ({selected.participants.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.participants.map((participant) => (
                  <span key={participant.id} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink shadow-sm">
                    {participant.user.fullName}
                    <span className="ml-1 font-semibold text-ink/45">· {roleLabels[participant.user.role]}</span>
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold text-ink/50">Créé par {selected.creator.fullName} · {roleLabels[selected.creator.role]}</p>
            </div>

            {selected.creatorId === user?.id ? (
              <div className="mt-5 flex justify-end gap-3">
                <Button type="button" variant="secondary" className="gap-2" onClick={() => void removePlanning(selected)}>
                  <Trash2 size={16} />
                  Supprimer
                </Button>
                <Button type="button" className="gap-2" onClick={() => openEdit(selected)}>
                  <Pencil size={16} />
                  Modifier
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-8" onClick={closeForm}>
          <div className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-soft" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Planning</p>
                <h3 className="mt-1 text-2xl font-bold text-ink">{editing ? 'Modifier le planning' : 'Nouveau planning'}</h3>
              </div>
              <button type="button" onClick={closeForm} className="grid h-10 w-10 place-items-center rounded-md bg-sky text-ocean" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <input
                className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean"
                placeholder="Titre du créneau"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
              <textarea
                className="min-h-24 rounded-md border border-ocean/10 px-3 py-3 text-sm font-semibold outline-none focus:border-ocean"
                placeholder="Description (optionnelle)"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
              <input
                className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean"
                placeholder="Lieu (optionnel)"
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="date"
                  className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                />
                <input
                  type="time"
                  className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean"
                  value={form.startTime}
                  onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
                />
                <input
                  type="time"
                  className="h-11 rounded-md border border-ocean/10 px-3 text-sm font-semibold outline-none focus:border-ocean"
                  value={form.endTime}
                  onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
                />
              </div>

              {targets.length ? (
                <div>
                  <p className="mb-2 text-sm font-bold text-ink">Destinataires (en plus de vous-même)</p>
                  <div className="max-h-52 overflow-y-auto rounded-md border border-ocean/10 p-2">
                    {targets.map((target) => (
                      <label key={target.id} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-sky">
                        <input
                          type="checkbox"
                          checked={form.participantUserIds.includes(target.id)}
                          onChange={() => toggleTarget(target.id)}
                        />
                        <span className="font-semibold text-ink">{target.fullName}</span>
                        <span className="text-xs font-semibold text-ink/45">{roleLabels[target.role]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="rounded-md bg-sky/60 px-3 py-2 text-xs font-semibold text-ocean">
                  Ce planning ne sera visible que par vous-même.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeForm}>Annuler</Button>
              <Button type="button" onClick={() => void save()} disabled={isSaving || !form.title.trim()}>
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

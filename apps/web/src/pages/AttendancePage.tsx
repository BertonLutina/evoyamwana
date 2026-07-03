import type { AttendanceStatus, ClassDto, StudentDto } from '@evoyamwana/shared';
import { CalendarCheck, Check, Clock, FileText, MinusCircle, Save, Search, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { LoadingRows } from '../components/LoadingRows';
import { OfflineSyncBanner } from '../components/OfflineSyncBanner';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { StatCard } from '../components/StatCard';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { attendanceService } from '../services/attendance.service';
import { classesService } from '../services/classes.service';
import { offlineAttendanceService } from '../services/offlineAttendance.service';

const statuses: Array<{ value: AttendanceStatus; label: string; className: string }> = [
  { value: 'PRESENT', label: 'Présent', className: 'bg-canopy text-white' },
  { value: 'ABSENT', label: 'Absent', className: 'bg-clay text-white' },
  { value: 'LATE', label: 'Retard', className: 'bg-ember text-white' },
  { value: 'EXCUSED', label: 'Excusé', className: 'bg-ocean text-white' }
];

const today = new Date().toISOString().slice(0, 10);

export const AttendancePage = () => {
  const isOnline = useNetworkStatus();
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState('');
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [message, setMessage] = useState('');
  const [isClassLoading, setIsClassLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(() => offlineAttendanceService.getPendingCount());

  useEffect(() => {
    setIsClassLoading(true);
    classesService
      .list({ academicYear: '2026', page: 1, pageSize: 100 })
      .then((data) => {
        setClasses(data.classes);
        setClassId((current) => current || data.classes[0]?.id || '');
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Impossible de charger les classes.');
      })
      .finally(() => setIsClassLoading(false));
  }, []);

  useEffect(() => {
    if (!classId) {
      setStudents([]);
      setRecords({});
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setMessage('');
    attendanceService
      .getClassAttendance(classId, date)
      .then((register) => {
        if (!isMounted) return;
        setStudents(register.students);
        const savedStatuses = new Map(register.attendance.map((item) => [item.studentId, item.status]));
        setRecords(Object.fromEntries(register.students.map((student) => [student.id, savedStatuses.get(student.id) ?? 'PRESENT'])));
        if ('fromOfflineCache' in register && register.fromOfflineCache) {
          setMessage('Connexion instable : registre chargé depuis le cache local.');
        }
      })
      .catch((error) => {
        if (isMounted) {
          setStudents([]);
          setRecords({});
          setMessage(error instanceof Error ? error.message : 'Impossible de charger le registre de la classe.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [classId, date]);

  const filteredStudents = useMemo(
    () => students.filter((student) => `${student.firstName} ${student.lastName} ${student.studentCode}`.toLowerCase().includes(search.toLowerCase())),
    [search, students]
  );

  const summary = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    Object.values(records).forEach((status) => {
      counts[status] += 1;
    });
    return counts;
  }, [records]);

  const markAll = (status: AttendanceStatus) => {
    setRecords((current) => ({
      ...current,
      ...Object.fromEntries(filteredStudents.map((student) => [student.id, status]))
    }));
  };

  const saveAttendance = async () => {
    if (!classId || !students.length) {
      setMessage('Chargez le registre d’une classe avant d’enregistrer les présences.');
      return;
    }
    setIsSaving(true);
    setMessage('');
    try {
      const result = await attendanceService.saveClassAttendanceResilient(
        classId,
        date,
        Object.entries(records).map(([studentId, status]) => ({ studentId, status }))
      );
      setPendingCount(result.pendingCount);
      setMessage(
        result.mode === 'online'
          ? 'Présences enregistrées et notifications envoyées aux parents en cas d’absence ou de retard.'
          : 'Connexion faible : registre gardé localement. Il sera synchronisé dès que le réseau revient.'
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Impossible d’enregistrer les présences.');
    } finally {
      setIsSaving(false);
    }
  };

  const syncPending = async () => {
    setIsSyncing(true);
    setMessage('');
    try {
      const result = await attendanceService.syncPendingAttendance();
      setPendingCount(result.pendingCount);
      setMessage(result.synced ? `${result.synced} registre(s) synchronisé(s) avec l’API.` : 'Aucun registre en attente.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Synchronisation impossible pour le moment.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Registre journalier</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink">Présences</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
              Sélectionnez une classe et une date pour charger la liste, marquer rapidement chaque élève, puis enregistrer les présences.
            </p>
          </div>
          <Button className="gap-2 bg-ocean hover:bg-ink" onClick={() => void saveAttendance()} disabled={isSaving}>
            <Save size={18} />
            {isSaving ? 'Enregistrement...' : 'Enregistrer les présences'}
          </Button>
        </div>

        <div className="mt-6">
          <OfflineSyncBanner isOnline={isOnline} pendingCount={pendingCount} isSyncing={isSyncing} onSync={() => void syncPending()} />
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Présents" value={String(summary.PRESENT)} icon={Check} tone="green" detail="Marqués aujourd'hui" />
          <StatCard label="Absents" value={String(summary.ABSENT)} icon={ShieldAlert} tone="clay" detail="Notifier les parents" />
          <StatCard label="Retards" value={String(summary.LATE)} icon={Clock} tone="orange" detail="À suivre" />
          <StatCard label="Excusés" value={String(summary.EXCUSED)} icon={MinusCircle} tone="blue" detail="Approuvés" />
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_1fr]">
            <select
              className="h-11 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold outline-none focus:border-ocean"
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              aria-label="Classe"
              disabled={isClassLoading}
            >
              <option value="">{isClassLoading ? 'Chargement des classes...' : 'Sélectionner une classe'}</option>
              {classes.map((classRecord) => (
                <option key={classRecord.id} value={classRecord.id}>
                  {classRecord.name} · {classRecord.level} · {classRecord.academicYear}
                </option>
              ))}
            </select>
            <input className="h-11 rounded-md border border-ocean/10 px-3 text-sm outline-none focus:border-ocean" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
              <Search size={18} className="text-ocean/55" />
              <input className="w-full bg-transparent text-sm outline-none" placeholder="Rechercher dans le registre" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button key={status.value} className={`rounded-md px-3 py-2 text-xs font-bold ${status.className}`} onClick={() => markAll(status.value)}>
                Tout marquer {status.label}
              </button>
            ))}
          </div>
        </section>

        {message ? <p className="mt-4 rounded-md bg-sky px-3 py-2 text-sm font-semibold text-ocean">{message}</p> : null}

        <section className="mt-6">
          {isLoading ? <LoadingRows rows={5} /> : filteredStudents.length ? (
            <ResponsiveTable
              data={filteredStudents}
              getRowKey={(student) => student.id}
              columns={[
                {
                  key: 'student',
                  header: 'Élève',
                  render: (student) => (
                    <div>
                      <p className="font-bold">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-ink/50">{student.studentCode}</p>
                    </div>
                  )
                },
                { key: 'class', header: 'Classe', render: (student) => student.class?.name ?? 'Non assignée' },
                {
                  key: 'status',
                  header: 'Statut',
                  render: (student) => (
                    <div className="flex flex-wrap gap-1">
                      {statuses.map((status) => (
                        <button
                          key={status.value}
                          className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition ${
                            records[student.id] === status.value ? status.className : 'bg-sky text-ocean hover:bg-ocean/10'
                          }`}
                          onClick={() => setRecords((current) => ({ ...current, [student.id]: status.value }))}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  )
                }
              ]}
            />
          ) : (
            <EmptyState icon={CalendarCheck} title="Aucun élève dans ce registre" description="Sélectionnez une classe avec des élèves actifs ou ajustez votre recherche." />
          )}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <h3 className="flex items-center gap-2 text-xl font-bold"><FileText className="text-ember" size={20} /> Historique des présences</h3>
            <p className="mt-3 text-sm leading-6 text-ink/60">L'historique est consultable par les administrateurs, les enseignants assignés et les parents pour leurs enfants.</p>
          </article>
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <h3 className="flex items-center gap-2 text-xl font-bold"><CalendarCheck className="text-ocean" size={20} /> Rapports journaliers</h3>
            <p className="mt-3 text-sm leading-6 text-ink/60">Les administrateurs peuvent consulter les totaux journaliers de présence par date.</p>
          </article>
        </section>
      </div>
    </div>
  );
};

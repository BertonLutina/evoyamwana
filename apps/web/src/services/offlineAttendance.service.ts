import type { ClassAttendanceDto } from '@evoyamwana/shared';
import type { AttendanceRecordPayload } from './attendance.service';

const QUEUE_KEY = 'evoyamwana.offline.attendance.queue.v1';
const CACHE_PREFIX = 'evoyamwana.offline.attendance.register';

export interface OfflineAttendanceSave {
  id: string;
  classId: string;
  date: string;
  records: AttendanceRecordPayload[];
  createdAt: string;
}

export type CachedClassAttendance = ClassAttendanceDto & {
  fromOfflineCache?: boolean;
  cachedAt?: string;
};

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const readJson = <T>(key: string, fallback: T): T => {
  if (!canUseStorage()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const registerCacheKey = (classId: string, date: string) => `${CACHE_PREFIX}.${classId}.${date}`;

export const offlineAttendanceService = {
  getPending() {
    return readJson<OfflineAttendanceSave[]>(QUEUE_KEY, []);
  },

  getPendingCount() {
    return this.getPending().length;
  },

  queueSave(classId: string, date: string, records: AttendanceRecordPayload[]) {
    const current = this.getPending();
    const item: OfflineAttendanceSave = {
      id: `${classId}-${date}-${Date.now()}`,
      classId,
      date,
      records,
      createdAt: new Date().toISOString()
    };
    const next = [...current.filter((entry) => !(entry.classId === classId && entry.date === date)), item];
    writeJson(QUEUE_KEY, next);
    return item;
  },

  remove(id: string) {
    writeJson(QUEUE_KEY, this.getPending().filter((entry) => entry.id !== id));
  },

  cacheRegister(classId: string, date: string, register: ClassAttendanceDto) {
    writeJson(registerCacheKey(classId, date), {
      ...register,
      cachedAt: new Date().toISOString()
    });
  },

  getCachedRegister(classId: string, date: string): CachedClassAttendance | null {
    const cached = readJson<CachedClassAttendance | null>(registerCacheKey(classId, date), null);
    return cached ? { ...cached, fromOfflineCache: true } : null;
  }
};

import { API_ROUTES, type ApiSuccessResponse, type AttendanceDto, type AttendanceStatus, type ClassAttendanceDto, type StudentDto } from '@evoyamwana/shared';
import { apiClient } from './api';
import { offlineAttendanceService, type OfflineAttendanceSave } from './offlineAttendance.service';

export interface AttendanceRecordPayload {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export const attendanceService = {
  async getClassAttendance(classId: string, date: string) {
    try {
      const response = await apiClient<ApiSuccessResponse<{ register: ClassAttendanceDto }>>(`${API_ROUTES.attendance}/class/${classId}?date=${date}`);
      offlineAttendanceService.cacheRegister(classId, date, response.data.register);
      return response.data.register;
    } catch (error) {
      const cached = offlineAttendanceService.getCachedRegister(classId, date);
      if (cached) return cached;
      throw error;
    }
  },

  async saveClassAttendance(classId: string, date: string, records: AttendanceRecordPayload[]) {
    const response = await apiClient<ApiSuccessResponse<{ attendance: AttendanceDto[] }>>(API_ROUTES.attendance, {
      method: 'POST',
      body: JSON.stringify({ classId, date, records })
    });
    return response.data.attendance;
  },

  async saveClassAttendanceResilient(classId: string, date: string, records: AttendanceRecordPayload[]) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineAttendanceService.queueSave(classId, date, records);
      return { mode: 'queued' as const, pendingCount: offlineAttendanceService.getPendingCount() };
    }

    try {
      const attendance = await this.saveClassAttendance(classId, date, records);
      return { mode: 'online' as const, attendance, pendingCount: offlineAttendanceService.getPendingCount() };
    } catch (error) {
      offlineAttendanceService.queueSave(classId, date, records);
      return {
        mode: 'queued' as const,
        pendingCount: offlineAttendanceService.getPendingCount(),
        error: error instanceof Error ? error.message : 'Network unavailable'
      };
    }
  },

  async syncPendingAttendance(onSynced?: (entry: OfflineAttendanceSave) => void) {
    const pending = offlineAttendanceService.getPending();
    let synced = 0;

    for (const entry of pending) {
      await this.saveClassAttendance(entry.classId, entry.date, entry.records);
      offlineAttendanceService.remove(entry.id);
      synced += 1;
      onSynced?.(entry);
    }

    return { synced, pendingCount: offlineAttendanceService.getPendingCount() };
  },

  async getDailyReport(date: string) {
    const response = await apiClient<ApiSuccessResponse<{ report: Record<AttendanceStatus | 'total', number> }>>(
      `${API_ROUTES.attendance}/reports/daily?date=${date}`
    );
    return response.data.report;
  },

  async getStudentAttendance(studentId: string) {
    const response = await apiClient<ApiSuccessResponse<{ attendance: AttendanceDto[] }>>(`${API_ROUTES.attendance}/student/${studentId}`);
    return response.data.attendance;
  },

  async getMyAttendance() {
    const response = await apiClient<ApiSuccessResponse<{ student: StudentDto; attendance: AttendanceDto[] }>>(`${API_ROUTES.attendance}/me`);
    return response.data;
  }
};

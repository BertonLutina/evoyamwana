import type { ApiSuccessResponse, AttendanceDto, AttendanceStatus, ClassAttendanceDto } from '@evoyamwana/shared';
import { api } from './client';

export interface AttendanceRecordPayload {
  studentId: string;
  status: AttendanceStatus;
}

export const attendanceApi = {
  async classRegister(classId: string, date: string) {
    const response = await api.get<ApiSuccessResponse<{ register: ClassAttendanceDto }>>(`/attendance/class/${classId}`, {
      params: { date }
    });
    return response.data.data.register;
  },

  async save(classId: string, date: string, records: AttendanceRecordPayload[]) {
    const response = await api.post<ApiSuccessResponse<{ attendance: AttendanceDto[] }>>('/attendance', {
      classId,
      date,
      records
    });
    return response.data.data.attendance;
  },

  async studentHistory(studentId: string) {
    const response = await api.get<ApiSuccessResponse<{ attendance: AttendanceDto[] }>>(`/attendance/student/${studentId}`);
    return response.data.data.attendance;
  }
};

import { API_ROUTES, type ApiSuccessResponse, type ClassDto, type TeacherDto } from '@evoyamwana/shared';
import { apiClient } from './api';

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SubjectDto {
  id: string;
  name: string;
  code: string;
  coefficient: string;
  description?: string | null;
  class?: ClassDto | null;
  teacher?: TeacherDto | null;
}

export interface SchoolYearDto {
  id: string;
  name: string;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  terms?: TermDto[];
}

export interface TermDto {
  id: string;
  schoolYearId: string;
  name: string;
  startsAt?: string | null;
  endsAt?: string | null;
  order: number;
  isActive: boolean;
}

export interface TimetableEntryDto {
  id: string;
  dayOfWeek: number;
  startsAt: string;
  endsAt: string;
  room?: string | null;
  term?: string | null;
  notes?: string | null;
  class?: ClassDto | null;
  subject?: SubjectDto | null;
  teacher?: TeacherDto | null;
}

export interface AssignmentDto {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  maxScore: string;
  term: string;
  attachmentUrl?: string | null;
  class?: ClassDto | null;
  subject?: SubjectDto | null;
  teacher?: TeacherDto | null;
  _count?: { submissions: number; grades: number };
}

export interface FeeDto {
  id: string;
  name: string;
  amount: string;
  billingCycle: 'TRIMESTER' | 'ANNUAL' | 'MONTHLY' | 'ONE_TIME';
  category?: string | null;
  term?: string | null;
  dueDate?: string | null;
  description?: string | null;
  class?: ClassDto | null;
  _count?: { payments: number };
}

type Query = Record<string, string | number | undefined>;

const buildQuery = (params: Query = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : '';
};

const list = async <T>(path: string, key: string, params: Query = {}) => {
  const response = await apiClient<ApiSuccessResponse<Record<string, T[]> & { pagination: Pagination }>>(`${path}${buildQuery(params)}`);
  return { items: response.data[key] as T[], pagination: response.data.pagination };
};

export const academicService = {
  subjects: (params?: Query) => list<SubjectDto>(API_ROUTES.subjects, 'subjects', params),
  createSubject: async (payload: Record<string, unknown>) => (await apiClient<ApiSuccessResponse<{ subject: SubjectDto }>>(API_ROUTES.subjects, { method: 'POST', body: JSON.stringify(payload) })).data.subject,
  schoolYears: (params?: Query) => list<SchoolYearDto>(API_ROUTES.schoolYears, 'schoolYears', params),
  createSchoolYear: async (payload: Record<string, unknown>) => (await apiClient<ApiSuccessResponse<{ schoolYear: SchoolYearDto }>>(API_ROUTES.schoolYears, { method: 'POST', body: JSON.stringify(payload) })).data.schoolYear,
  createTerm: async (payload: Record<string, unknown>) => (await apiClient<ApiSuccessResponse<{ term: TermDto }>>(`${API_ROUTES.schoolYears}/terms`, { method: 'POST', body: JSON.stringify(payload) })).data.term,
  timetable: (params?: Query) => list<TimetableEntryDto>(API_ROUTES.timetable, 'entries', params),
  createTimetableEntry: async (payload: Record<string, unknown>) => (await apiClient<ApiSuccessResponse<{ entry: TimetableEntryDto }>>(API_ROUTES.timetable, { method: 'POST', body: JSON.stringify(payload) })).data.entry,
  assignments: (params?: Query) => list<AssignmentDto>(API_ROUTES.assignments, 'assignments', params),
  createAssignment: async (payload: Record<string, unknown>) => (await apiClient<ApiSuccessResponse<{ assignment: AssignmentDto }>>(API_ROUTES.assignments, { method: 'POST', body: JSON.stringify(payload) })).data.assignment,
  fees: (params?: Query) => list<FeeDto>(API_ROUTES.fees, 'fees', params),
  createFee: async (payload: Record<string, unknown>) => (await apiClient<ApiSuccessResponse<{ fee: FeeDto }>>(API_ROUTES.fees, { method: 'POST', body: JSON.stringify(payload) })).data.fee
};

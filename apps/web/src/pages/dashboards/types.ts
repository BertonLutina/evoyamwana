import type { AuthUser, DashboardSummaryDto } from '@evoyamwana/shared';
import type { NavigateFunction } from 'react-router-dom';
import type { CalendarEvent } from '../../components/WeekCalendar';

export interface DashboardPageProps {
  user: AuthUser;
  summary: DashboardSummaryDto;
  isLoading: boolean;
  error: string;
  navigate: NavigateFunction;
  planningEvents: CalendarEvent[];
}

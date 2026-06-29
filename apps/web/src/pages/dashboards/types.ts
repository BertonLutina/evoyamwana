import type { AuthUser, DashboardSummaryDto } from '@evoyamwana/shared';
import type { NavigateFunction } from 'react-router-dom';

export interface DashboardPageProps {
  user: AuthUser;
  summary: DashboardSummaryDto;
  isLoading: boolean;
  error: string;
  navigate: NavigateFunction;
}

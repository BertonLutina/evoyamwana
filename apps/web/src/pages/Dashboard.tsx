import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DashboardSummaryDto } from '@evoyamwana/shared';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboard.service';
import { DirectorDashboard } from './dashboards/DirectorDashboard';
import { ParentDashboard } from './dashboards/ParentDashboard';
import { SchoolAdminDashboard } from './dashboards/SchoolAdminDashboard';
import { StudentDashboard } from './dashboards/StudentDashboard';
import { StaffDashboard } from './dashboards/StaffDashboard';
import { SuperAdminDashboard } from './dashboards/SuperAdminDashboard';
import { TeacherDashboard } from './dashboards/TeacherDashboard';

const today = new Date().toISOString().slice(0, 10);

const emptySummary: DashboardSummaryDto = {
  totals: { students: 0, teachers: 0, classes: 0, attendanceToday: 0, pendingPayments: 0, notifications: 0 },
  attendance: { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0, rate: 0 },
  pendingPayments: [],
  recentNotifications: [],
  collaboratorDossiers: []
};

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummaryDto>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');
    dashboardService
      .getSummary(today)
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch((summaryError) => {
        if (isMounted) setError(summaryError instanceof Error ? summaryError.message : 'Unable to load dashboard data');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!user) return null;

  const props = { user, summary, isLoading, error, navigate };

  switch (user.role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard {...props} />;
    case 'TEACHER':
      return <TeacherDashboard {...props} />;
    case 'DIRECTOR':
      return <DirectorDashboard {...props} />;
    case 'PARENT':
      return <ParentDashboard {...props} />;
    case 'STUDENT':
      return <StudentDashboard {...props} />;
    case 'SECRETARY':
    case 'ACCOUNTANT':
    case 'CLASS_TUTOR':
    case 'DISCIPLINE_OFFICER':
    case 'LIBRARIAN':
    case 'NURSE':
    case 'TRANSPORT_MANAGER':
    case 'CANTEEN_MANAGER':
      return <StaffDashboard {...props} />;
    case 'SCHOOL_ADMIN':
    default:
      return <SchoolAdminDashboard {...props} />;
  }
};

import type { UserRole } from '@evoyamwana/shared';
import { useAuth } from '../../hooks/useAuth';
import { RoleWorkspacePage } from './RoleWorkspacePage';

type WorkspaceKey = 'students' | 'teachers' | 'parents' | 'classes' | 'attendance' | 'grades' | 'payments' | 'messages' | 'settings';

interface RoleAwarePageProps {
  workspace: WorkspaceKey;
  admin?: JSX.Element;
  superAdmin?: JSX.Element;
  director?: JSX.Element;
  secretary?: JSX.Element;
  accountant?: JSX.Element;
  teacher?: JSX.Element;
  classTutor?: JSX.Element;
  parent?: JSX.Element;
  student?: JSX.Element;
  discipline?: JSX.Element;
  librarian?: JSX.Element;
  nurse?: JSX.Element;
  transport?: JSX.Element;
  canteen?: JSX.Element;
}

export const RoleAwarePage = ({ workspace, admin, superAdmin, director, secretary, accountant, teacher, classTutor, parent, student, discipline, librarian, nurse, transport, canteen }: RoleAwarePageProps) => {
  const { user } = useAuth();
  const role = user?.role;
  const explicit: Partial<Record<UserRole, JSX.Element | undefined>> = {
    SUPER_ADMIN: superAdmin,
    SCHOOL_ADMIN: admin,
    DIRECTOR: director,
    SECRETARY: secretary,
    ACCOUNTANT: accountant,
    TEACHER: teacher,
    CLASS_TUTOR: classTutor,
    PARENT: parent,
    STUDENT: student,
    DISCIPLINE_OFFICER: discipline,
    LIBRARIAN: librarian,
    NURSE: nurse,
    TRANSPORT_MANAGER: transport,
    CANTEEN_MANAGER: canteen
  };

  if (role && explicit[role]) {
    return explicit[role];
  }

  return <RoleWorkspacePage workspace={workspace} />;
};

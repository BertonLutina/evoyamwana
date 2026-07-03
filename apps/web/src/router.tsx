import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Dashboard } from './pages/Dashboard';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AcademicModulePage } from './pages/AcademicModulePage';
import { ClassDetailsPage } from './pages/ClassDetailsPage';
import { AttendancePage } from './pages/AttendancePage';
import { ClassesPage } from './pages/ClassesPage';
import { GradesPage } from './pages/GradesPage';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { ParentsPage } from './pages/ParentsPage';
import { ParentProfilePage } from './pages/ParentProfilePage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { PlanningPage } from './pages/PlanningPage';
import { RegisterSchool } from './pages/RegisterSchool';
import { StaffUsersPage } from './pages/StaffUsersPage';
import { ChatRoomPage } from './pages/communication/ChatRoomPage';
import { MailboxPage } from './pages/communication/MailboxPage';
import { ParentAttendancePage } from './pages/parent/ParentAttendancePage';
import { ParentChildrenPage } from './pages/parent/ParentChildrenPage';
import { ParentGradesPage } from './pages/parent/ParentGradesPage';
import { ParentPaymentsPage } from './pages/parent/ParentPaymentsPage';
import { RoleAwarePage } from './pages/role-workspaces/RoleAwarePage';
import { DirectorSectorsPage } from './pages/director/DirectorSectorsPage';
import { DirectorSchoolHealthPage } from './pages/director/DirectorSchoolHealthPage';
import { DirectorReportsPage } from './pages/director/DirectorReportsPage';
import { DirectorPedagogyQualityPage } from './pages/director/DirectorPedagogyQualityPage';
import { DirectorOfficialExamsPage } from './pages/director/DirectorOfficialExamsPage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { StudentGradesPage } from './pages/student/StudentGradesPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentDetailsPage } from './pages/StudentDetailsPage';
import { StudentsPage } from './pages/StudentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { TeacherProfilePage } from './pages/TeacherProfilePage';
import { TeacherAttendancePage } from './pages/teacher/TeacherAttendancePage';
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';
import { TeacherGradesPage } from './pages/teacher/TeacherGradesPage';
import { TeacherProfileSelfPage } from './pages/teacher/TeacherProfilePage';
import { SuperAdminReportsPage } from './pages/super-admin/SuperAdminReportsPage';
import { SuperAdminSchoolsPage } from './pages/super-admin/SuperAdminSchoolsPage';
import { SuperAdminSettingsPage } from './pages/super-admin/SuperAdminSettingsPage';
import { SuperAdminAdminsPage, SuperAdminUsersPage } from './pages/super-admin/SuperAdminUsersPage';
import { AccountantPaymentsPage } from './pages/staff/AccountantPaymentsPage';
import { StaffAttendanceReviewPage } from './pages/staff/StaffAttendanceReviewPage';
import { StaffGradesReportPage } from './pages/staff/StaffGradesReportPage';
import { StaffClassesPage, StaffParentsPage, StaffStudentsPage, StaffTeachersPage } from './pages/staff/StaffRecordsPage';
import { ClassTutorParentsPage, StaffProfilePage, StaffUnavailablePage } from './pages/staff/StaffUtilityPages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register-school', element: <RegisterSchool /> }
    ]
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/planning', element: <PlanningPage /> },
      { path: '/staff-users', element: <RoleAwarePage workspace="settings" admin={<StaffUsersPage />} superAdmin={<StaffUsersPage />} secretary={<StaffUsersPage />} /> },
      { path: '/subjects', element: <AcademicModulePage kind="subjects" /> },
      { path: '/school-years', element: <AcademicModulePage kind="schoolYears" /> },
      { path: '/timetable', element: <AcademicModulePage kind="timetable" /> },
      { path: '/assignments', element: <AcademicModulePage kind="assignments" /> },
      { path: '/fees', element: <AcademicModulePage kind="fees" /> },
      { path: '/sectors', element: <RoleAwarePage workspace="settings" director={<DirectorSectorsPage />} admin={<PlaceholderPage title="Secteurs & dossiers" description="Vue direction réservée au pilotage des secteurs." />} /> },
      { path: '/school-health', element: <RoleAwarePage workspace="settings" director={<DirectorSchoolHealthPage />} admin={<PlaceholderPage title="Santé de l’école" description="Vue direction réservée au pilotage santé de l’école." />} /> },
      { path: '/pedagogy-quality', element: <RoleAwarePage workspace="settings" director={<DirectorPedagogyQualityPage />} /> },
      { path: '/official-exams', element: <RoleAwarePage workspace="settings" director={<DirectorOfficialExamsPage />} /> },
      { path: '/infrastructure', element: <RoleAwarePage workspace="settings" director={<PlaceholderPage title="Infrastructures" description="Salles, bancs, eau, électricité, toilettes, sécurité, internet et équipements scolaires." />} /> },
      { path: '/risks', element: <RoleAwarePage workspace="settings" director={<PlaceholderPage title="Risques & urgences" description="Incidents critiques, sécurité, santé scolaire, discipline grave et actions urgentes de direction." />} /> },
      { path: '/reputation', element: <RoleAwarePage workspace="settings" director={<PlaceholderPage title="Réputation école" description="Satisfaction parents, résultats, incidents, reconnaissance locale et image publique de l’école." />} /> },
      { path: '/partners', element: <RoleAwarePage workspace="settings" director={<PlaceholderPage title="Partenaires & sponsors" description="Contrats sponsors, collaborations, montants et échéances seront gérés ici." />} /> },
      { path: '/ministry-compliance', element: <RoleAwarePage workspace="settings" director={<PlaceholderPage title="Conformité ministère" description="Agréments, inspections, PROVED, Sous-PROVED et documents officiels seront suivis ici." />} /> },
      { path: '/official-documents', element: <RoleAwarePage workspace="settings" director={<PlaceholderPage title="Documents officiels" description="Agréments, autorisations, attestations, rapports d’inspection et archives de direction." />} /> },
      { path: '/meetings', element: <RoleAwarePage workspace="settings" director={<PlaceholderPage title="Réunions & décisions" description="Conseils de direction, décisions prises, tâches assignées et suivi des responsabilités." />} /> },
      { path: '/reports', element: <RoleAwarePage workspace="settings" director={<DirectorReportsPage />} admin={<PlaceholderPage title="Rapports direction" description="Vue direction réservée aux synthèses de pilotage." />} /> },
      { path: '/students', element: <RoleAwarePage workspace="students" admin={<StudentsPage />} superAdmin={<SuperAdminUsersPage />} director={<StaffStudentsPage role="DIRECTOR" />} secretary={<StaffStudentsPage role="SECRETARY" />} accountant={<StaffUnavailablePage role="ACCOUNTANT" title="Élèves" description="Le comptable consulte les familles depuis l’espace paiements." />} classTutor={<StaffUnavailablePage role="CLASS_TUTOR" title="Élèves" description="Le titulaire consulte les élèves depuis sa classe et les présences." />} parent={<ParentChildrenPage />} discipline={<StaffStudentsPage role="DISCIPLINE_OFFICER" />} librarian={<StaffStudentsPage role="LIBRARIAN" />} nurse={<StaffStudentsPage role="NURSE" />} transport={<StaffStudentsPage role="TRANSPORT_MANAGER" />} canteen={<StaffStudentsPage role="CANTEEN_MANAGER" />} /> },
      { path: '/students/:id', element: <StudentDetailsPage /> },
      { path: '/teachers', element: <RoleAwarePage workspace="teachers" admin={<TeachersPage />} superAdmin={<SuperAdminAdminsPage />} director={<StaffTeachersPage role="DIRECTOR" />} secretary={<StaffTeachersPage role="SECRETARY" />} classTutor={<StaffUnavailablePage role="CLASS_TUTOR" title="Enseignants" description="Le titulaire utilise son espace pédagogique et son profil enseignant." />} /> },
      { path: '/teachers/:id', element: <TeacherProfilePage /> },
      { path: '/parents', element: <RoleAwarePage workspace="parents" admin={<ParentsPage />} director={<StaffParentsPage role="DIRECTOR" />} secretary={<StaffParentsPage role="SECRETARY" />} accountant={<StaffUnavailablePage role="ACCOUNTANT" title="Parents et familles" description="Les familles liées aux paiements apparaissent dans le suivi comptable." />} classTutor={<ClassTutorParentsPage />} transport={<StaffParentsPage role="TRANSPORT_MANAGER" />} /> },
      { path: '/parents/:id', element: <ParentProfilePage /> },
      { path: '/classes', element: <RoleAwarePage workspace="classes" admin={<ClassesPage />} superAdmin={<SuperAdminSchoolsPage />} director={<StaffClassesPage role="DIRECTOR" />} secretary={<StaffClassesPage role="SECRETARY" />} teacher={<TeacherClassesPage />} classTutor={<TeacherClassesPage />} student={<StudentCoursesPage />} /> },
      { path: '/classes/:id', element: <ClassDetailsPage /> },
      { path: '/attendance', element: <RoleAwarePage workspace="attendance" admin={<AttendancePage />} director={<AttendancePage />} secretary={<StaffUnavailablePage role="SECRETARY" title="Présences" description="Le secrétariat consulte les classes et dossiers élèves; l’appel reste réservé aux rôles autorisés." />} teacher={<TeacherAttendancePage />} classTutor={<TeacherAttendancePage />} parent={<ParentAttendancePage />} student={<StudentAttendancePage />} discipline={<AttendancePage />} nurse={<StaffAttendanceReviewPage role="NURSE" />} /> },
      { path: '/grades', element: <RoleAwarePage workspace="grades" admin={<GradesPage />} superAdmin={<SuperAdminReportsPage />} director={<StaffGradesReportPage role="DIRECTOR" />} secretary={<StaffGradesReportPage role="SECRETARY" />} teacher={<TeacherGradesPage />} classTutor={<TeacherGradesPage />} parent={<ParentGradesPage />} student={<StudentGradesPage />} discipline={<StaffGradesReportPage role="DISCIPLINE_OFFICER" />} /> },
      {
        path: '/payments',
        element: (
          <RoleAwarePage
            workspace="payments"
            admin={<AccountantPaymentsPage />}
            director={<AccountantPaymentsPage />}
            secretary={<StaffUnavailablePage role="SECRETARY" title="Paiements" description="La phase 1 secrétariat garde cette section séparée sans exposer un workflow comptable." />}
            accountant={<AccountantPaymentsPage />}
            parent={<ParentPaymentsPage />}
            canteen={<AccountantPaymentsPage readOnly title="Paiements cantine" eyebrow="Cantine" />}
            classTutor={<StaffUnavailablePage role="CLASS_TUTOR" title="Paiements" description="Les paiements ne font pas partie de l’espace titulaire." />}
          />
        )
      },
      { path: '/messages', element: <Navigate to="/chatroom" replace /> },
      { path: '/chatroom', element: <ChatRoomPage /> },
      { path: '/mailbox', element: <MailboxPage /> },
      {
        path: '/settings',
        element: (
          <RoleAwarePage
            workspace="settings"
            admin={<AdminSettingsPage />}
            superAdmin={<SuperAdminSettingsPage />}
            director={<StaffProfilePage role="DIRECTOR" />}
            secretary={<StaffProfilePage role="SECRETARY" />}
            accountant={<StaffProfilePage role="ACCOUNTANT" />}
            teacher={<TeacherProfileSelfPage />}
            classTutor={<TeacherProfileSelfPage />}
            student={<StudentProfilePage />}
            discipline={<StaffProfilePage role="DISCIPLINE_OFFICER" />}
            librarian={<StaffProfilePage role="LIBRARIAN" />}
            nurse={<StaffProfilePage role="NURSE" />}
            transport={<StaffProfilePage role="TRANSPORT_MANAGER" />}
            canteen={<StaffProfilePage role="CANTEEN_MANAGER" />}
          />
        )
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

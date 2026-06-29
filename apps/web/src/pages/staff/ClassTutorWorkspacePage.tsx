import { TeacherAttendancePage } from '../teacher/TeacherAttendancePage';
import { TeacherClassesPage } from '../teacher/TeacherClassesPage';
import { TeacherGradesPage } from '../teacher/TeacherGradesPage';
import { TeacherMessagesPage } from '../teacher/TeacherMessagesPage';
import { TeacherProfileSelfPage } from '../teacher/TeacherProfilePage';

export const ClassTutorClassesPage = () => <TeacherClassesPage />;
export const ClassTutorAttendancePage = () => <TeacherAttendancePage />;
export const ClassTutorGradesPage = () => <TeacherGradesPage />;
export const ClassTutorMessagesPage = () => <TeacherMessagesPage />;
export const ClassTutorProfilePage = () => <TeacherProfileSelfPage />;

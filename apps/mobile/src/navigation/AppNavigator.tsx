import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import type { UserRole } from '@evoyamwana/shared';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterSchoolScreen } from '../screens/RegisterSchoolScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { StudentsScreen } from '../screens/StudentsScreen';
import { ClassesScreen } from '../screens/ClassesScreen';
import { ParentsScreen } from '../screens/ParentsScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';
import { RoleWorkspaceScreen } from '../screens/RoleWorkspaceScreen';
import { SimpleModuleScreen } from '../screens/SimpleModuleScreen';
import { StaffScreen } from '../screens/StaffScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { colors } from '../theme';
import type { AppTabParamList, AuthStackParamList } from '../types/navigation';

type TabName = keyof AppTabParamList;

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tabs = createBottomTabNavigator<AppTabParamList>();

const roleScreens: Record<UserRole, TabName[]> = {
  SUPER_ADMIN: ['Dashboard', 'Students', 'Grades', 'Messages', 'Profile'],
  SCHOOL_ADMIN: ['Dashboard', 'Students', 'Classes', 'Parents', 'Attendance', 'Grades', 'Payments', 'Messages', 'Profile'],
  DIRECTOR: ['Dashboard', 'Workspace', 'Students', 'Classes', 'Parents', 'Staff', 'Attendance', 'Grades', 'Payments', 'Messages', 'Profile'],
  SECRETARY: ['Dashboard', 'Workspace', 'Students', 'Classes', 'Parents', 'Staff', 'Payments', 'Messages', 'Profile'],
  ACCOUNTANT: ['Dashboard', 'Workspace', 'Payments', 'Messages', 'Profile'],
  TEACHER: ['Dashboard', 'Students', 'Attendance', 'Grades', 'Messages', 'Profile'],
  CLASS_TUTOR: ['Dashboard', 'Workspace', 'Students', 'Classes', 'Attendance', 'Grades', 'Messages', 'Profile'],
  PARENT: ['Dashboard', 'Students', 'Attendance', 'Payments', 'Messages', 'Profile'],
  STUDENT: ['Dashboard', 'Attendance', 'Grades', 'Messages', 'Profile'],
  DISCIPLINE_OFFICER: ['Dashboard', 'Students', 'Attendance', 'Grades', 'Messages', 'Profile'],
  LIBRARIAN: ['Dashboard', 'Students', 'Messages', 'Profile'],
  NURSE: ['Dashboard', 'Students', 'Attendance', 'Messages', 'Profile'],
  TRANSPORT_MANAGER: ['Dashboard', 'Students', 'Parents', 'Messages', 'Profile'],
  CANTEEN_MANAGER: ['Dashboard', 'Students', 'Payments', 'Messages', 'Profile']
} as const;

const iconMap: Record<keyof AppTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid-outline',
  Workspace: 'briefcase-outline',
  Students: 'school-outline',
  Classes: 'business-outline',
  Parents: 'people-outline',
  Staff: 'id-card-outline',
  Attendance: 'checkbox-outline',
  Grades: 'reader-outline',
  Payments: 'card-outline',
  Messages: 'chatbubbles-outline',
  Profile: 'person-circle-outline'
};

const gradePlaceholders: Partial<Record<UserRole, { description: string; apiNote: string }>> = {
  DISCIPLINE_OFFICER: {
    description: 'Suivi des notes de conduite, retards et incidents liés aux élèves.',
    apiNote: 'Prêt pour les workflows disciplinaires mobiles.'
  }
};

const messagePlaceholders: Partial<Record<UserRole, { description: string; apiNote: string }>> = {
  DISCIPLINE_OFFICER: {
    description: 'Alertes disciplinaires, convocations et échanges avec les familles.',
    apiNote: 'Prêt pour les APIs de suivi disciplinaire.'
  },
  LIBRARIAN: {
    description: 'Rappels de prêts, retours attendus et annonces de la bibliothèque.',
    apiNote: 'Prêt pour les APIs bibliothèque.'
  },
  NURSE: {
    description: 'Notifications santé, passages à l’infirmerie et contacts responsables.',
    apiNote: 'Prêt pour les APIs santé scolaire.'
  },
  TRANSPORT_MANAGER: {
    description: 'Messages de trajet, points de ramassage et information aux parents.',
    apiNote: 'Prêt pour les APIs transport.'
  },
  CANTEEN_MANAGER: {
    description: 'Menus, soldes de cantine et annonces aux familles.',
    apiNote: 'Prêt pour les APIs cantine.'
  }
};

const defaultGradePlaceholder = {
  description: 'Notes par trimestre et aperçu des performances.',
  apiNote: 'Connecté à la même API partagée.'
};

const defaultMessagePlaceholder = {
  description: 'Annonces de l’école et conversations avec les parents.',
  apiNote: 'Prêt pour les APIs messages.'
};

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="RegisterSchool" component={RegisterSchoolScreen} />
  </AuthStack.Navigator>
);

const AppTabs = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const role = user?.role && roleScreens[user.role] ? user.role : 'SCHOOL_ADMIN';
  const visible = roleScreens[role];
  const gradePlaceholder = gradePlaceholders[role] ?? defaultGradePlaceholder;
  const messagePlaceholder = messagePlaceholders[role] ?? defaultMessagePlaceholder;

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: '#7b8794',
        tabBarStyle: {
          borderTopColor: colors.line,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarIcon: ({ color, size }) => <Ionicons name={iconMap[route.name]} size={size} color={color} />
      })}
    >
      {visible.includes('Dashboard') ? <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('nav.dashboard') }} /> : null}
      {visible.includes('Workspace') ? <Tabs.Screen name="Workspace" component={RoleWorkspaceScreen} options={{ title: 'Workspace' }} /> : null}
      {visible.includes('Students') ? <Tabs.Screen name="Students" component={StudentsScreen} options={{ title: t('nav.students') }} /> : null}
      {visible.includes('Classes') ? <Tabs.Screen name="Classes" component={ClassesScreen} options={{ title: t('nav.classes') }} /> : null}
      {visible.includes('Parents') ? <Tabs.Screen name="Parents" component={ParentsScreen} options={{ title: t('nav.parents') }} /> : null}
      {visible.includes('Staff') ? <Tabs.Screen name="Staff" component={StaffScreen} options={{ title: 'Staff' }} /> : null}
      {visible.includes('Attendance') ? <Tabs.Screen name="Attendance" component={AttendanceScreen} options={{ title: t('nav.attendance') }} /> : null}
      {visible.includes('Grades') ? (
        <Tabs.Screen name="Grades" options={{ title: t('nav.grades') }}>
          {() => <SimpleModuleScreen title={t('nav.grades')} description={gradePlaceholder.description} apiNote={gradePlaceholder.apiNote} />}
        </Tabs.Screen>
      ) : null}
      {visible.includes('Payments') ? (
        <Tabs.Screen name="Payments" component={PaymentsScreen} options={{ title: t('nav.payments') }} />
      ) : null}
      {visible.includes('Messages') ? (
        <Tabs.Screen name="Messages" options={{ title: t('nav.messages') }}>
          {() => <SimpleModuleScreen title={t('nav.messages')} description={messagePlaceholder.description} apiNote={messagePlaceholder.apiNote} />}
        </Tabs.Screen>
      ) : null}
      {visible.includes('Profile') ? <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} /> : null}
    </Tabs.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sky }}>
        <ActivityIndicator color={colors.blue} />
      </View>
    );
  }

  return <NavigationContainer>{isAuthenticated ? <AppTabs /> : <AuthNavigator />}</NavigationContainer>;
};

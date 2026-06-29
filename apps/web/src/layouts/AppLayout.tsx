import {
  Bell,
  BookOpen,
  Building2,
  Bus,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  HeartPulse,
  Home,
  Library,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Settings,
  ShieldCheck,
  Scale,
  TrendingUp,
  Utensils,
  User,
  WalletCards,
  UsersRound,
  UserRoundCheck,
  X
} from 'lucide-react';
import type { UserRole } from '@evoyamwana/shared';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '../components/Button';
import { LanguageSelect } from '../components/LanguageSelect';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../hooks/useAuth';

type SidebarLink = {
  label: string;
  path: string;
  icon: typeof Home;
};

type SidebarSection = {
  title: string;
  links: SidebarLink[];
};

const roleHeaderTitles: Record<UserRole, string> = {
  SUPER_ADMIN: 'Pilotage plateforme',
  SCHOOL_ADMIN: 'Tableau de bord scolaire',
  DIRECTOR: 'Pilotage direction',
  SECRETARY: 'Accueil secrétariat',
  ACCOUNTANT: 'Tableau finances',
  TEACHER: 'Tableau enseignant',
  CLASS_TUTOR: 'Tableau titulaire',
  PARENT: 'Tableau parent',
  STUDENT: 'Espace élève',
  DISCIPLINE_OFFICER: 'Suivi discipline',
  LIBRARIAN: 'Espace bibliothèque',
  NURSE: 'Espace santé',
  TRANSPORT_MANAGER: 'Transport scolaire',
  CANTEEN_MANAGER: 'Gestion cantine'
};

const roleDisplayLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super admin',
  SCHOOL_ADMIN: 'Admin école',
  DIRECTOR: 'Direction',
  SECRETARY: 'Secrétariat',
  ACCOUNTANT: 'Comptabilité',
  TEACHER: 'Enseignant',
  CLASS_TUTOR: 'Titulaire',
  PARENT: 'Parent',
  STUDENT: 'Élève',
  DISCIPLINE_OFFICER: 'Discipline',
  LIBRARIAN: 'Bibliothèque',
  NURSE: 'Santé scolaire',
  TRANSPORT_MANAGER: 'Transport',
  CANTEEN_MANAGER: 'Cantine'
};

// const roleSearchPlaceholders: Record<UserRole, string> = {
//   SUPER_ADMIN: 'Rechercher écoles, utilisateurs, rapports',
//   SCHOOL_ADMIN: 'Rechercher élèves, enseignants, classes',
//   DIRECTOR: 'Rechercher élèves, classes, rapports',
//   SECRETARY: 'Rechercher élèves, parents, dossiers',
//   ACCOUNTANT: 'Rechercher paiements, familles, reçus',
//   TEACHER: 'Rechercher classes, élèves, parents',
//   CLASS_TUTOR: 'Rechercher ma classe, élèves, parents',
//   PARENT: 'Rechercher enfants, notes, messages',
//   STUDENT: 'Rechercher cours, notes, messages',
//   DISCIPLINE_OFFICER: 'Rechercher élèves, présences, rapports',
//   LIBRARIAN: 'Rechercher élèves, livres, emprunts',
//   NURSE: 'Rechercher élèves, santé, absences',
//   TRANSPORT_MANAGER: 'Rechercher élèves, parents, trajets',
//   CANTEEN_MANAGER: 'Rechercher élèves, repas, paiements'
// };

const roleNavigation: Record<UserRole, SidebarLink[]> = {
  SUPER_ADMIN: [
    { label: 'Vue plateforme', path: '/dashboard', icon: ShieldCheck },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Écoles', path: '/classes', icon: Building2 },
    { label: 'Personnel', path: '/staff-users', icon: UsersRound },
    { label: 'Administrateurs', path: '/teachers', icon: UserRoundCheck },
    { label: 'Utilisateurs', path: '/students', icon: UsersRound },
    { label: 'Rapports', path: '/grades', icon: FileText },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Paramètres', path: '/settings', icon: Settings }
  ],
  SCHOOL_ADMIN: [
    { label: 'Tableau de bord', path: '/dashboard', icon: Home },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Élèves', path: '/students', icon: GraduationCap },
    { label: 'Enseignants', path: '/teachers', icon: UserRoundCheck },
    { label: 'Parents', path: '/parents', icon: UsersRound },
    { label: 'Classes', path: '/classes', icon: BookOpen },
    { label: 'Matières', path: '/subjects', icon: BookOpen },
    { label: 'Années & trimestres', path: '/school-years', icon: CalendarDays },
    { label: 'Timetable', path: '/timetable', icon: CalendarCheck },
    { label: 'Devoirs', path: '/assignments', icon: ClipboardList },
    { label: 'Frais', path: '/fees', icon: CreditCard },
    { label: 'Personnel', path: '/staff-users', icon: UsersRound },
    { label: 'Présences', path: '/attendance', icon: CalendarCheck },
    { label: 'Notes', path: '/grades', icon: BookOpen },
    { label: 'Paiements', path: '/payments', icon: CreditCard },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Paramètres', path: '/settings', icon: Settings }
  ],
  DIRECTOR: [
    { label: 'Tableau direction', path: '/dashboard', icon: Home },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Santé école', path: '/school-health', icon: HeartPulse },
    { label: 'Secteurs & dossiers', path: '/sectors', icon: ClipboardList },
    { label: 'Performance élèves', path: '/grades', icon: TrendingUp },
    { label: 'Présences & discipline', path: '/attendance', icon: Scale },
    { label: 'Personnel & RH', path: '/teachers', icon: UserRoundCheck },
    { label: 'Finances & chiffres', path: '/payments', icon: WalletCards },
    { label: 'Inscriptions', path: '/students', icon: GraduationCap },
    { label: 'Classes', path: '/classes', icon: BookOpen },
    { label: 'Partenaires', path: '/partners', icon: Building2 },
    { label: 'Conformité ministère', path: '/ministry-compliance', icon: ShieldCheck },
    { label: 'Rapports', path: '/reports', icon: FileText },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil direction', path: '/settings', icon: User }
  ],
  SECRETARY: [
    { label: 'Accueil', path: '/dashboard', icon: Home },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Dossiers élèves', path: '/students', icon: GraduationCap },
    { label: 'Parents', path: '/parents', icon: UsersRound },
    { label: 'Classes', path: '/classes', icon: BookOpen },
    { label: 'Matières', path: '/subjects', icon: BookOpen },
    { label: 'Timetable', path: '/timetable', icon: CalendarCheck },
    { label: 'Devoirs', path: '/assignments', icon: ClipboardList },
    { label: 'Frais', path: '/fees', icon: CreditCard },
    { label: 'Personnel', path: '/staff-users', icon: UsersRound },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil', path: '/settings', icon: User }
  ],
  ACCOUNTANT: [
    { label: 'Tableau finances', path: '/dashboard', icon: Home },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Paiements', path: '/payments', icon: WalletCards },
    { label: 'Élèves', path: '/students', icon: GraduationCap },
    { label: 'Parents', path: '/parents', icon: UsersRound },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil', path: '/settings', icon: User }
  ],
  TEACHER: [
    { label: 'Tableau enseignant', path: '/dashboard', icon: Home },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Mes classes', path: '/classes', icon: BookOpen },
    { label: 'Timetable', path: '/timetable', icon: CalendarCheck },
    { label: 'Devoirs', path: '/assignments', icon: ClipboardList },
    { label: 'Présences', path: '/attendance', icon: CalendarCheck },
    { label: 'Notes à saisir', path: '/grades', icon: ClipboardList },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil', path: '/settings', icon: User }
  ],
  CLASS_TUTOR: [
    { label: 'Tableau titulaire', path: '/dashboard', icon: Home },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Ma classe', path: '/classes', icon: BookOpen },
    { label: 'Timetable', path: '/timetable', icon: CalendarCheck },
    { label: 'Devoirs', path: '/assignments', icon: ClipboardList },
    { label: 'Présences', path: '/attendance', icon: CalendarCheck },
    { label: 'Notes', path: '/grades', icon: ClipboardList },
    { label: 'Parents', path: '/parents', icon: UsersRound },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil', path: '/settings', icon: User }
  ],
  PARENT: [
    { label: 'Tableau parent', path: '/dashboard', icon: Home },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Mes enfants', path: '/students', icon: GraduationCap },
    { label: 'Timetable', path: '/timetable', icon: CalendarCheck },
    { label: 'Devoirs', path: '/assignments', icon: ClipboardList },
    { label: 'Présences', path: '/attendance', icon: CalendarCheck },
    { label: 'Notes', path: '/grades', icon: BookOpen },
    { label: 'Paiements', path: '/payments', icon: CreditCard },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil', path: '/settings', icon: User }
  ],
  STUDENT: [
    { label: 'Mon espace', path: '/dashboard', icon: Home },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Mes cours', path: '/classes', icon: BookOpen },
    { label: 'Timetable', path: '/timetable', icon: CalendarCheck },
    { label: 'Devoirs', path: '/assignments', icon: ClipboardList },
    { label: 'Mes notes', path: '/grades', icon: ClipboardList },
    { label: 'Mes présences', path: '/attendance', icon: CalendarCheck },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil', path: '/settings', icon: User }
  ],
  DISCIPLINE_OFFICER: [
    { label: 'Discipline', path: '/dashboard', icon: Scale },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Élèves', path: '/students', icon: GraduationCap },
    { label: 'Présences', path: '/attendance', icon: CalendarCheck },
    { label: 'Rapports', path: '/grades', icon: FileText },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil', path: '/settings', icon: User }
  ],
  LIBRARIAN: [
    { label: 'Bibliothèque', path: '/dashboard', icon: Library },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Élèves', path: '/students', icon: GraduationCap },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil', path: '/settings', icon: User }
  ],
  NURSE: [
    { label: 'Infirmerie', path: '/dashboard', icon: HeartPulse },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Élèves', path: '/students', icon: GraduationCap },
    { label: 'Présences', path: '/attendance', icon: CalendarCheck },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil', path: '/settings', icon: User }
  ],
  TRANSPORT_MANAGER: [
    { label: 'Transport', path: '/dashboard', icon: Bus },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Élèves', path: '/students', icon: GraduationCap },
    { label: 'Parents', path: '/parents', icon: UsersRound },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil', path: '/settings', icon: User }
  ],
  CANTEEN_MANAGER: [
    { label: 'Cantine', path: '/dashboard', icon: Utensils },
    { label: 'Planning', path: '/planning', icon: CalendarDays },
    { label: 'Élèves', path: '/students', icon: GraduationCap },
    { label: 'Paiements', path: '/payments', icon: CreditCard },
    { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
    { label: 'Mailbox', path: '/mailbox', icon: Mail },
    { label: 'Profil', path: '/settings', icon: User }
  ]
};

const directorNavigationSections: SidebarSection[] = [
  {
    title: 'Pilotage',
    links: [
      { label: 'Tableau direction', path: '/dashboard', icon: Home },
      { label: 'Planning', path: '/planning', icon: CalendarDays },
      { label: "Santé de l'école", path: '/school-health', icon: HeartPulse },
      { label: 'Secteurs & dossiers', path: '/sectors', icon: ClipboardList },
      { label: 'Rapports', path: '/reports', icon: FileText }
    ]
  },
  {
    title: 'Académique',
    links: [
      { label: 'Performance élèves', path: '/grades', icon: TrendingUp },
      { label: 'Qualité pédagogique', path: '/pedagogy-quality', icon: BookOpen },
      { label: 'Examens officiels', path: '/official-exams', icon: GraduationCap },
      { label: 'Matières', path: '/subjects', icon: BookOpen },
      { label: 'Années & trimestres', path: '/school-years', icon: CalendarDays },
      { label: 'Timetable', path: '/timetable', icon: CalendarCheck },
      { label: 'Devoirs', path: '/assignments', icon: ClipboardList },
      { label: 'Inscriptions', path: '/students', icon: UsersRound }
    ]
  },
  {
    title: 'Vie scolaire',
    links: [
      { label: 'Présences & discipline', path: '/attendance', icon: Scale },
      { label: 'Personnel & RH', path: '/teachers', icon: UserRoundCheck },
      { label: 'Infrastructures', path: '/infrastructure', icon: Building2 },
      { label: 'Risques & urgences', path: '/risks', icon: ShieldCheck }
    ]
  },
  {
    title: 'Institution',
    links: [
      { label: 'Finances & chiffres', path: '/payments', icon: WalletCards },
      { label: 'Réputation école', path: '/reputation', icon: TrendingUp },
      { label: 'Partenaires & sponsors', path: '/partners', icon: Building2 },
      { label: 'Conformité ministère', path: '/ministry-compliance', icon: ShieldCheck },
      { label: 'Documents officiels', path: '/official-documents', icon: FileText }
    ]
  },
  {
    title: 'Communication',
    links: [
      { label: 'Réunions & décisions', path: '/meetings', icon: ClipboardList },
      { label: 'ChatRoom', path: '/chatroom', icon: MessageCircle },
      { label: 'Mailbox', path: '/mailbox', icon: Mail },
      { label: 'Profil direction', path: '/settings', icon: User }
    ]
  }
];

const SidebarContent = ({ onNavigate, role }: { onNavigate?: () => void; role: UserRole }) => {
  const { t } = useLocale();
  const links = roleNavigation[role];
  const [openSections, setOpenSections] = useState(() => new Set(directorNavigationSections.map((section) => section.title)));

  const toggleSection = (title: string) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col bg-[#075fc8] text-white">
      <div className="flex h-20 items-center gap-3 px-5">
        <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-lg bg-white shadow-sm">
          <img className="h-full w-full object-cover" src="/brand/evoyamwana-logo.png" alt="EVOYAMWANA logo" />
        </span>
        <div>
          <p className="font-display text-xl font-bold">EVOYAMWANA</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {role === 'DIRECTOR' ? (
          <div className="space-y-2">
            {directorNavigationSections.map((section) => {
              const isOpen = openSections.has(section.title);
              return (
                <div key={section.title} className="rounded-lg border border-white/10 bg-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.title)}
                    className="flex h-10 w-full items-center justify-between px-3 text-left text-[11px] font-black uppercase tracking-[0.18em] text-white/72 transition hover:text-white"
                    aria-expanded={isOpen}
                  >
                    <span>{section.title}</span>
                    <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen ? (
                    <div className="space-y-1 px-1.5 pb-2">
                      {section.links.map(({ label, path, icon: Icon }) => (
                        <NavLink
                          key={path}
                          to={path}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            `flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold leading-tight transition ${
                              isActive ? 'bg-white text-ocean shadow-sm' : 'text-white/78 hover:bg-white/10 hover:text-white'
                            }`
                          }
                        >
                          <Icon size={18} className="shrink-0" />
                          <span>{label}</span>
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          links.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                  isActive ? 'bg-white text-ocean shadow-sm' : 'text-white/78 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))
        )}
      </nav>

      <div className="m-4 rounded-lg border border-white/15 bg-white/10 p-4">
        <p className="text-sm font-bold">{t('layout.termHealth')}</p>
        <p className="mt-2 text-xs leading-5 text-white/70">{t('layout.termHealthDetail')}</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-4/5 rounded-full bg-sun" />
        </div>
      </div>
    </div>
  );
};

export const AppLayout = () => {
  const navigate = useNavigate();
  const { logout, token, user } = useAuth();
  const { t } = useLocale();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;
  const headerTitle = user.schoolName || roleHeaderTitles[role];
  // const searchPlaceholder = roleSearchPlaceholders[role];
  const userInitials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'EV';
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <main className="brand-bg-shell min-h-screen text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <SidebarContent role={role} />
      </aside>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-ink/45" aria-label="Close menu" onClick={() => setIsSidebarOpen(false)} />
          <aside className="relative h-full w-72 shadow-soft">
            <div className="absolute right-3 top-3 z-10">
              <Button variant="ghost" className="h-9 w-9 bg-white/10 p-0 text-white hover:bg-white/20" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
                <X size={18} />
              </Button>
            </div>
            <SidebarContent role={role} onNavigate={() => setIsSidebarOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="premium-command-header sticky top-0 z-20 border-b border-white/70 shadow-[0_10px_26px_rgba(7,27,58,0.055)] backdrop-blur-2xl">
          <div className="flex min-h-20 flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-[0_0_18rem]">
              <Button variant="ghost" className="h-10 w-10 shrink-0 rounded-full bg-white/70 p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] lg:hidden" aria-label="Open menu" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={20} />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-black leading-none text-ink sm:text-[1.05rem] lg:text-[1.12rem]">{headerTitle || t('layout.title')}</h1>
              </div>
            </div>

            {/*
            <div className="order-3 flex h-12 w-full min-w-0 items-center gap-3 rounded-[1rem] border border-ocean/10 bg-sky/70 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_10px_22px_rgba(0,127,255,0.045)] transition duration-200 focus-within:border-ocean/25 focus-within:bg-white/88 sm:h-[3.25rem] lg:order-none lg:flex-1">
              <Search size={21} className="shrink-0 text-ocean/55" />
              <input className="w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-ink/34 sm:text-[0.95rem]" placeholder={searchPlaceholder || t('layout.searchPlaceholder')} />
            </div>
            */}

            <div className="ml-auto flex min-w-max items-center justify-end gap-2 sm:gap-3">
              <div className="hidden md:block">
                <LanguageSelect className="h-[3.25rem] rounded-[0.95rem] border-white/70 bg-white/86 px-3.5 text-sm shadow-[0_10px_22px_rgba(7,27,58,0.055),inset_0_1px_0_rgba(255,255,255,0.92)]" />
              </div>
              <div className="relative">
                <button
                  type="button"
                  className="flex h-[3.25rem] max-w-[13rem] items-center gap-2 rounded-[1rem] border border-white/70 bg-white/72 px-2.5 pr-3 shadow-[0_10px_22px_rgba(7,27,58,0.055),inset_0_1px_0_rgba(255,255,255,0.92)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-ocean/25"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    setIsUserMenuOpen((current) => !current);
                  }}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ocean text-xs font-black text-white shadow-[0_10px_18px_rgba(0,127,255,0.18)]">
                    {userInitials}
                  </span>
                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="block truncate text-sm font-black leading-4 text-ink">{user.fullName}</span>
                    <span className="block truncate text-xs font-semibold leading-4 text-ink/52">{roleDisplayLabels[role]}</span>
                  </span>
                  <ChevronDown size={16} className={`hidden shrink-0 text-ink/42 transition sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isUserMenuOpen ? (
                  <div className="absolute right-0 top-[3.8rem] z-30 w-56 rounded-lg border border-ocean/10 bg-white p-2 text-left shadow-[0_24px_70px_rgba(7,27,58,0.18)]" role="menu">
                    <button
                      type="button"
                      className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-bold text-ink transition hover:bg-sky"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/settings');
                      }}
                    >
                      <User size={17} className="text-ocean" />
                      Profil
                    </button>
                    <button
                      type="button"
                      className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-bold text-ember transition hover:bg-rose-50"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut size={17} />
                      Déconnexion
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="relative">
                <Button
                  variant="ghost"
                  className="relative h-[3.25rem] w-[3.25rem] shrink-0 rounded-full bg-white/68 p-0 shadow-[0_10px_22px_rgba(7,27,58,0.055),inset_0_1px_0_rgba(255,255,255,0.9)]"
                  aria-expanded={isNotificationsOpen}
                  aria-label="Notifications"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsNotificationsOpen((current) => !current);
                  }}
                >
                  <Bell size={18} />
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-ember shadow-[0_0_0_4px_rgba(206,16,33,0.07)]" />
                </Button>
                {isNotificationsOpen ? (
                  <div className="absolute right-0 top-[3.8rem] z-30 w-80 rounded-lg border border-ocean/10 bg-white p-4 text-left shadow-[0_24px_70px_rgba(7,27,58,0.18)]">
                    <p className="text-sm font-black text-ink">Notifications</p>
                    <p className="mt-2 text-sm leading-5 text-ink/60">Consultez les alertes récentes depuis le tableau de bord, ChatRoom ou Mailbox.</p>
                    <div className="mt-4 grid gap-2">
                      <button
                        type="button"
                        className="h-10 rounded-md bg-ocean px-3 text-sm font-bold text-white transition hover:bg-ink"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          navigate('/dashboard');
                        }}
                      >
                        Voir le tableau de bord
                      </button>
                      <button
                        type="button"
                        className="h-10 rounded-md border border-ocean/15 bg-sky px-3 text-sm font-bold text-ocean transition hover:bg-white"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          navigate('/chatroom');
                        }}
                      >
                        Ouvrir ChatRoom
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="border-t border-white/70 px-4 py-3 md:hidden">
            <LanguageSelect className="h-12 w-full justify-between rounded-[1rem] border-white/70 bg-white/82 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
          </div>
        </header>

        <Outlet />
      </div>
    </main>
  );
};

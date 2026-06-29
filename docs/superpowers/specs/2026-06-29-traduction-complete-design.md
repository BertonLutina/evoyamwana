# Spec — Traduction complète de l'app web Evoyamwana

**Date :** 2026-06-29  
**Statut :** Approuvé  
**Périmètre :** `apps/web` uniquement

---

## Contexte

L'infrastructure i18n est déjà en place :
- 6 locales : `fr`, `sw` (Kiswahili), `ln` (Lingala), `lua` (Tshiluba), `kg` (Kikongo), `tll` (Kitetela)
- `LocaleContext` + hook `useLocale()` + composant `LanguageSelect` opérationnels
- Toutes les clés de traduction dans `packages/shared/src/index.ts`
- `TranslationKey` dérivé automatiquement de `keyof typeof translations.fr`
- `translate()` a un fallback sur `fr` si une clé manque dans un locale

**Problème :** ~50 pages et ~20 composants ont encore du texte hardcodé en français et n'appellent pas `useLocale`.

---

## Objectif

Rendre 100% du texte visible de l'app web traduisible via le système `t()` existant, sans modifier l'API du système i18n ni casser les pages déjà traduites.

---

## Approche : Deux phases, phase 2 parallèle

### Phase 1 — Agent unique : collecte et écriture des clés

**Responsabilité :** lire chaque fichier non traduit, extraire les strings hardcodées, écrire toutes les nouvelles clés dans `packages/shared/src/index.ts` pour les 6 locales, puis rebuilder le package shared.

**Règles :**
- Convention de nommage : `domaine.camelCase` (ex: `teachers.title`, `attendance.markPresent`)
- Grouper les clés par domaine fonctionnel cohérent avec les clés existantes
- Toujours ajouter la clé dans **les 6 blocs de locale** — même si la traduction est identique à `fr` pour certaines langues, la clé doit exister (le fallback couvre les absences mais la cohérence est préférable)
- Après l'écriture, exécuter `npm run build --workspace @evoyamwana/shared` pour rebuilder le package et valider que TypeScript compile

**Fichiers à lire pour audit :**

Pages :
- `src/pages/Dashboard.tsx`
- `src/pages/StudentsPage.tsx`
- `src/pages/TeachersPage.tsx`
- `src/pages/ParentsPage.tsx`
- `src/pages/ClassesPage.tsx`
- `src/pages/AttendancePage.tsx`
- `src/pages/StaffUsersPage.tsx`
- `src/pages/AcademicModulePage.tsx`
- `src/pages/PlanningPage.tsx`
- `src/pages/NotFound.tsx`
- `src/pages/PlaceholderPage.tsx`
- `src/pages/ClassDetailsPage.tsx`
- `src/pages/TeacherProfilePage.tsx`
- `src/pages/ParentProfilePage.tsx`
- `src/pages/dashboards/StudentDashboard.tsx`
- `src/pages/dashboards/PersonalDashboardShell.tsx`
- `src/pages/dashboards/SuperAdminDashboard.tsx`
- `src/pages/dashboards/DirectorDashboard.tsx`
- `src/pages/dashboards/ParentDashboard.tsx`
- `src/pages/dashboards/TeacherDashboard.tsx`
- `src/pages/dashboards/StaffDashboard.tsx`
- `src/pages/teacher/TeacherMessagesPage.tsx`
- `src/pages/teacher/TeacherGradesPage.tsx`
- `src/pages/teacher/TeacherClassesPage.tsx`
- `src/pages/teacher/TeacherAttendancePage.tsx`
- `src/pages/teacher/TeacherProfilePage.tsx`
- `src/pages/staff/StaffGradesReportPage.tsx`
- `src/pages/staff/StaffAttendanceReviewPage.tsx`
- `src/pages/staff/StaffUtilityPages.tsx`
- `src/pages/staff/StaffMessagesPage.tsx`
- `src/pages/staff/AccountantPaymentsPage.tsx`
- `src/pages/staff/ClassTutorWorkspacePage.tsx`
- `src/pages/staff/StaffRecordsPage.tsx`
- `src/pages/staff/StaffOverviewPage.tsx`
- `src/pages/parent/ParentGradesPage.tsx`
- `src/pages/parent/ParentChildrenPage.tsx`
- `src/pages/parent/ParentPaymentsPage.tsx`
- `src/pages/parent/ParentAttendancePage.tsx`
- `src/pages/director/DirectorSectorsPage.tsx`
- `src/pages/director/DirectorOfficialExamsPage.tsx`
- `src/pages/director/DirectorSchoolHealthPage.tsx`
- `src/pages/director/DirectorReportsPage.tsx`
- `src/pages/director/DirectorPedagogyQualityPage.tsx`
- `src/pages/super-admin/SuperAdminSettingsPage.tsx`
- `src/pages/super-admin/SuperAdminSchoolsPage.tsx`
- `src/pages/super-admin/SuperAdminReportsPage.tsx`
- `src/pages/super-admin/SuperAdminShell.tsx`
- `src/pages/super-admin/SuperAdminUsersPage.tsx`
- `src/pages/super-admin/SuperAdminMessagesPage.tsx`
- `src/pages/role-workspaces/RoleWorkspacePage.tsx`
- `src/pages/role-workspaces/RoleAwarePage.tsx`
- `src/pages/communication/MailboxPage.tsx`
- `src/pages/communication/ChatRoomPage.tsx`

Composants :
- `src/components/ParentFormModal.tsx`
- `src/components/TeacherFormModal.tsx`
- `src/components/ClassFormModal.tsx`
- `src/components/StudentFormModal.tsx`
- `src/components/WeekCalendar.tsx`
- `src/components/ProfileChat.tsx`
- `src/components/OfflineSyncBanner.tsx`
- `src/components/student-registration/StudentSpecificInfoStep.tsx`
- `src/components/student-registration/StudentGeneralInfoStep.tsx`
- `src/components/student-registration/StudentMedicalInfoStep.tsx`
- `src/components/student-registration/StudentSummaryStep.tsx`
- `src/components/student-registration/StudentCategoryStep.tsx`
- `src/components/student-registration/StudentRegistrationForm.tsx`
- `src/components/student-registration/StudentGuardiansStep.tsx`

**Fichier modifié :** `packages/shared/src/index.ts` (un seul fichier, un seul agent)

---

### Phase 2 — 5 agents en parallèle : câblage des pages

Chaque agent :
1. Ajoute `import { useLocale } from '../../contexts/LocaleContext';` (chemin relatif selon profondeur)
2. Ajoute `const { t } = useLocale();` dans le composant React
3. Remplace chaque string hardcodée par l'appel `t('clé')` correspondant

**Contrainte absolue :** aucun agent Phase 2 ne modifie `packages/shared/src/index.ts`.

#### Groupes

| Agent | Groupe | Fichiers |
|-------|--------|----------|
| A1 | Core admin | `pages/Dashboard.tsx`, `StudentsPage.tsx`, `TeachersPage.tsx`, `ParentsPage.tsx`, `ClassesPage.tsx`, `AttendancePage.tsx`, `StaffUsersPage.tsx`, `ClassDetailsPage.tsx`, `TeacherProfilePage.tsx`, `ParentProfilePage.tsx`, `AcademicModulePage.tsx`, `PlanningPage.tsx`, `NotFound.tsx`, `PlaceholderPage.tsx` |
| A2 | Dashboards | `dashboards/StudentDashboard.tsx`, `PersonalDashboardShell.tsx`, `SuperAdminDashboard.tsx`, `DirectorDashboard.tsx`, `ParentDashboard.tsx`, `TeacherDashboard.tsx`, `StaffDashboard.tsx` |
| A3 | Teacher & Staff | `teacher/TeacherMessagesPage.tsx`, `TeacherGradesPage.tsx`, `TeacherClassesPage.tsx`, `TeacherAttendancePage.tsx`, `TeacherProfilePage.tsx` + `staff/StaffGradesReportPage.tsx`, `StaffAttendanceReviewPage.tsx`, `StaffUtilityPages.tsx`, `StaffMessagesPage.tsx`, `AccountantPaymentsPage.tsx`, `ClassTutorWorkspacePage.tsx`, `StaffRecordsPage.tsx`, `StaffOverviewPage.tsx` |
| A4 | Parent, Director, SuperAdmin, Communication | `parent/*`, `director/*`, `super-admin/*`, `role-workspaces/*`, `communication/*` |
| A5 | Composants | `components/ParentFormModal.tsx`, `TeacherFormModal.tsx`, `ClassFormModal.tsx`, `StudentFormModal.tsx`, `WeekCalendar.tsx`, `ProfileChat.tsx`, `OfflineSyncBanner.tsx`, `student-registration/*` |

---

## Règles transversales

### Strings dynamiques
- `${count} élèves` → `${count} ${t('students.label')}` (pas d'interpolation dans les clés)
- Les valeurs dynamiques restent en JS, seul le label est traduit

### Composants recevant du texte via props
- Si un composant reçoit `title`, `label`, `placeholder` via props, c'est le **parent appelant** qui passe `t('clé')`, pas le composant lui-même
- Ne pas modifier les interfaces de props des composants génériques (`Button`, `Input`, `EmptyState`, `StatCard`, `ResponsiveTable`)

### Chemins d'import relatifs
| Profondeur | Import |
|------------|--------|
| `src/pages/*.tsx` | `'../contexts/LocaleContext'` |
| `src/pages/sous-dossier/*.tsx` | `'../../contexts/LocaleContext'` |
| `src/components/*.tsx` | `'../contexts/LocaleContext'` |
| `src/components/student-registration/*.tsx` | `'../../contexts/LocaleContext'` |

### Qualité
- Après Phase 2, vérifier la compilation TypeScript : `npm run typecheck --workspace @evoyamwana/web`
- Ne pas modifier les tests existants ni le comportement fonctionnel des pages

---

## Ce qui est hors périmètre

- App mobile (`apps/mobile`)
- Traduction des données dynamiques venant de l'API (noms d'école, noms d'élèves, etc.)
- Ajout de nouvelles langues
- Modifications du design ou de l'UX des pages

---

## Critère de succès

Changer la langue via le `LanguageSelect` met à jour **tout le texte visible** de l'application web, sans rechargement de page.

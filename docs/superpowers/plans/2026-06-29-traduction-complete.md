# Traduction complète de l'app web Evoyamwana — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre 100 % du texte visible de l'app web traduisible via le système `t()` existant, en deux phases : d'abord centraliser toutes les nouvelles clés de traduction dans le package shared, puis câbler `useLocale` dans chaque fichier non encore traduit.

**Architecture:** Phase 1 (séquentielle, 1 agent) : lire tous les fichiers non traduits, extraire chaque string hardcodée, écrire les clés dans `packages/shared/src/index.ts` pour les 6 locales, rebuilder le package. Phase 2 (parallèle, 5 agents) : chaque agent reçoit un groupe de fichiers et remplace les strings hardcodées par `t('clé')` — sans jamais toucher `shared/`.

**Tech Stack:** React 18, TypeScript 5, Vite, `packages/shared/src/index.ts` (source unique des traductions), npm workspaces

## Global Constraints

- Ne jamais modifier `packages/shared/src/index.ts` dans les tâches 2 à 6
- Convention de nommage des clés : `domaine.camelCase` (ex: `teachers.title`, `classes.addNew`)
- Toute nouvelle clé doit être présente dans **les 6 blocs de locale** : `fr`, `sw`, `ln`, `lua`, `kg`, `tll`
- La fonction `translate()` a un fallback sur `fr` — si une traduction manque dans un locale non-français, utiliser la valeur française comme fallback acceptable
- Ne pas modifier les interfaces de props des composants génériques (`Button`, `Input`, `EmptyState`, `StatCard`, `ResponsiveTable`)
- Les valeurs dynamiques (ex: `${count}`) restent en JS : `${count} ${t('students.label')}`, pas d'interpolation dans les clés elles-mêmes
- `TranslationKey` est auto-dérivé de `keyof typeof translations.fr` — ajouter une clé dans le bloc `fr` la rend automatiquement typesafe

---

## Chemins d'import relatifs pour `useLocale`

| Emplacement du fichier | Import à utiliser |
|------------------------|-------------------|
| `src/pages/*.tsx` | `'../contexts/LocaleContext'` |
| `src/pages/sous-dossier/*.tsx` | `'../../contexts/LocaleContext'` |
| `src/components/*.tsx` | `'../contexts/LocaleContext'` |
| `src/components/student-registration/*.tsx` | `'../../contexts/LocaleContext'` |

---

## Task 1: Phase 1 — Audit et écriture de toutes les clés de traduction

> **⚠️ Cette tâche DOIT être complétée avant de démarrer les tâches 2 à 6.**

**Files:**
- Read (audit): tous les fichiers listés ci-dessous
- Modify: `packages/shared/src/index.ts`

**Interfaces:**
- Produces: nouvelles clés de traduction disponibles dans `TranslationKey`, package shared buildé et prêt

### Fichiers à auditer (lire un par un pour extraire les strings)

**Pages racine :**
- `apps/web/src/pages/Dashboard.tsx`
- `apps/web/src/pages/StudentsPage.tsx`
- `apps/web/src/pages/TeachersPage.tsx`
- `apps/web/src/pages/ParentsPage.tsx`
- `apps/web/src/pages/ClassesPage.tsx`
- `apps/web/src/pages/AttendancePage.tsx`
- `apps/web/src/pages/StaffUsersPage.tsx`
- `apps/web/src/pages/AcademicModulePage.tsx`
- `apps/web/src/pages/PlanningPage.tsx`
- `apps/web/src/pages/NotFound.tsx`
- `apps/web/src/pages/PlaceholderPage.tsx`
- `apps/web/src/pages/ClassDetailsPage.tsx`
- `apps/web/src/pages/TeacherProfilePage.tsx`
- `apps/web/src/pages/ParentProfilePage.tsx`

**Dashboards :**
- `apps/web/src/pages/dashboards/PersonalDashboardShell.tsx`
- `apps/web/src/pages/dashboards/SuperAdminDashboard.tsx`
- `apps/web/src/pages/dashboards/DirectorDashboard.tsx`
- `apps/web/src/pages/dashboards/ParentDashboard.tsx`
- `apps/web/src/pages/dashboards/TeacherDashboard.tsx`
- `apps/web/src/pages/dashboards/StaffDashboard.tsx`
- `apps/web/src/pages/dashboards/StudentDashboard.tsx`

**Teacher :**
- `apps/web/src/pages/teacher/TeacherMessagesPage.tsx`
- `apps/web/src/pages/teacher/TeacherGradesPage.tsx`
- `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
- `apps/web/src/pages/teacher/TeacherAttendancePage.tsx`
- `apps/web/src/pages/teacher/TeacherProfilePage.tsx`

**Staff :**
- `apps/web/src/pages/staff/StaffGradesReportPage.tsx`
- `apps/web/src/pages/staff/StaffAttendanceReviewPage.tsx`
- `apps/web/src/pages/staff/StaffUtilityPages.tsx`
- `apps/web/src/pages/staff/StaffMessagesPage.tsx`
- `apps/web/src/pages/staff/AccountantPaymentsPage.tsx`
- `apps/web/src/pages/staff/ClassTutorWorkspacePage.tsx`
- `apps/web/src/pages/staff/StaffRecordsPage.tsx`
- `apps/web/src/pages/staff/StaffOverviewPage.tsx`

**Parent :**
- `apps/web/src/pages/parent/ParentGradesPage.tsx`
- `apps/web/src/pages/parent/ParentChildrenPage.tsx`
- `apps/web/src/pages/parent/ParentPaymentsPage.tsx`
- `apps/web/src/pages/parent/ParentAttendancePage.tsx`

**Director :**
- `apps/web/src/pages/director/DirectorSectorsPage.tsx`
- `apps/web/src/pages/director/DirectorOfficialExamsPage.tsx`
- `apps/web/src/pages/director/DirectorSchoolHealthPage.tsx`
- `apps/web/src/pages/director/DirectorReportsPage.tsx`
- `apps/web/src/pages/director/DirectorPedagogyQualityPage.tsx`

**Super Admin :**
- `apps/web/src/pages/super-admin/SuperAdminSettingsPage.tsx`
- `apps/web/src/pages/super-admin/SuperAdminSchoolsPage.tsx`
- `apps/web/src/pages/super-admin/SuperAdminReportsPage.tsx`
- `apps/web/src/pages/super-admin/SuperAdminShell.tsx`
- `apps/web/src/pages/super-admin/SuperAdminUsersPage.tsx`
- `apps/web/src/pages/super-admin/SuperAdminMessagesPage.tsx`

**Role workspaces & Communication :**
- `apps/web/src/pages/role-workspaces/RoleWorkspacePage.tsx`
- `apps/web/src/pages/role-workspaces/RoleAwarePage.tsx`
- `apps/web/src/pages/communication/MailboxPage.tsx`
- `apps/web/src/pages/communication/ChatRoomPage.tsx`

**Composants :**
- `apps/web/src/components/ParentFormModal.tsx`
- `apps/web/src/components/TeacherFormModal.tsx`
- `apps/web/src/components/ClassFormModal.tsx`
- `apps/web/src/components/StudentFormModal.tsx`
- `apps/web/src/components/WeekCalendar.tsx`
- `apps/web/src/components/ProfileChat.tsx`
- `apps/web/src/components/OfflineSyncBanner.tsx`
- `apps/web/src/components/student-registration/StudentSpecificInfoStep.tsx`
- `apps/web/src/components/student-registration/StudentGeneralInfoStep.tsx`
- `apps/web/src/components/student-registration/StudentMedicalInfoStep.tsx`
- `apps/web/src/components/student-registration/StudentSummaryStep.tsx`
- `apps/web/src/components/student-registration/StudentCategoryStep.tsx`
- `apps/web/src/components/student-registration/StudentRegistrationForm.tsx`
- `apps/web/src/components/student-registration/StudentGuardiansStep.tsx`

### Étapes

- [ ] **Étape 1 : Lire `packages/shared/src/index.ts`**

  Lire le fichier en entier pour comprendre la structure existante et les conventions de nommage. La structure est :
  ```ts
  export const translations = {
    fr: { 'domaine.clé': 'Texte français', ... },
    sw: { 'domaine.clé': 'Texte swahili', ... },
    ln: { ... },
    lua: { ... },
    kg: { ... },
    tll: { ... }
  } as const satisfies Record<Locale, Record<string, string>>;
  ```

- [ ] **Étape 2 : Auditer chaque fichier de la liste**

  Pour chaque fichier, lire son contenu et relever toutes les strings JSX/JS hardcodées en français qui ne sont pas déjà passées par `t()`. Ignorer :
  - Les noms de classes CSS (Tailwind)
  - Les valeurs de props non visibles (ids, types, variant)
  - Les strings déjà wrappées dans `t()`
  - Les imports et commentaires
  - Les chaînes purement dynamiques (ex: `user.firstName`)

  Construire un tableau mental domaine → liste de clés → valeur française.

- [ ] **Étape 3 : Écrire toutes les nouvelles clés dans `packages/shared/src/index.ts`**

  Ajouter les nouvelles clés à la fin de chaque bloc de locale, **dans cet ordre** : `fr`, `sw`, `ln`, `lua`, `kg`, `tll`.

  **Pattern de nommage à suivre :**
  - `teachers.title` → titre de la page enseignants
  - `teachers.addNew` → bouton ajouter
  - `teachers.searchPlaceholder` → placeholder recherche
  - `teachers.emptyTitle` / `teachers.emptyDescription` → état vide
  - `teachers.loadError` → message d'erreur chargement
  - `classes.title`, `classes.addNew`, etc.
  - `attendance.title`, `attendance.markPresent`, etc.
  - `notFound.title`, `notFound.description`, `notFound.backHome`
  - `superAdmin.schools`, `superAdmin.users`, etc.
  - `director.reports`, `director.sectors`, etc.
  - `communication.mailbox`, `communication.chatRoom`, etc.
  - `modal.save`, `modal.cancel`, `modal.delete` (pour les clés partagées entre modals)
  - `registration.step1`, `registration.generalInfo`, etc.

  **Pour les locales non-françaises :** Si la traduction n'est pas certaine, utiliser la valeur française — le fallback `translate()` couvrira les manques, mais la clé doit exister dans tous les blocs.

- [ ] **Étape 4 : Vérifier la cohérence interne**

  S'assurer que chaque clé ajoutée dans `fr` existe également dans `sw`, `ln`, `lua`, `kg`, et `tll`. Le TypeScript ne l'exigera pas (seul `fr` définit `TranslationKey`) mais la cohérence est requise pour éviter les chaînes vides.

- [ ] **Étape 5 : Builder le package shared**

  ```bash
  cd /Users/creaafde/Documents/EVOYAMWANA/evoyamwana
  npm run build --workspace @evoyamwana/shared
  ```

  Résultat attendu : compilation réussie, `packages/shared/dist/index.js` et `dist/index.d.ts` mis à jour.

- [ ] **Étape 6 : Vérifier le typecheck web**

  ```bash
  npm run typecheck --workspace @evoyamwana/web
  ```

  Résultat attendu : aucune erreur TypeScript. Si des erreurs apparaissent sur `TranslationKey`, c'est qu'une clé utilisée dans les pages déjà traduites a été mal nommée — corriger dans `shared/src/index.ts` et rebuilder.

- [ ] **Étape 7 : Commit**

  ```bash
  git add packages/shared/src/index.ts packages/shared/dist/
  git commit -m "feat(i18n): add all missing translation keys for 6 locales"
  ```

---

## Task 2: Phase 2 / Agent A1 — Pages core admin

> **Peut être exécutée en parallèle avec les tâches 3, 4, 5, 6 — APRÈS la tâche 1.**

**Files:**
- Modify: 14 fichiers listés ci-dessous

**Interfaces:**
- Consumes: clés de traduction écrites en Task 1, disponibles via `import { useLocale } from '../contexts/LocaleContext'`

### Fichiers à modifier

- `apps/web/src/pages/Dashboard.tsx`
- `apps/web/src/pages/StudentsPage.tsx`
- `apps/web/src/pages/TeachersPage.tsx`
- `apps/web/src/pages/ParentsPage.tsx`
- `apps/web/src/pages/ClassesPage.tsx`
- `apps/web/src/pages/AttendancePage.tsx`
- `apps/web/src/pages/StaffUsersPage.tsx`
- `apps/web/src/pages/ClassDetailsPage.tsx`
- `apps/web/src/pages/TeacherProfilePage.tsx`
- `apps/web/src/pages/ParentProfilePage.tsx`
- `apps/web/src/pages/AcademicModulePage.tsx`
- `apps/web/src/pages/PlanningPage.tsx`
- `apps/web/src/pages/NotFound.tsx`
- `apps/web/src/pages/PlaceholderPage.tsx`

### Pattern à appliquer dans chaque fichier

- [ ] **Étape 1 : Ajouter l'import `useLocale`**

  En haut du fichier, après les imports existants :
  ```tsx
  import { useLocale } from '../contexts/LocaleContext';
  ```

- [ ] **Étape 2 : Ajouter le hook dans le composant**

  Au début du corps de la fonction composant (avant le `return`) :
  ```tsx
  const { t } = useLocale();
  ```

- [ ] **Étape 3 : Remplacer chaque string hardcodée**

  Pour chaque string visible en JSX ou dans un attribut (`placeholder`, `aria-label`, `title`) :
  ```tsx
  // Avant
  <h2>Tableau de bord</h2>
  // Après
  <h2>{t('dashboard.title')}</h2>

  // Avant
  <input placeholder="Rechercher un élève..." />
  // Après
  <input placeholder={t('students.searchPlaceholder')} />

  // Avant
  <EmptyState title="Aucun résultat" description="Modifiez les filtres." />
  // Après
  <EmptyState title={t('students.emptyTitle')} description={t('students.emptyDescription')} />
  ```

  Pour les strings dynamiques :
  ```tsx
  // Avant
  <span>{count} élèves inscrits</span>
  // Après
  <span>{count} {t('students.registered')}</span>
  ```

- [ ] **Étape 4 : Ne pas toucher `packages/shared/`**

  Toutes les clés nécessaires ont été ajoutées en Task 1. Si une clé semble manquer, utiliser la clé la plus proche existante — ne pas modifier `shared/src/index.ts`.

- [ ] **Étape 5 : Vérifier le typecheck**

  ```bash
  npm run typecheck --workspace @evoyamwana/web
  ```

  Résultat attendu : 0 erreur.

- [ ] **Étape 6 : Commit**

  ```bash
  git add apps/web/src/pages/Dashboard.tsx \
    apps/web/src/pages/StudentsPage.tsx \
    apps/web/src/pages/TeachersPage.tsx \
    apps/web/src/pages/ParentsPage.tsx \
    apps/web/src/pages/ClassesPage.tsx \
    apps/web/src/pages/AttendancePage.tsx \
    apps/web/src/pages/StaffUsersPage.tsx \
    apps/web/src/pages/ClassDetailsPage.tsx \
    apps/web/src/pages/TeacherProfilePage.tsx \
    apps/web/src/pages/ParentProfilePage.tsx \
    apps/web/src/pages/AcademicModulePage.tsx \
    apps/web/src/pages/PlanningPage.tsx \
    apps/web/src/pages/NotFound.tsx \
    apps/web/src/pages/PlaceholderPage.tsx
  git commit -m "feat(i18n): wire useLocale in core admin pages"
  ```

---

## Task 3: Phase 2 / Agent A2 — Dashboards

> **Peut être exécutée en parallèle avec les tâches 2, 4, 5, 6 — APRÈS la tâche 1.**

**Files:**
- Modify: 7 fichiers listés ci-dessous

**Interfaces:**
- Consumes: clés de traduction écrites en Task 1

### Fichiers à modifier

- `apps/web/src/pages/dashboards/PersonalDashboardShell.tsx`
- `apps/web/src/pages/dashboards/SuperAdminDashboard.tsx`
- `apps/web/src/pages/dashboards/DirectorDashboard.tsx`
- `apps/web/src/pages/dashboards/ParentDashboard.tsx`
- `apps/web/src/pages/dashboards/TeacherDashboard.tsx`
- `apps/web/src/pages/dashboards/StaffDashboard.tsx`
- `apps/web/src/pages/dashboards/StudentDashboard.tsx`

### Pattern à appliquer

- [ ] **Étape 1 : Ajouter l'import `useLocale`**

  ```tsx
  import { useLocale } from '../../contexts/LocaleContext';
  ```
  (profondeur `pages/dashboards/` → deux niveaux au-dessus de `src/`)

- [ ] **Étape 2 : Ajouter le hook dans chaque composant**

  ```tsx
  const { t } = useLocale();
  ```

- [ ] **Étape 3 : Remplacer chaque string hardcodée**

  Appliquer le même pattern que Task 2. Utiliser les clés du domaine `dashboard.*` et les clés spécifiques au rôle (ex: `director.*`, `teacher.*`, `parent.*`).

- [ ] **Étape 4 : Vérifier le typecheck**

  ```bash
  npm run typecheck --workspace @evoyamwana/web
  ```

  Résultat attendu : 0 erreur.

- [ ] **Étape 5 : Commit**

  ```bash
  git add apps/web/src/pages/dashboards/
  git commit -m "feat(i18n): wire useLocale in dashboard pages"
  ```

---

## Task 4: Phase 2 / Agent A3 — Pages teacher et staff

> **Peut être exécutée en parallèle avec les tâches 2, 3, 5, 6 — APRÈS la tâche 1.**

**Files:**
- Modify: 13 fichiers listés ci-dessous

**Interfaces:**
- Consumes: clés de traduction écrites en Task 1

### Fichiers à modifier

**Teacher :**
- `apps/web/src/pages/teacher/TeacherMessagesPage.tsx`
- `apps/web/src/pages/teacher/TeacherGradesPage.tsx`
- `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
- `apps/web/src/pages/teacher/TeacherAttendancePage.tsx`
- `apps/web/src/pages/teacher/TeacherProfilePage.tsx`

**Staff :**
- `apps/web/src/pages/staff/StaffGradesReportPage.tsx`
- `apps/web/src/pages/staff/StaffAttendanceReviewPage.tsx`
- `apps/web/src/pages/staff/StaffUtilityPages.tsx`
- `apps/web/src/pages/staff/StaffMessagesPage.tsx`
- `apps/web/src/pages/staff/AccountantPaymentsPage.tsx`
- `apps/web/src/pages/staff/ClassTutorWorkspacePage.tsx`
- `apps/web/src/pages/staff/StaffRecordsPage.tsx`
- `apps/web/src/pages/staff/StaffOverviewPage.tsx`

### Pattern à appliquer

- [ ] **Étape 1 : Ajouter l'import `useLocale`**

  ```tsx
  import { useLocale } from '../../contexts/LocaleContext';
  ```

- [ ] **Étape 2 : Ajouter le hook**

  ```tsx
  const { t } = useLocale();
  ```

- [ ] **Étape 3 : Remplacer chaque string hardcodée**

  Utiliser les clés du domaine `teacher.*` et `staff.*` établies en Task 1.

- [ ] **Étape 4 : Vérifier le typecheck**

  ```bash
  npm run typecheck --workspace @evoyamwana/web
  ```

- [ ] **Étape 5 : Commit**

  ```bash
  git add apps/web/src/pages/teacher/ apps/web/src/pages/staff/
  git commit -m "feat(i18n): wire useLocale in teacher and staff pages"
  ```

---

## Task 5: Phase 2 / Agent A4 — Pages parent, director, super-admin, communication

> **Peut être exécutée en parallèle avec les tâches 2, 3, 4, 6 — APRÈS la tâche 1.**

**Files:**
- Modify: 18 fichiers listés ci-dessous

**Interfaces:**
- Consumes: clés de traduction écrites en Task 1

### Fichiers à modifier

**Parent :**
- `apps/web/src/pages/parent/ParentGradesPage.tsx`
- `apps/web/src/pages/parent/ParentChildrenPage.tsx`
- `apps/web/src/pages/parent/ParentPaymentsPage.tsx`
- `apps/web/src/pages/parent/ParentAttendancePage.tsx`

**Director :**
- `apps/web/src/pages/director/DirectorSectorsPage.tsx`
- `apps/web/src/pages/director/DirectorOfficialExamsPage.tsx`
- `apps/web/src/pages/director/DirectorSchoolHealthPage.tsx`
- `apps/web/src/pages/director/DirectorReportsPage.tsx`
- `apps/web/src/pages/director/DirectorPedagogyQualityPage.tsx`

**Super Admin :**
- `apps/web/src/pages/super-admin/SuperAdminSettingsPage.tsx`
- `apps/web/src/pages/super-admin/SuperAdminSchoolsPage.tsx`
- `apps/web/src/pages/super-admin/SuperAdminReportsPage.tsx`
- `apps/web/src/pages/super-admin/SuperAdminShell.tsx`
- `apps/web/src/pages/super-admin/SuperAdminUsersPage.tsx`
- `apps/web/src/pages/super-admin/SuperAdminMessagesPage.tsx`

**Role workspaces & Communication :**
- `apps/web/src/pages/role-workspaces/RoleWorkspacePage.tsx`
- `apps/web/src/pages/role-workspaces/RoleAwarePage.tsx`
- `apps/web/src/pages/communication/MailboxPage.tsx`
- `apps/web/src/pages/communication/ChatRoomPage.tsx`

### Pattern à appliquer

- [ ] **Étape 1 : Ajouter l'import `useLocale`**

  ```tsx
  import { useLocale } from '../../contexts/LocaleContext';
  ```

- [ ] **Étape 2 : Ajouter le hook**

  ```tsx
  const { t } = useLocale();
  ```

- [ ] **Étape 3 : Remplacer chaque string hardcodée**

  Domaines à utiliser : `parent.*`, `director.*`, `superAdmin.*`, `communication.*` établis en Task 1.

- [ ] **Étape 4 : Vérifier le typecheck**

  ```bash
  npm run typecheck --workspace @evoyamwana/web
  ```

- [ ] **Étape 5 : Commit**

  ```bash
  git add apps/web/src/pages/parent/ \
    apps/web/src/pages/director/ \
    apps/web/src/pages/super-admin/ \
    apps/web/src/pages/role-workspaces/ \
    apps/web/src/pages/communication/
  git commit -m "feat(i18n): wire useLocale in parent, director, super-admin, communication pages"
  ```

---

## Task 6: Phase 2 / Agent A5 — Composants

> **Peut être exécutée en parallèle avec les tâches 2, 3, 4, 5 — APRÈS la tâche 1.**

**Files:**
- Modify: 14 fichiers listés ci-dessous

**Interfaces:**
- Consumes: clés de traduction écrites en Task 1

### Fichiers à modifier

- `apps/web/src/components/ParentFormModal.tsx`
- `apps/web/src/components/TeacherFormModal.tsx`
- `apps/web/src/components/ClassFormModal.tsx`
- `apps/web/src/components/StudentFormModal.tsx`
- `apps/web/src/components/WeekCalendar.tsx`
- `apps/web/src/components/ProfileChat.tsx`
- `apps/web/src/components/OfflineSyncBanner.tsx`
- `apps/web/src/components/student-registration/StudentSpecificInfoStep.tsx`
- `apps/web/src/components/student-registration/StudentGeneralInfoStep.tsx`
- `apps/web/src/components/student-registration/StudentMedicalInfoStep.tsx`
- `apps/web/src/components/student-registration/StudentSummaryStep.tsx`
- `apps/web/src/components/student-registration/StudentCategoryStep.tsx`
- `apps/web/src/components/student-registration/StudentRegistrationForm.tsx`
- `apps/web/src/components/student-registration/StudentGuardiansStep.tsx`

### Pattern à appliquer

- [ ] **Étape 1 : Ajouter l'import `useLocale` selon la profondeur**

  Pour `src/components/*.tsx` :
  ```tsx
  import { useLocale } from '../contexts/LocaleContext';
  ```

  Pour `src/components/student-registration/*.tsx` :
  ```tsx
  import { useLocale } from '../../contexts/LocaleContext';
  ```

- [ ] **Étape 2 : Ajouter le hook dans chaque composant**

  ```tsx
  const { t } = useLocale();
  ```

- [ ] **Étape 3 : Remplacer chaque string hardcodée**

  Pour les modals, les labels de formulaire, les titres de section, les boutons submit/cancel.

  Exemple pour un modal :
  ```tsx
  // Avant
  <h2>Ajouter un enseignant</h2>
  <label>Nom complet</label>
  <button type="submit">Enregistrer</button>
  <button type="button">Annuler</button>

  // Après
  <h2>{t('teacherForm.title')}</h2>
  <label>{t('teacherForm.fullName')}</label>
  <button type="submit">{t('teacherForm.submit')}</button>
  <button type="button">{t('modal.cancel')}</button>
  ```

  Pour `StudentRegistrationForm` et ses étapes : utiliser les clés du domaine `registration.*`.

- [ ] **Étape 4 : Ne pas modifier les props des composants génériques**

  Si un composant comme `ClassFormModal` appelle `<Button>Enregistrer</Button>`, le texte du bouton vient des props — remplacer la prop passée au composant, pas le composant lui-même.

- [ ] **Étape 5 : Vérifier le typecheck**

  ```bash
  npm run typecheck --workspace @evoyamwana/web
  ```

- [ ] **Étape 6 : Commit**

  ```bash
  git add apps/web/src/components/ParentFormModal.tsx \
    apps/web/src/components/TeacherFormModal.tsx \
    apps/web/src/components/ClassFormModal.tsx \
    apps/web/src/components/StudentFormModal.tsx \
    apps/web/src/components/WeekCalendar.tsx \
    apps/web/src/components/ProfileChat.tsx \
    apps/web/src/components/OfflineSyncBanner.tsx \
    apps/web/src/components/student-registration/
  git commit -m "feat(i18n): wire useLocale in form modals and registration components"
  ```

---

## Task 7: Vérification finale

> **À exécuter après que les tâches 2 à 6 sont toutes terminées.**

**Files:**
- Read only (vérification)

**Interfaces:**
- Consumes: toutes les modifications des tâches 1 à 6

- [ ] **Étape 1 : Typecheck complet**

  ```bash
  npm run typecheck --workspace @evoyamwana/web
  ```

  Résultat attendu : 0 erreur TypeScript.

- [ ] **Étape 2 : Vérifier qu'aucun fichier cible n'a encore de texte hardcodé**

  ```bash
  # Cette commande liste les fichiers modifiés qui contiendraient encore des strings JSX hardcodées
  # (heuristique : strings entre > et < de plus de 3 caractères qui ne sont pas des variables)
  grep -rn ">[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâéèêëîïôùûüç]" \
    apps/web/src/pages/Dashboard.tsx \
    apps/web/src/pages/StudentsPage.tsx \
    apps/web/src/pages/TeachersPage.tsx \
    apps/web/src/pages/ParentsPage.tsx \
    apps/web/src/pages/ClassesPage.tsx \
    apps/web/src/pages/AttendancePage.tsx \
    apps/web/src/pages/NotFound.tsx | grep -v "{t(" | grep -v "//.*>"
  ```

  Inspecter manuellement les résultats — des faux positifs sont attendus (noms propres, constantes). Le but est de détecter des oublis évidents.

- [ ] **Étape 3 : Build de l'app web**

  ```bash
  npm run build --workspace @evoyamwana/web
  ```

  Résultat attendu : build réussi sans erreur.

- [ ] **Étape 4 : Commit final si nécessaire**

  Si des corrections mineures ont été faites :
  ```bash
  git add -p
  git commit -m "fix(i18n): final adjustments after full translation wiring"
  ```

---

## Dépendances entre tâches

```
Task 1 (Phase 1 — shared keys)
    ├── Task 2 (Core admin pages)     ─┐
    ├── Task 3 (Dashboards)            │ parallèle
    ├── Task 4 (Teacher & Staff)       │
    ├── Task 5 (Parent/Director/SA)    │
    └── Task 6 (Composants)           ─┘
                                        └── Task 7 (Vérification finale)
```

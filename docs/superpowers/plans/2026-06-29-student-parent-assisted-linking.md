# Student Parent Assisted Linking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** During student enrollment, allow staff to manually confirm existing parents found by phone/email, or create new parent records without duplicate parent accounts.

**Architecture:** Extend the student guardian payload so each guardian can either reference an existing parent id or include new parent details. The backend remains the source of truth: it validates existing parent ids, detects duplicate parents by email/phone/name in the school, and creates parents only when no conflicting existing parent is found. The frontend shows possible matches and lets staff select the right parent before submitting.

**Tech Stack:** Express, Prisma, React, TypeScript, Tailwind CSS.

## Global Constraints

- Do not silently link a matched parent; the user must select the existing parent in the frontend.
- Backend must prevent duplicate parents when an email or phone match already exists.
- Existing parent links must stay supported through `guardianId`.
- Parent creation from student enrollment must create both `User` and `Parent`.
- Verification must include API and web typecheck/build.

---

### Task 1: Backend Guardian Contract

**Files:**
- Modify: `apps/api/src/services/students.service.ts`
- Modify: `apps/api/src/routes/students.routes.ts`

**Interfaces:**
- Produces: `StudentGuardianInput` with optional `guardianId` and optional `parent`.
- Produces: backend validation that accepts either `guardianId` or parent details.

- [ ] Add `StudentGuardianParentInput` with `firstName`, `lastName`, `email`, `phone`, and `address`.
- [ ] Update Zod guardian schema so `guardianId` is optional and `parent` is optional.
- [ ] Reject guardians without `guardianId` and without enough new parent details.

### Task 2: Backend Parent Resolve/Create

**Files:**
- Modify: `apps/api/src/services/students.service.ts`

**Interfaces:**
- Consumes: `StudentGuardianInput[]`.
- Produces: `resolveGuardians(tx, schoolId, guardians)` returning guardians with real `guardianId`.

- [ ] Before creating the student, resolve each guardian.
- [ ] If `guardianId` exists, validate the parent belongs to the school.
- [ ] If parent details exist, search same-school parents by user email, phone, then first+last name.
- [ ] If a match exists and no `guardianId` was selected, return 409 with a clear message asking the user to select the existing parent.
- [ ] If no match exists, create a `User` with role `PARENT` and a `Parent` record.
- [ ] Link the student to resolved parent ids only.

### Task 3: Frontend Guardian UI

**Files:**
- Modify: `apps/web/src/services/studentRegistrationApi.ts`
- Modify: `apps/web/src/services/studentValidation.ts`
- Modify: `apps/web/src/components/student-registration/StudentGuardiansStep.tsx`
- Modify: `apps/web/src/components/student-registration/StudentSummaryStep.tsx`

**Interfaces:**
- Produces: guardian rows that can be selected existing parents or new parent candidates.
- Produces: payload that sends existing `guardianId` or new `parent` details.

- [ ] Add parent detail fields to `StudentGuardianForm`.
- [ ] In the guardian step, show inputs for parent identity and display matches from the loaded parents list by phone/email/name.
- [ ] Add a “Utiliser ce parent” action that sets `guardianId`.
- [ ] Add a “Créer nouveau parent” state when no existing parent is selected.
- [ ] Keep existing select-style behavior available through the match cards.
- [ ] Validate each guardian has either a selected parent or enough parent details.

### Task 4: Verification

**Files:**
- No code files.

**Commands:**
- `npm run typecheck --workspace @evoyamwana/api`
- `npm run build --workspace @evoyamwana/api`
- `npm run typecheck --workspace @evoyamwana/web`
- `npm run build --workspace @evoyamwana/web`

**Expected:** All commands pass. Vite chunk-size warnings are acceptable.

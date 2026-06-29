# File Upload Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add authenticated local upload and download for images and documents.

**Architecture:** The API stores file bytes under `apps/api/uploads` and stores metadata in Prisma. The frontend uploads via `multipart/form-data`, then stores the returned download URL in existing `photoUrl` fields or uses it as a downloadable document link.

**Tech Stack:** Express, Prisma, local filesystem, React, Fetch/FormData.

## Global Constraints

- Auth is required for upload and download.
- Files are scoped by school except `SUPER_ADMIN`.
- Max file size is 10 MB.
- Allowed MIME types are images, PDF, Word, Excel, CSV, and plain text.
- Uploaded files must never be executed by the server.

---

### Task 1: Backend File Service

**Files:**
- Create: `apps/api/src/services/files.service.ts`
- Test: `apps/api/src/services/files.service.test.ts`
- Modify: `apps/api/prisma/schema.prisma`

**Interfaces:**
- Produces: `validateUploadFile(file: UploadCandidate): void`
- Produces: `fileService.createStoredFile(user, file): Promise<FileRecord>`
- Produces: `fileService.getDownload(user, id): Promise<{ record; absolutePath }>`

- [ ] Write failing validation tests.
- [ ] Implement MIME and size validation.
- [ ] Add Prisma `UploadedFile` model.

### Task 2: Backend Routes

**Files:**
- Create: `apps/api/src/controllers/files.controller.ts`
- Create: `apps/api/src/routes/files.routes.ts`
- Modify: `apps/api/src/routes/index.ts`
- Modify: `apps/api/package.json`

**Interfaces:**
- Produces: `POST /files/upload`
- Produces: `GET /files/:id/download`

- [ ] Add multipart middleware.
- [ ] Return `{ file: { id, originalName, mimeType, size, downloadUrl } }`.
- [ ] Stream downloads with original filename.

### Task 3: Frontend Upload

**Files:**
- Create: `apps/web/src/services/files.service.ts`
- Create: `apps/web/src/components/FileUpload.tsx`
- Modify: `apps/web/src/services/api.ts`

**Interfaces:**
- Produces: `filesService.upload(file): Promise<UploadedFileDto>`
- Produces: `<FileUpload accept="image/*" onUploaded={(file) => ...} />`

- [ ] Support FormData without JSON content type.
- [ ] Render clear upload/download states.

### Task 4: Wire Existing Photo Inputs

**Files:**
- Modify: `apps/web/src/components/student-registration/StudentGeneralInfoStep.tsx`
- Modify: `apps/web/src/components/TeacherFormModal.tsx`

**Interfaces:**
- Consumes: `FileUpload`

- [ ] Replace no-op student photo file input.
- [ ] Add real teacher photo upload.
- [ ] Keep manual URL input for compatibility.

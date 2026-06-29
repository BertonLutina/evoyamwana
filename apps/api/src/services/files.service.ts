import type { AuthUser } from '@evoyamwana/shared';
import { createReadStream } from 'node:fs';
import { mkdir, rename, stat, unlink } from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export const maxUploadBytes = 10 * 1024 * 1024;

export const allowedUploadMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain'
]);

export type UploadCandidate = {
  originalName: string;
  mimeType: string;
  size: number;
};

export type UploadedDiskFile = UploadCandidate & {
  tempPath: string;
};

type UploadedFileRecord = {
  id: string;
  schoolId: string | null;
  ownerUserId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  purpose: string | null;
  createdAt: Date;
};

type FilesDb = {
  uploadedFile?: {
    create?: (args: unknown) => Promise<unknown>;
    findUnique?: (args: unknown) => Promise<unknown>;
  };
};

const apiRoot = process.cwd().endsWith(`${path.sep}apps${path.sep}api`) ? process.cwd() : path.join(process.cwd(), 'apps/api');
const uploadRoot = path.join(apiRoot, 'uploads');

const extensionFor = (originalName: string) => {
  const extension = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');
  return extension.length <= 12 ? extension : '';
};

export const validateUploadFile = (file: UploadCandidate) => {
  if (file.size > maxUploadBytes) {
    throw new AppError('File is too large. Maximum size is 10 MB.', 400);
  }

  if (!allowedUploadMimeTypes.has(file.mimeType)) {
    throw new AppError('This file type is not allowed.', 400);
  }
};

export const fileToDto = (file: UploadedFileRecord) => ({
  id: file.id,
  originalName: file.originalName,
  mimeType: file.mimeType,
  size: file.size,
  purpose: file.purpose,
  downloadUrl: `/files/${file.id}/download`,
  createdAt: file.createdAt
});

export const fileService = {
  uploadRoot,

  async createStoredFile(user: AuthUser, file: UploadedDiskFile, purpose?: string) {
    validateUploadFile(file);
    if (!user.schoolId && user.role !== 'SUPER_ADMIN') {
      throw new AppError('School context is required', 403);
    }

    const schoolSegment = user.schoolId ?? 'platform';
    const targetDir = path.join(uploadRoot, schoolSegment);
    await mkdir(targetDir, { recursive: true });

    const storedName = `${crypto.randomUUID()}${extensionFor(file.originalName)}`;
    const absolutePath = path.join(targetDir, storedName);
    await rename(file.tempPath, absolutePath);

    const size = (await stat(absolutePath)).size;
    validateUploadFile({ ...file, size });

    const db = prisma as unknown as FilesDb;
    const record = await db.uploadedFile?.create?.({
      data: {
        schoolId: user.schoolId,
        ownerUserId: user.id,
        originalName: file.originalName,
        storedName,
        mimeType: file.mimeType,
        size,
        path: absolutePath,
        purpose: purpose || null
      }
    });

    if (!record) {
      await unlink(absolutePath).catch(() => undefined);
      throw new AppError('File storage is not ready. Run the database migration.', 500);
    }

    return record as UploadedFileRecord;
  },

  async getDownload(user: AuthUser, id: string) {
    const db = prisma as unknown as FilesDb;
    const record = await db.uploadedFile?.findUnique?.({ where: { id } });
    if (!record) throw new AppError('File not found', 404);

    const file = record as UploadedFileRecord;
    if (user.role !== 'SUPER_ADMIN' && file.schoolId !== user.schoolId) {
      throw new AppError('File not found', 404);
    }

    return {
      record: file,
      stream: createReadStream(file.path)
    };
  }
};

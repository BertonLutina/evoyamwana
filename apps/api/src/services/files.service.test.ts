import assert from 'node:assert/strict';
import test from 'node:test';
import { validateUploadFile } from './files.service.js';

test('validateUploadFile accepts supported images below the size limit', () => {
  assert.doesNotThrow(() => validateUploadFile({
    originalName: 'portrait.png',
    mimeType: 'image/png',
    size: 1024
  }));
});

test('validateUploadFile rejects files larger than 10 MB', () => {
  assert.throws(
    () => validateUploadFile({
      originalName: 'large.pdf',
      mimeType: 'application/pdf',
      size: 10 * 1024 * 1024 + 1
    }),
    { message: 'File is too large. Maximum size is 10 MB.' }
  );
});

test('validateUploadFile rejects unsupported file types', () => {
  assert.throws(
    () => validateUploadFile({
      originalName: 'script.sh',
      mimeType: 'application/x-sh',
      size: 128
    }),
    { message: 'This file type is not allowed.' }
  );
});

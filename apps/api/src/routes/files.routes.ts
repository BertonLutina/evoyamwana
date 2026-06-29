import { Router } from 'express';
import multer from 'multer';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { downloadFile, uploadFile } from '../controllers/files.controller.js';
import { requireAuth } from '../middleware/auth/auth.middleware.js';
import { maxUploadBytes } from '../services/files.service.js';

const router = Router();

const upload = multer({
  dest: path.join(tmpdir(), 'evoyamwana-uploads'),
  limits: { fileSize: maxUploadBytes }
});

router.use(requireAuth);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id/download', downloadFile);

export default router;

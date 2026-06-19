import express from 'express';
import { uploadDocument, upload, getPresignedUrl } from '../controllers/documentController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/presigned/:key', getPresignedUrl);

export default router;
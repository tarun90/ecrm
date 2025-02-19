// routes/sourceFileRoutes.js
import express from 'express';
import { getUniqueSourceFiles } from '../controllers/sourceFileController.js';

const router = express.Router();

router.get('/source-files', getUniqueSourceFiles);

export default router;
import express from 'express';
import {
  createNote,
  getNotesByOutreach,
  getNoteById,
  updateNote,
  deleteNote
} from '../controllers/noteController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create a new note for an outreach
router.post('/outreach/:outreachId/notes', createNote);

// Get all notes for an outreach
router.get('/outreach/:outreachId/notes', getNotesByOutreach);

// Get a specific note
router.get('/notes/:noteId', getNoteById);

// Update a note
router.put('/notes/:noteId', updateNote);

// Delete a note
router.delete('/notes/:noteId', deleteNote);

export default router;

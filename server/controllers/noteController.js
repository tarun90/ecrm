import Note from '../models/Note.js';
import Outreach from '../models/Outreach.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads', 'notes');
fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/notes');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.xls', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
}).single('attachment');

// Create a new note
export const createNote = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { outreachId } = req.params;
      const { contactMethod, message, reminderDate } = req.body;

      // Validate outreach exists
      const outreach = await Outreach.findById(outreachId);
      if (!outreach) {
        return res.status(404).json({ message: 'Outreach not found' });
      }

      // Check if there are any existing notes for this outreach
      const existingNotesCount = await Note.countDocuments({ outreachId });

      const noteData = {
        outreachId,
        contactMethod: JSON.parse(contactMethod),
        message,
        reminderDate,
        createdBy: req.user?.user?._id
      };

      // Add attachment if file was uploaded
      if (req.file) {
        noteData.attachment = {
          filename: req.file.originalname,
          path: req.file.path,
          mimetype: req.file.mimetype
        };
      }

      const note = await Note.create(noteData);
      await note.populate('createdBy', 'name email');

      // Update outreach status based on whether it's first note or not
      await Outreach.updateOne(
        { _id: outreachId },
        { $set: { status: existingNotesCount === 0 ? "Contacted" : "Follow Up" } }
      );

      res.status(201).json(note);
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Error creating note', error: error.message });
  }
};

// Get all notes for an outreach
export const getNotesByOutreach = async (req, res) => {
  try {
    const { outreachId } = req.params;
    
    // Validate outreach exists
    const outreach = await Outreach.findById(outreachId);
    if (!outreach) {
      return res.status(404).json({ message: 'Outreach not found' });
    }

    const notes = await Note.find({ outreachId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};

// Get a single note by ID
export const getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const note = await Note.findById(noteId)
      .populate('createdBy', 'name email');
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Error fetching note', error: error.message });
  }
};

// Update a note
export const updateNote = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { noteId } = req.params;
      const { contactMethod, message, reminderDate, removeAttachment } = req.body;

      const noteData = {
        contactMethod: JSON.parse(contactMethod),
        message,
        reminderDate
      };

      // Handle attachment
      if (req.file) {
        // New file uploaded
        noteData.attachment = {
          filename: req.file.originalname,
          path: req.file.path,
          mimetype: req.file.mimetype
        };
      } else if (removeAttachment === 'true') {
        // Remove attachment if flag is set
        noteData.attachment = null;
      }
      // If neither condition is met, leave attachment unchanged

      const note = await Note.findByIdAndUpdate(
        noteId,
        noteData,
        { new: true }
      ).populate('createdBy', 'name email');

      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }

      res.json(note);
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const note = await Note.findByIdAndDelete(noteId);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};

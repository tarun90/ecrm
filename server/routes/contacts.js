import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import Contact from '../models/Contact.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all contacts
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ owner: req.user.userId });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts' });
  }
});

// Create new contact
router.post('/', auth, async (req, res) => {
  try {
    const contact = new Contact({
      ...req.body,
      owner: req.user.userId
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contact' });
  }
});

// Import contacts from CSV
router.post('/import', auth, upload.single('file'), async (req, res) => {
  try {
    const records = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true
    });

    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        records.push({
          ...record,
          owner: req.user.userId
        });
      }
    });

    parser.on('end', async function() {
      try {
        const contacts = await Contact.insertMany(records);
        res.json(contacts);
      } catch (error) {
        res.status(500).json({ message: 'Error importing contacts' });
      }
    });

    parser.write(req.file.buffer.toString());
    parser.end();
  } catch (error) {
    res.status(500).json({ message: 'Error processing CSV file' });
  }
});

export default router;
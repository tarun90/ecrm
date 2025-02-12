import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import Contact from '../models/Contact.js';
import auth from '../middleware/auth.js';
import { Parser } from 'json2csv';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all contacts
// In your contacts router file, update the GET route:
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { contactOwner: req.user.user._id };

    if (search) {
      query = {
        ...query,
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const contacts = await Contact.find(query).populate('contactOwner');
    res.json(contacts);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error fetching contacts' });
  }
});

// Add these new routes to your existing router file

// Delete contact
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      contactOwner: req.user.user._id
    });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact' });
  }
});

// Update contact
router.put('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, contactOwner: req.user.user._id },
      { ...req.body },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact' });
  }
});

// Create new contact
router.post('/', auth, async (req, res) => {
  try {
    const contact = new Contact({
      ...req.body,
      contactOwner:req?.user?.user?._id
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
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const records = [];
    const csvString = req.file.buffer.toString();

    // Create parser with configuration
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true, // This will trim whitespace from values
    });

    // Set up promise to handle parsing
    const parseCSV = new Promise((resolve, reject) => {
      parser.on('readable', function () {
        let record;
        while ((record = parser.read()) !== null) {
          // Add contactOwner to each record
          records.push({
            ...record,
            contactOwner: req.user.user._id // Make sure this matches your schema
          });
        }
      });

      parser.on('error', function (err) {
        reject(err);
      });

      parser.on('end', function () {
        resolve();
      });
    });

    // Write the CSV data to the parser
    parser.write(csvString);
    parser.end();

    // Wait for parsing to complete
    await parseCSV;

    // Insert the records
    if (records.length > 0) {
      const contacts = await Contact.insertMany(records);
      res.json(contacts);
    } else {
      res.status(400).json({ message: 'No valid records found in CSV' });
    }

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Error processing CSV file', error: error.message });
  }
});

router.get('/export', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ contactOwner: req.user.user._id })
      .populate('contactOwner', 'name');

    const fields = ['firstName', 'lastName', 'email', 'phoneNumber',
      'jobTitle', 'lifecycleStage', 'leadStatus', 'createdAt'];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(contacts);

    res.header('Content-Type', 'text/csv');
    res.attachment('contacts.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting contacts' });
  }
});

export default router;
import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import Deal from '../models/Deal.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all deals
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { owner: req.user.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const deals = await Deal.find(query).populate('contact');
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deals' });
  }
});


// Create new deal
router.post('/', auth, async (req, res) => {
  try {
    const deal = new Deal({
      ...req.body,
      owner: req.user.user._id
    });
    await deal.save();
    res.status(201).json(deal);
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error)
    res.status(500).json({ message: 'Error creating deal' });
  }
});

// Update deal
router.patch('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.user._id },
      req.body,
      { new: true }
    );
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating deal' });
  }
});


// Update deal
router.delete('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findOneAndDelete(
      { _id: req.params.id, owner: req.user.user._id },
      { new: true }
    );
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating deal' });
  }
});

// Import deals from CSV
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
          owner: req.user.user._id,
          amount: parseFloat(record.amount)
        });
      }
    });

    parser.on('end', async function() {
      try {
        const deals = await Deal.insertMany(records);
        res.json(deals);
      } catch (error) {
        res.status(500).json({ message: 'Error importing deals' });
      }
    });

    parser.write(req.file.buffer.toString());
    parser.end();
  } catch (error) {
    res.status(500).json({ message: 'Error processing CSV file' });
  }
});

export default router;
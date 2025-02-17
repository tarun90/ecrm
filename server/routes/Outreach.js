import express from 'express';
import Outreach from '../models/Outreach.js';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import auth from '../middleware/auth.js';

const router = express.Router();

// CSV Upload Middleware
const upload = multer({ dest: 'uploads/' });

// Create Outreach
router.post('/',auth, async (req, res) => {
  try {
    let createdBy = req?.user?.user?._id;
    let data = {
      ...req?.body,
      createdBy
    }
    const outreach = new Outreach(data);
    await outreach.save();
    res.status(201).send(outreach);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get All Outreaches
router.get('/', async (req, res) => {
  try {
    const outreaches = await Outreach.find()
      .populate('campaign', 'campaignName') // Populate campaign and retrieve only the name field
      .populate('region', 'regionName')   // Populate region and retrieve only the name field
      .populate('createdBy', 'name email') // Populate createdBy and retrieve name and email
      .populate('category', 'categoryName')
    res.status(200).send(outreaches);
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', error });
  }
});


// Update Outreach
router.put('/:id', async (req, res) => {
  try {
    const outreach = await Outreach.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send(outreach);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete Outreach
router.delete('/:id', async (req, res) => {
  try {
    await Outreach.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Outreach deleted' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Import CSV to Create Outreaches
router.post('/import',auth, upload.single('file'), (req, res) => {
  let results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
       
        const updatedResults = results.map(ele => ({
          ...ele,
          createdBy: req?.user?.user?._id, // Ensure safe access to nested properties
          region: req.body?.region,
          campaign: req.body?.campaign,
          category: req.body?.category
        }));
        // console.log(results)
        await Outreach.insertMany(updatedResults);
        fs.unlinkSync(req.file.path);
        res.status(201).send({ message: 'CSV Imported successfully' });
      } catch (error) {
        console.log(error)
        res.status(400).send(error);
      }
    });
});

// Assign Multiple Outreaches to User
router.post('/assign', async (req, res) => {
  const { outreachIds, userId } = req.body;
  try {
    await Outreach.updateMany(
      { _id: { $in: outreachIds } },
      { $set: { assignedTo: userId } }
    );
    res.status(200).send({ message: 'Outreaches assigned successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;

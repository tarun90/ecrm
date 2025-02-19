import express from 'express';
import Outreach from '../models/Outreach.js';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// CSV Upload Middleware
const upload = multer({ dest: 'uploads/' });

// Create Outreach
router.post('/', auth, async (req, res) => {
  try {
    console.log('hello');

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
router.get('/', auth, async (req, res) => {
  try {
    const user = req?.user?.user;
    
    // Get search string from query
    const { search } = req.query;

    // Base query
    let query = {};

    // Get user's department details
    const userWithDept = await User.findById(user._id).populate('department');

    // Department-based filtering
    if (userWithDept?.department?.name.toLowerCase() === 'lead generation') {
      query.createdBy = user._id;
    } else if (user.isRegionHead) {
      query.region = user.regionId;
    } else if (userWithDept.department.name.toLowerCase() === 'outreach team') {
      query.assignedTo = user._id;
    }

    // Add search filter if search string is provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Populate the relations first to search in their fields
      const outreaches = await Outreach.find(query)
        .populate('campaign', 'campaignName')
        .populate('region', 'regionName')
        .populate('createdBy', 'name email')
        .populate('category', 'categoryName')
        .populate('assignedTo', 'name');

      // Filter the populated results
      const filteredOutreaches = outreaches.filter(outreach => {
        return (
          outreach.campaign?.campaignName?.match(searchRegex) ||
          outreach.region?.regionName?.match(searchRegex) ||
          outreach.category?.categoryName?.match(searchRegex) ||
          outreach.createdBy?.name?.match(searchRegex) ||
          outreach.createdBy?.email?.match(searchRegex) ||
          outreach.assignedTo?.name?.match(searchRegex) ||
          outreach.status?.match(searchRegex) ||
          outreach.name?.match(searchRegex)
        );
      });

      return res.status(200).send(filteredOutreaches);
    }

    // If no search string, return all results based on department access
    const outreaches = await Outreach.find(query)
      .populate('campaign', 'campaignName')
      .populate('region', 'regionName')
      .populate('createdBy', 'name email')
      .populate('category', 'categoryName')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.status(200).send(outreaches);

  } catch (error) {
    console.error('Error fetching outreaches:', error);
    res.status(500).send({ message: 'Internal Server Error', error });
  }
});
//Get Data by id
router.get('/outreacbyid/:id', async (req, res) => {
  try {

    const outreaches = await Outreach.findById({_id:req.params.id})
      .populate('campaign', 'campaignName') // Populate campaign and retrieve only the name field
      .populate('region', 'regionName')   // Populate region and retrieve only the name field
      .populate('createdBy', 'name email') // Populate createdBy and retrieve name and email
      .populate('category', 'categoryName')
      
    res.status(200).json(outreaches);
    
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', error });
  }
});

//filter api


// ✅ GET /api/outreach/filter - Filtered Outreach API


// ✅ POST /api/outreach/filter - Outreach Filtering API
router.post("/filter", auth, async (req, res) => {
  try {
    const user = req?.user?.user;

    let query = {};

    // ✅ Get user's department details
    const userWithDept = await User.findById(user._id).populate("department");

    // ✅ Apply department-based filters
    if (userWithDept?.department?.name.toLowerCase() === "lead generation") {
      query.createdBy = user._id;
    } else if (user.isRegionHead) {
      query.region = user.regionId;
    } else if (userWithDept.department.name.toLowerCase() === "outreach team") {
      query.assignedTo = user._id;
    }

    // ✅ Extract filters from request body
    const { country, status, region, campaign, category, assignTo } = req.body;

    if (country) query.country = country;
    if (status) query.status = status;
    if (region) query.region = region;
    if (campaign) query.campaign = campaign;
    if (category) query.category = category;
    if (assignTo) query.assignedTo = assignTo;

    // ✅ Fetch filtered outreaches
    const outreaches = await Outreach.find(query)
      .populate("campaign", "campaignName")
      .populate("region", "regionName")
      .populate("createdBy", "name email")
      .populate("category", "categoryName")
      .populate("assignedTo", "name");

    res.status(200).json(outreaches);
  } catch (error) {
    console.error("Error filtering outreaches:", error);
    res.status(500).json({ message: "Internal Server Error", error });
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
router.post('/import', auth, upload.single('file'),async (req, res) => {
  const existingRecord = await Outreach.findOne({ 
    sourceFile: req.file.originalname 
  });

  if (existingRecord) {
    // Delete the uploaded file since we won't be using it
    fs.unlinkSync(req.file.path);
    return res.status(200).json({ 
      status: 400,
      message: 'A file with this name has already been imported. Please rename your file or upload a different file.' 
    });
  }
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
          category: req.body?.category,
          sourceFile: req.file.originalname
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
  const { outreachIds, sourceFile, userId } = req.body;
  
  try {
    let query;
    
    // Determine which type of assignment we're doing
    if (outreachIds && outreachIds.length > 0) {
      // Assign by specific IDs
      query = { _id: { $in: outreachIds } };
    } else if (sourceFile) {
      // Assign by source file name
      query = { sourceFile: sourceFile };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either outreachIds or sourceFile must be provided'
      });
    }

    // Perform the update
    const result = await Outreach.updateMany(
      query,
      { 
        $set: { 
          assignedTo: userId, 
          status: "Not Contacted" 
        } 
      }
    );

    // Return more detailed response
    res.status(200).json({
      success: true,
      message: 'Outreaches assigned successfully',
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });

  } catch (error) {
    console.error('Error in assign endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning outreaches',
      error: error.message
    });
  }
});

export default router;

import express from 'express';
import Outreach from '../models/Outreach.js';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import mongoose, { Mongoose } from 'mongoose';

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
    
    // Get pagination parameters and search string from query
    const { search, page = 1, pageSize = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // Base query
    let query = {};

    // Get user's department details
    const userWithDept = await User.findById(user._id).populate('department');

    // Department-based filtering
    if (userWithDept?.department?.name.toLowerCase() === 'lead generation') {
      query.createdBy = user._id;
    } else if (user?.isRegionHead) {
      query.region = user.regionId;
    } else if (userWithDept?.department?.name?.toLowerCase() === 'outreach team') {
      query.assignedTo = user._id;
    }

    // If search string is provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Get total count for pagination
      const outreaches = await Outreach.find(query)
        .populate('campaign', 'campaignName')
        .populate('region', 'regionName')
        .populate('createdBy', 'name email')
        // .populate('category', 'categoryName')
        .populate('assignedTo', 'name');

      // Filter the populated results
      const filteredOutreaches = outreaches.filter(outreach => {
        return (
          outreach.campaign?.campaignName?.match(searchRegex) ||
          outreach.region?.regionName?.match(searchRegex) ||
          // outreach.category?.categoryName?.match(searchRegex) ||
          outreach.createdBy?.name?.match(searchRegex) ||
          outreach.createdBy?.email?.match(searchRegex) ||
          outreach.assignedTo?.name?.match(searchRegex) ||
          outreach.status?.match(searchRegex) ||
          outreach.name?.match(searchRegex)
        );
      });

      // Apply pagination to filtered results
      const paginatedResults = filteredOutreaches.slice(skip, skip + limit);
      
      return res.status(200).json({
        success: true,
        data: paginatedResults,
        total: filteredOutreaches.length,
        currentPage: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(filteredOutreaches.length / limit)
      });
    }

    // If no search string, use MongoDB pagination
    const total = await Outreach.countDocuments(query);
    
    const outreaches = await Outreach.find(query)
      .populate('campaign', 'campaignName')
      .populate('region', 'regionName')
      .populate('createdBy', 'name email')
      // .populate('category', 'categoryName')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: outreaches,
      total,
      currentPage: parseInt(page),
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching outreaches:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error', 
      error: error.message 
    });
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
router.post('/import', auth, upload.single('file'), async (req, res) => {
  try {
    // Check for existing file first
    const existingRecord = await Outreach.findOne({ 
      sourceFile: req.file.originalname 
    });

    if (existingRecord) {
      fs.unlinkSync(req.file.path);
      return res.status(200).json({ 
        status: 400,
        message: 'A file with this name has already been imported. Please rename your file or upload a different file.' 
      });
    }

    // Read and process CSV
    let results = [];
    let skippedEmails = [];
    let duplicateEmailsInSheet = [];
    let skippedIncompleteRecords = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // Check data limit
    if (results.length > 500) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        status: 400,
        message: 'File exceeds the maximum limit of 500 records'
      });
    }

    // Create maps to track emails and their first occurrence
    const emailCount = new Map();
    const firstOccurrence = new Map(); // Store first occurrence of each email
    
    results.forEach((record, index) => {
      if (record.email) {
        if (!emailCount.has(record.email)) {
          // Store the first occurrence index
          firstOccurrence.set(record.email, index);
        }
        emailCount.set(record.email, (emailCount.get(record.email) || 0) + 1);
      }
    });

    // Process records and handle duplicates
    const processedResults = [];
    const seenEmails = new Set(); // Track processed emails within current batch

    for (const [index, record] of results.entries()) {
      // Check if at least one of email, phone, or linkedin is present
      const hasRequiredField = record.email || record.phone || record.linkedin;
      
      if (!hasRequiredField) {
        skippedIncompleteRecords.push({
          name: record.name || 'N/A',
          reason: 'Missing all required fields (email, phone, and linkedin)'
        });
        continue;
      }

      // If email is present, check for duplicates
      if (record.email) {
        // If it's a duplicate but not the first occurrence, skip it
        if (emailCount.get(record.email) > 1 && firstOccurrence.get(record.email) !== index) {
          duplicateEmailsInSheet.push(record.email);
          continue;
        }

        // Check if we've already processed this email in current batch
        if (seenEmails.has(record.email)) {
          continue;
        }

        // Check for existing email in database
        const existingEmail = await Outreach.findOne({ email: record.email });
        if (existingEmail) {
          skippedEmails.push(record.email);
          continue;
        }

        seenEmails.add(record.email);
      }

      processedResults.push({
        ...record,
        createdBy: req?.user?.user?._id,
        region: req.body?.region,
        campaign: req.body?.campaign,
        // category: req.body?.category,
        sourceFile: req.file.originalname
      });
    }

    // Insert valid records
    if (processedResults.length > 0) {
      await Outreach.insertMany(processedResults);
    }

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    // Send response with results
    res.status(201).json({
      message: 'CSV imported successfully',
      totalRecords: results.length,
      importedRecords: processedResults.length,
      skippedDuplicatesFromDB: skippedEmails.length,
      skippedDuplicatesInSheet: duplicateEmailsInSheet.length,
      skippedIncompleteRecords: skippedIncompleteRecords.length,
      details: {
        skippedEmailsFromDB: [...new Set(skippedEmails)], // Remove duplicates from list
        duplicateEmailsInSheet: [...new Set(duplicateEmailsInSheet)], // Remove duplicates from list
        skippedIncompleteRecords // List of records skipped due to missing required fields
      }
    });

  } catch (error) {
    // Clean up file in case of error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Import error:', error);
    res.status(400).json({
      status: 400,
      message: 'Error importing CSV',
      error: error.message
    });
  }
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


router.get('/analytics-data', auth, async (req, res) => {
  try {
    const user = req?.user?.user;
    if(!user.isSuperAdmin && !user.isRegionHead){
      res.status(401).json({ 
        message: 'You are not authorised to perform this action.', 
      });
    }
    const { search } = req.query;
    
    // Base query for department-based filtering
    let matchQuery = {};

    // Department-based filtering
    if (user.isRegionHead  && !user.isSuperAdmin) {
      matchQuery.region = new mongoose.Types.ObjectId(user.regionId);
    }

    const pipeline = [
      {
        $match: matchQuery
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaign',
          foreignField: '_id',
          as: 'campaignData'
        }
      },
      {
        $lookup: {
          from: 'regions',
          localField: 'region',
          foreignField: '_id',
          as: 'regionData'
        }
      },
      {
        $lookup: {
          from: 'notes',
          localField: '_id',
          foreignField: 'outreachId',
          as: 'notes'
        }
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$categoryData.categoryName', 0] },
          campaignName: { $arrayElemAt: ['$campaignData.campaignName', 0] },
          regionName: { $arrayElemAt: ['$regionData.regionName', 0] }
        }
      }
    ];

    // Add search condition if search parameter is provided
    if (search?.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { categoryName: { $regex: search, $options: 'i' } },
            { campaignName: { $regex: search, $options: 'i' } },
            { regionName: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add grouping and projection stages
    pipeline.push(
      {
        $group: {
          _id: {
            category: '$categoryName',
            campaign: '$campaignName',
            region: '$regionName'
          },
          totalData: { $sum: 1 },
          totalTouches: { $sum: { $size: '$notes' } }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id.category',
          campaign: '$_id.campaign',
          region: '$_id.region',
          totalData: 1,
          totalTouches: 1
        }
      }
    );

    const result = await Outreach.aggregate(pipeline);
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error fetching aggregated data:', error);
    res.status(500).json({ 
      message: 'Error fetching aggregated data', 
      error: error.message 
    });
  }
});

router.get('/user-campaign-data', auth, async (req, res) => {
  try {
    
    const user = req?.user?.user;
    if(!user.isSuperAdmin && !user.isRegionHead){
      res.status(401).json({ 
        message: 'You are not authorised to perform this action.', 
      });
    }
    const { search } = req.query;
    
    let matchQuery = {};
    if (user.isRegionHead  && !user.isSuperAdmin) {
      matchQuery.region = new mongoose.Types.ObjectId(user.regionId);
    }

    // Add condition to only include assigned data
    matchQuery.assignedTo = { $ne: null };

    const pipeline = [
      {
        $match: matchQuery
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaign',
          foreignField: '_id',
          as: 'campaignData'
        }
      },
      {
        $addFields: {
          userName: { $arrayElemAt: ['$userData.name', 0] },
          campaignName: { $arrayElemAt: ['$campaignData.campaignName', 0] }
        }
      }
    ];

    // Add search condition if search parameter is provided
    if (search?.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { userName: { $regex: search, $options: 'i' } },
            { campaignName: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Continue with grouping, projection and sorting
    pipeline.push(
      {
        $group: {
          _id: {
            user: '$userName',
            campaign: '$campaignName',
            assignedTo: '$assignedTo'
          },
          totalOutreach: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          userName: '$_id.user',
          campaignName: '$_id.campaign',
          totalOutreach: 1
        }
      },
      {
        $sort: {
          userName: 1,
          campaignName: 1
        }
      }
    );

    const result = await Outreach.aggregate(pipeline);
    let unassignedMatchQuery = {
      'outreaches': { $size: 0 },
      'isActive': true
    };

    if (user.isRegionHead && !user.isSuperAdmin) {
      unassignedMatchQuery.regionId = new mongoose.Types.ObjectId(user.regionId);
    }

    if (search?.trim()) {
      unassignedMatchQuery.name = { $regex: search, $options: 'i' };
    }
    // Modified unassigned users query to include search
    const unassignedUsersQuery = [
      {
        $lookup: {
          from: 'outreaches',
          localField: '_id',
          foreignField: 'assignedTo',
          as: 'outreaches'
        }
      },
      {
        $match: unassignedMatchQuery
      },
    ];  

    

    // Add search condition for unassigned users if search parameter exists
    if (search?.trim()) {
      unassignedUsersQuery.push({
        $match: {
          name: { $regex: search, $options: 'i' }
        }
      });
    }

    // Project unassigned users data
    unassignedUsersQuery.push({
      $project: {
        userName: '$name',
        campaignName: { $literal: "-" },
        totalOutreach: { $literal: 0 }
      }
    });

    const unassignedUsers = await User.aggregate(unassignedUsersQuery);
    const data = [...result, ...unassignedUsers];
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Error fetching user campaign data:', error);
    res.status(500).json({ 
      message: 'Error fetching user campaign data', 
      error: error.message 
    });
  }
});

export default router;

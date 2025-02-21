import express from 'express';
import Sales from '../models/Sales.js'; // Import the Sales model

const router = express.Router();

/** ----------------------------
 * @route    GET /api/sales
 * @desc     Get all Sales
 * ---------------------------- */
router.get('/', async (req, res) => {
  try {
    let { 
      page = 1, 
      pageSize = 10, 
      search = "", 
      status = "", 
      sales_date_range = null, 
      updated_date_range = null 
    } = req.query;

    page = parseInt(page);
    pageSize = parseInt(pageSize);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(pageSize) || pageSize < 1) pageSize = 10;

    const matchQuery = {};

    if (status) {
      matchQuery.status = status;
    }

    if (sales_date_range && Array.isArray(sales_date_range) && sales_date_range.length === 2) {
      const startDate = new Date(sales_date_range[0]);
      const endDate = new Date(sales_date_range[1]);

      if (!isNaN(startDate) && !isNaN(endDate)) {
        matchQuery.sales_date = { $gte: startDate, $lte: endDate };
      }
    }

    if (updated_date_range && Array.isArray(updated_date_range) && updated_date_range.length === 2) {
      const startUpdatedDate = new Date(updated_date_range[0]);
      const endUpdatedDate = new Date(updated_date_range[1]);

      if (!isNaN(startUpdatedDate) && !isNaN(endUpdatedDate)) {
        matchQuery.sales_updated_date = { $gte: startUpdatedDate, $lte: endUpdatedDate };
      }
    }

    const pipeline = [
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "company"
        }
      },
      { $unwind: "$company" },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { sales_number: { $regex: search, $options: "i" } },
            { "company.companyName": { $regex: search, $options: "i" } }
          ]
        }
      });
    }

    pipeline.push({ $match: matchQuery });

    pipeline.push({ $sort: { sales_number: 1 } });
    pipeline.push({ $skip: (page - 1) * pageSize });
    pipeline.push({ $limit: pageSize });

    const sales = await Sales.aggregate(pipeline);

    const total = await Sales.aggregate([
      ...pipeline.slice(0, pipeline.length - 3),
      { $count: "total" }
    ]);

    res.status(200).json({
      success: true,
      data: sales,
      currentPage: page,
      pageSize,
      total: total.length > 0 ? total[0].total : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/view/:id', async (req, res) => {
    try {
      const sale = await Sales.findById(req.params.id).populate('company');
      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
      }
      res.json(sale);
    } catch (error) {
      console.error('Error fetching sale:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

/** ----------------------------
 * @route    POST /api/sales
 * @desc     Create a Sale
 * ---------------------------- */
router.post('/', async (req, res) => {
  try {
    const newSale = new Sales(req.body);
    await newSale.save();
    res.status(201).json(newSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** ----------------------------
 * @route    GET /api/sales/:id
 * @desc     Get a single Sale by ID
 * ---------------------------- */
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id).populate('company', 'companyName');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** ----------------------------
 * @route    PUT /api/sales/:id
 * @desc     Update a Sale by ID
 * ---------------------------- */
router.put('/:id', async (req, res) => {
  try {
    const updatedSale = await Sales.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.status(200).json(updatedSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** ----------------------------
 * @route    DELETE /api/sales/:id
 * @desc     Delete a Sale by ID
 * ---------------------------- */
router.delete('/:id', async (req, res) => {
  try {
    const deletedSale = await Sales.findByIdAndDelete(req.params.id);

    if (!deletedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.status(200).json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** ----------------------------
 * @route    POST /api/sales/delete-multiple
 * @desc     Delete multiple Sales by IDs
 * ---------------------------- */
router.post('/delete-multiple', async (req, res) => {
  try {
    const { salesIds } = req.body;

    if (!salesIds || salesIds.length === 0) {
      return res.status(400).json({ message: 'No Sales IDs provided' });
    }

    const result = await Sales.deleteMany({ _id: { $in: salesIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No Sales found to delete' });
    }

    res.status(200).json({
      message: 'Sales deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

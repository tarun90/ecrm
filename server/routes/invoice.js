import express from 'express';
import Invoice from '../models/Invoice.js'; // Import the invoice model

const router = express.Router();

// Get all Invoices
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const total = await Invoice.countDocuments();
    const invoices = await Invoice.find().populate({ path: 'contact', select: 'firstName lastName' }).skip(skip).limit(pageSize);
    // const invoices = await Invoice.find().populate({
    //     path: 'contact', 
    //     select: 'firstName lastName' // Fetch only firstName and lastName
    //   });
    console.log(invoices, "Hello invoicesss");
    res.status(200).json({
      data: invoices,
      total,
      page,
      pageSize
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create an Invoice
router.post('/', async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single Invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer')
      .populate('created_by')
      .populate('updated_by');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an Invoice by ID
router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an Invoice by ID
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete multiple invoices by IDs
router.post('/delete-multiple', async (req, res) => {
  try {
    const { invoiceIds } = req.body;

    if (!invoiceIds || invoiceIds.length === 0) {
      return res.status(400).json({ message: 'No invoice IDs provided' });
    }

    // Use deleteMany to delete multiple invoices
    const result = await Invoice.deleteMany({ _id: { $in: invoiceIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No invoices found to delete' });
    }

    res.status(200).json({ message: 'Invoices deleted successfully', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

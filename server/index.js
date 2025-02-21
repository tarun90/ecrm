import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import dealRoutes from './routes/deals.js';
import contactRoutes from './routes/contacts.js';
import eventmanager from "./routes/eventmanager.js"
import createTaskRoutes from './routes/createTaskRoutes.js';
import productRoutes from './routes/products.js';
import invoiceRoutes from './routes/invoice.js';
import emails from './routes/emails.js';
import company from "./routes/Company.js"
import campaigns from "./routes/Campaigns.js"
import Regions from "./routes/Regions.js";
import Category from "./routes/Category.js";
import Department from "./routes/Department.js";
import Outreach from "./routes/Outreach.js";
import Users from "./routes/Users.js";
import noteRoutes from './routes/noteRoutes.js';
import Activities from "./routes/Activities.js";
import sourceFileRoutes from './routes/sourceFileRoutes.js';
import OutReach from './models/Outreach.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')})
  .catch((err) => console.error('MongoDB connection error:', err));



// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // set in your .env file
    pass: process.env.EMAIL_PASS, // set in your .env file
  },
});

// Verify email transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/events', eventmanager); 
app.use('/api', noteRoutes);
// app.use('/api/emails', emails); 


// Initialize task routes with the transporter dependency
const { router: taskRouter, checkReminders } = createTaskRoutes(transporter);

// Mount routes at /api/tasks
app.use('/api/tasks', taskRouter);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/emails', emails);
app.use('/api/company',company)
app.use('/api/campaign',campaigns)
app.use('/api/regions', Regions)
app.use('/api/categories',Category)
app.use('/api/outreach',Outreach);
app.use('/api/users',Users);
app.use('/api/dept',Department);
app.use('/api/activities',Activities);
app.use('/api', sourceFileRoutes);
// Start the reminder check every minute
// setInterval(checkReminders, 60 * 1000);
// Also run an initial check on startup
// checkReminders();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
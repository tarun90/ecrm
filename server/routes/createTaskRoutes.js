// routes/taskRoutes.js
import { Router } from 'express';
import Task from "../models/Task.js"
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';

const createTaskRoutes = (transporter) => {
  const router = Router();

  // Helper function: Check and send reminder for a single task
  async function checkReminderForTask(task) {
    if (task.status === 'Completed') {
      return;
    }

    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    console.log(timeDiff, ' - Task:', task);

    // Send reminder if task is due within 2 minutes
    if (timeDiff <= 120000 && timeDiff > 0) {
      console.log(`Sending reminder for task: ${task.name}`);
      const mailOptions = {
        from: `"Task Manager" <${process.env.EMAIL_USER}>`,
        to: 'dhruvi@elsner.com.au', // Update or use environment variable as needed
        subject: 'Urgent Task Reminder',
        text: `URGENT: Your task "${task.name}" is due in less than 2 minutes!
        
Due Date: ${dueDate.toLocaleString()}
Status: ${task.status}`,
        html: `
          <h2>URGENT: Task Due Soon!</h2>
          <p>Your task "<strong>${task.name}</strong>" is due in less than 2 minutes!</p>
          <p><strong>Due Date:</strong> ${dueDate.toLocaleString()}</p>
          <p><strong>Status:</strong> ${task.status}</p>
        `,
      };

      try {
        console.log('Sending email with options:', mailOptions);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  }

  // GET all tasks
  router.get('/', auth, async (req, res) => {
    try {
      const tasks = await Task.find({
        createdBy: new mongoose.Types.ObjectId(req?.user?.userId)
      });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // POST: Add a new task
  router.post('/', auth, async (req, res) => {
    // Create a new task, including a createdBy field if req.user exists
    const task = new Task({
      ...req.body,
      createdBy: req.user?.userId, // Corrected: use req.user?.userId instead of "req ? user?.userId"
    });

    try {
      const savedTask = await task.save();
      console.log('New task created:', savedTask);

      // Check and send immediate reminder if applicable
      await checkReminderForTask(savedTask);

      res.status(201).json(savedTask);
    } catch (err) {
      console.log("----", err)
      res.status(400).json({ message: err.message });
    }
  });


  // PUT: Update a task
  router.put('/:id', auth, async (req, res) => {
    try {
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Check if the updated task needs a reminder
      await checkReminderForTask(updatedTask);

      res.json(updatedTask);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // DELETE a task
  router.delete('/:id', auth, async (req, res) => {
    try {
      await Task.findByIdAndDelete(req.params.id);
      res.json({ message: 'Task deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // GET: Generate a report with filters
  router.get('/report', auth, async (req, res) => {
    const { owner, dueDate } = req.query;
    const filters = {};

    if (owner) {
      filters.owner = { $regex: new RegExp(owner, 'i') }; // Case-insensitive search
    }
    if (dueDate) {
      const formattedDueDate = new Date(dueDate);
      formattedDueDate.setHours(23, 59, 59, 999);
      filters.dueDate = { $lte: formattedDueDate };
    }
    console.log('Filters applied:', filters);

    try {
      const tasks = await Task.find(filters);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Function to check and send reminders for all pending tasks
  async function checkReminders() {
    console.log('Checking for tasks due soon...');
    try {
      const tasks = await Task.find({ status: { $ne: 'Completed' } });
      for (const task of tasks) {
        await checkReminderForTask(task);
      }
    } catch (error) {
      console.error('Error in reminder check:', error);
    }
  }

  // Export both the router and the reminder check function
  return { router, checkReminders };
};

export default createTaskRoutes;

// require('dotenv').config()
// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const { connectToMongo } = require("./helpers/mongoConnection");
// const api=require("./routes/index")
// const app = express();
// const colors = require('colors');

// app.use(cors());

// // Increase the payload size limit
// app.use(express.json({ limit: '10240mb' }));
// app.use(express.urlencoded({ limit: '10240mb', extended: true }));

// connectToMongo()

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use("/api",api);

// app.listen(process.env.PORT, () => {
//     console.log(`Server is running on http://localhost:${process.env.PORT}`.underline.brightBlue);
// });




// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const Task = require('./model/Task'); // Import the Task model
// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // MongoDB Connection
// mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log(err));

// // Email Transport (for reminders)
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // API Routes

// // Get all tasks
// app.get('/api/tasks', async (req, res) => {
//   try {
//     const tasks = await Task.find();
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Add a new task
// app.post('/api/tasks', async (req, res) => {
//   const task = new Task(req.body);
//   try {
//     const savedTask = await task.save();
//     res.status(201).json(savedTask);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// app.delete('/api/tasks/:id', async (req, res) => {
//     try {
//       await Task.findByIdAndDelete(req.params.id);
//       res.json({ message: 'Task deleted successfully' });
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });

// // Generate a report with filters
// app.get('/api/tasks/report', async (req, res) => {
//   const { owner, dueDate } = req.query;
//   const filters = {};
//   if (owner) filters.owner = owner;
//   if (dueDate) filters.dueDate = { $lte: new Date(dueDate) };

//   try {
//     const tasks = await Task.find(filters);
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Reminder Logic (runs every hour)
// const checkReminders = async () => {
//   const tasks = await Task.find({ status: { $ne: 'Completed' } });
//   const now = new Date();
//   tasks.forEach(task => {
//     const dueDate = new Date(task.dueDate);
//     const timeDiff = dueDate - now;
//     console.log(dueDate,"timeDiff",timeDiff ,24 * 60 * 60 * 1000)
//     if (timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0) {
//         // if ( timeDiff > 0) {
//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: task.owner,
//         subject: 'Task Reminder',
//         text: `Your task "${task.name}" is due in less than 24 hours.`,
//       };
//       transporter.sendMail(mailOptions, (err, info) => {
//         if (err) console.log(err);
//         else console.log('Email sent: ' + info.response);
//         return
//       });
//     }
//   });
// };

// // Run reminder check every hour
// setInterval(checkReminders, 60 * 60 * 1000);
// // setInterval(checkReminders, 60 );
// // checkReminders()

// const testTask = new Task({
//   name: "Test Reminder",
//   ownerEmail: "your-email@example.com",
//   dueDate: new Date(new Date().getTime() + 6 * 60 * 60 * 1000), // 6 hours from now
//   status: "Pending",
//   reminderSent: false,
// });




// // Start the server
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const Task = require('./model/Task'); 

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Nodemailer Transporter Setup
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "aakifkadiwala1995@gmail.com",  // Ensure you have this in .env file
    pass: "qnqy dbdf fgyi wxyh",  // Ensure you have this in .env file
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

// API Routes

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new task
app.post('/api/tasks', async (req, res) => {
  const task = new Task(req.body);
  try {
    const savedTask = await task.save();
    console.log('New task created:', savedTask);

    // Check and send immediate reminder if needed
    checkReminderForTask(savedTask);
    
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
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
    checkReminderForTask(updatedTask);
    
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate a report with filters
app.get('/api/tasks/report', async (req, res) => {
  const { owner, dueDate } = req.query;
  const filters = {};

  if (owner) {
    filters.owner = { $regex: new RegExp(owner, "i") }; // Case-insensitive search
  }

  if (dueDate) {
    const formattedDueDate = new Date(dueDate);
    formattedDueDate.setHours(23, 59, 59, 999);
    filters.dueDate = { $lte: formattedDueDate };
  }

  console.log("Filters applied:", filters);

  try {
    const tasks = await Task.find(filters);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Function to check and send reminder for a single task
async function checkReminderForTask(task) {
  if (task.status === 'Completed') {
    return;
  }

  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const timeDiff = dueDate.getTime() - now.getTime();
  console.log(timeDiff,"ggggg", task)
  
  if (timeDiff <= 120000 && timeDiff > 0) {
    console.log(`Sending reminder for task: ${task.name}`);

    const mailOptions = {
      from: `"Task Manager" <${process.env.EMAIL_USER}>`,
      to: "dhruvi@elsner.com.au",  // Ensure this is set in .env
      subject: 'Urgent Task Reminder',
      text: `URGENT: Your task "${task.name}" is due in less than 2 minutes!\n\nDue Date: ${dueDate.toLocaleString()}\nStatus: ${task.status}`,
      html: `
        <h2>URGENT: Task Due Soon!</h2>
        <p>Your task "<strong>${task.name}</strong>" is due in less than 2 minutes!</p>
        <p><strong>Due Date:</strong> ${dueDate.toLocaleString()}</p>
        <p><strong>Status:</strong> ${task.status}</p>
      `
    };

    try {
      console.log(mailOptions,"mailOptions")
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}

// Reminder Logic (runs every minute)
const checkReminders = async () => {
  console.log('Checking for tasks due soon...');
  try {
    const tasks = await Task.find({ status: { $ne: 'Completed' } });
    console.log(tasks,"tasks",Task)
    for (const task of tasks) {
      await checkReminderForTask(task);
    }
  } catch (error) {
    console.error('Error in reminder check:', error);
  }
};

// Run reminder check every minute
setInterval(checkReminders, 60 * 1000);

// Initial check when server starts
checkReminders();

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

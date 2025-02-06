import mongoose, { mongo } from 'mongoose';

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
});

const Task = mongoose.model('Task', taskSchema);

export default Task;

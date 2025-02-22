import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  outreachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outreach',
    required: true
  },
  contactMethod: [{
    type: String,
    enum: ['Email', 'Phone', 'IM', 'Linkedin'],
    required: true
  }],
  message: {
    type: String,
    required: true
  },
  reminderDate: {
    type: Date,
  },
  attachment: {
    filename: String,
    path: String,
    mimetype: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Note = mongoose.model('Note', noteSchema);

export default Note;

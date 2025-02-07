import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  location: String,
  attendees: [String],
  recurrence: String,
  eventId: String,
  reminders: {
    useDefault: Boolean,
    overrides: [{ method: String, minutes: Number }]
  },
  createdAt: { type: Date, default: Date.now },
  EventId : String
});

const Meeting = mongoose.model('Meeting', MeetingSchema);
export default Meeting;

// server/models/Contact.js
import mongoose from 'mongoose';


const contactSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: String,
  lastName: String,
  jobTitle: String,
  phoneNumber: String,
  lifecycleStage: String,
  leadStatus: String,
  contactOwner:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;

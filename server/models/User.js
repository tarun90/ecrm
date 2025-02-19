import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  department:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'departments',
    default:null
  },
  
  img: String,
  tokens: Object,
  lastLogin: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  isRegionHead: { type: Boolean, default: false },
  regionId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    default:null
  },
  
}, { timestamps: true });

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  const encryptedInputPassword = crypto
    .createHash("md5")
    .update(candidatePassword)
    .digest("hex");
  cb(null, encryptedInputPassword === this.password);
};


export default mongoose.model('User', userSchema);
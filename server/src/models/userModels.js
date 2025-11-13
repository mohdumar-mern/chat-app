import mongoose from 'mongoose'
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phone: { type: String , unique: true, sparse: true },
  avatar: { type: String },
  online: { type: Boolean, default: false },
  socketId: { type: String, default: null }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;

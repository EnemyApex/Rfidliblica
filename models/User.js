import mongoose from 'mongoose'
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  rfidUid: { type: String, unique: true, sparse: true }
})
export default mongoose.models.User || mongoose.model('User', UserSchema)

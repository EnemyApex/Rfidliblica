import mongoose from 'mongoose'
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rfidUid: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
  available: { type: Boolean, default: true }
})
export default mongoose.models.Book || mongoose.model('Book', BookSchema)

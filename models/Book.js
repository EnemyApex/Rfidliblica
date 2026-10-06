import mongoose from 'mongoose'
const BookSchema = new mongoose.Schema({
  title: String,
  author: String,
  rfidUid: { type: String, unique: true, sparse: true },
  available: { type: Boolean, default: true }
})
export default mongoose.models.Book || mongoose.model('Book', BookSchema)

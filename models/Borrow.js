import mongoose from 'mongoose'
const BorrowSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  borrowDate: { type: Date, default: Date.now }
})
export default mongoose.models.Borrow || mongoose.model('Borrow', BorrowSchema)

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Book from '@/models/Book'
import Borrow from '@/models/Borrow'

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end()
  await dbConnect()
  const { studentUid, bookUid } = req.body
  const student = await User.findOne({ rfidUid: studentUid })
  if(!student) return res.status(404).json({error:"Etudiant inconnu"})
  const book = await Book.findOne({ rfidUid: bookUid })
  if(!book) return res.status(404).json({error:"Livre inconnu"})
  await Borrow.create({ student: student._id, book: book._id, date: new Date() })
  await Book.findByIdAndUpdate(book._id, { available: false })
  res.status(200).json({success:true})
}

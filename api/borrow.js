import dbConnect from '../../lib/dbConnect.js'
import User from '../../models/User.js'
import Book from '../../models/Book.js'
import Borrow from '../../models/Borrow.js'

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'POST only'})
  await dbConnect()
  const { studentUid, bookUid } = req.body
  if(!studentUid || !bookUid) return res.status(400).json({error:'UID manquant'})
  
  const student = await User.findOne({ rfidUid: studentUid.toUpperCase().trim() })
  if(!student) return res.status(404).json({error:`Etudiant ${studentUid} introuvable`})
  
  const book = await Book.findOne({ rfidUid: bookUid.toUpperCase().trim() })
  if(!book) return res.status(404).json({error:`Livre ${bookUid} introuvable`})
  if(!book.available) return res.status(400).json({error:'Livre deja emprunte'})

  await Borrow.create({ student: student._id, book: book._id })
  book.available = false
  await book.save()
  return res.status(200).json({success:true})
}

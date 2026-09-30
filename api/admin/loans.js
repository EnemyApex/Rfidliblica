const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
let client;
async function getClient(){ if(!client){ client=new MongoClient(uri); await client.connect(); } return client; }

module.exports = async (req, res) => {
  const mongo = await getClient();
  const db = mongo.db();
  const students = await db.collection('students').find({}).toArray();
  const borrowedBooks = await db.collection('books').find({ disponible: false }).toArray();
  const history = await db.collection('transactions').find({}).sort({date:-1}).limit(50).toArray();
  
  const parEtudiant = students.map(stu => ({
    etudiant: stu,
    livresEmpruntes: borrowedBooks.filter(b => b.empruntePar === stu.uid),
    total: borrowedBooks.filter(b => b.empruntePar === stu.uid).length
  }));

  res.status(200).json({ parEtudiant, historique: history });
}

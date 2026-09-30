const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
let client;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});

  try {
    const { studentUid, bookUid } = req.body;
    const mongo = await getClient();
    const db = mongo.db();

    const student = await db.collection('students').findOne({ uid: studentUid });
    const book = await db.collection('books').findOne({ uid: bookUid });

    if (!student) return res.status(404).json({error:'Etudiant inconnu'});
    if (!book) return res.status(404).json({error:'Livre inconnu'});

    if (book.disponible !== false) {
      // EMPRUNT
      await db.collection('books').updateOne({ uid: bookUid }, { $set: { disponible: false, empruntePar: studentUid } });
      await db.collection('transactions').insertOne({ studentUid, bookUid, studentName: student.name, bookTitle: book.title, type: 'borrow', date: new Date() });
      return res.status(200).json({ success: true, action: 'borrow' });
    } else {
      // RETOUR
      await db.collection('books').updateOne({ uid: bookUid }, { $set: { disponible: true, empruntePar: null } });
      await db.collection('transactions').insertOne({ studentUid, bookUid, studentName: student.name, bookTitle: book.title, type: 'return', date: new Date() });
      return res.status(200).json({ success: true, action: 'return' });
    }
  } catch(e) {
    return res.status(500).json({error: e.message});
  }
}

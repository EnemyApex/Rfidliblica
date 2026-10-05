import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Pour que tu puisses tester dans le navigateur sans avoir 500
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, msg: "API borrow alive" });
  }

  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});

  try {
    const { studentUid, bookUid, uid } = req.body || {};
    // Ton ESP envoie parfois juste uid ou studentUid
    const finalStudentUid = studentUid || uid;
    const finalBookUid = bookUid;

    if (!finalStudentUid) {
      return res.status(400).json({error:'studentUid manquant'});
    }

    const mongo = await getClient();
    const db = mongo.db();

    const student = await db.collection('students').findOne({ uid: finalStudentUid });
    if (!student) return res.status(404).json({error:'Etudiant inconnu'});

    // Si l'ESP n'envoie qu'un badge étudiant (sans livre), on enregistre juste le passage
    if (!finalBookUid) {
       await db.collection('transactions').insertOne({ 
         studentUid: finalStudentUid, 
         studentName: student.name, 
         type: 'scan', 
         date: new Date() 
       });
       return res.status(200).json({ success: true, action: 'scan', student: student.name });
    }

    const book = await db.collection('books').findOne({ uid: finalBookUid });
    if (!book) return res.status(404).json({error:'Livre inconnu'});

    if (book.disponible !== false) {
      await db.collection('books').updateOne({ uid: finalBookUid }, { $set: { disponible: false, empruntePar: finalStudentUid } });
      await db.collection('transactions').insertOne({ studentUid: finalStudentUid, bookUid: finalBookUid, studentName: student.name, bookTitle: book.title, type: 'borrow', date: new Date() });
      return res.status(200).json({ success: true, action: 'borrow' });
    } else {
      await db.collection('books').updateOne({ uid: finalBookUid }, { $set: { disponible: true, empruntePar: null } });
      await db.collection('transactions').insertOne({ studentUid: finalStudentUid, bookUid: finalBookUid, studentName: student.name, bookTitle: book.title, type: 'return', date: new Date() });
      return res.status(200).json({ success: true, action: 'return' });
    }
  } catch(e) {
    console.error(e);
    return res.status(500).json({error: e.message});
  }
}

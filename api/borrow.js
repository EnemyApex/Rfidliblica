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
  if (req.method === 'GET') return res.status(200).json({ ok: true, msg: "API borrow alive" });
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});

  try {
    const { studentUid, bookUid, uid } = req.body || {};
    const finalStudentUid = (studentUid || uid || '').toString().toUpperCase().trim();
    const finalBookUid = (bookUid || '').toString().toUpperCase().trim();

    if (!finalStudentUid) return res.status(400).json({error:'studentUid manquant'});

    const mongo = await getClient();
    const db = mongo.db();

    // Cherche dans users PUIS students pour pas te bloquer
    let student = await db.collection('users').findOne({ uid: finalStudentUid });
    if(!student) student = await db.collection('students').findOne({ uid: finalStudentUid });
    if (!student) return res.status(404).json({error:`Etudiant ${finalStudentUid} inconnu - lie son badge dans admin.html`});

    if (!finalBookUid) {
       await db.collection('transactions').insertOne({ studentUid: finalStudentUid, studentName: student.name, type: 'scan', date: new Date() });
       return res.status(200).json({ success: true, action: 'scan', student: student.name });
    }

    const book = await db.collection('books').findOne({ uid: finalBookUid });
    if (!book) return res.status(404).json({error:`Livre ${finalBookUid} inconnu - crée le dans admin.html`});

    // TA LOGIQUE BORROW / RETURN - je la garde
    if (book.disponible !== false) {
      await db.collection('books').updateOne({ uid: finalBookUid }, { $set: { disponible: false, empruntePar: student.name, emprunteParUid: finalStudentUid } });
      await db.collection('transactions').insertOne({ studentUid: finalStudentUid, bookUid: finalBookUid, studentName: student.name, bookTitle: book.title, type: 'borrow', date: new Date() });
      return res.status(200).json({ success: true, action: 'borrow', message: `${book.title} emprunté par ${student.name}` });
    } else {
      await db.collection('books').updateOne({ uid: finalBookUid }, { $set: { disponible: true, empruntePar: null, emprunteParUid: null } });
      await db.collection('transactions').insertOne({ studentUid: finalStudentUid, bookUid: finalBookUid, studentName: student.name, bookTitle: book.title, type: 'return', date: new Date() });
      return res.status(200).json({ success: true, action: 'return', message: `${book.title} rendu par ${student.name}` });
    }
  } catch(e) {
    console.error(e);
    return res.status(500).json({error: e.message});
  }
}

import clientPromise from '../lib/mongodb.js';

export default async function handler(req,res){
 const client = await clientPromise;
 const db = client.db('rfid_db');
 const col = db.collection('books');

 if(req.method==='GET'){
  const books = await col.find({}).toArray();
  return res.json(books);
 }
 if(req.method==='POST'){
  try{
   const { uid, title, author } = req.body;
   if(!uid || !title) return res.status(400).json({error:'uid et title requis'});
   const cleanUid = uid.toUpperCase().trim();
   const exists = await col.findOne({ uid: cleanUid });
   if(exists) return res.status(400).json({error:'UID deja existant'});
   await col.insertOne({ uid: cleanUid, title: title.trim(), author: author?.trim()||'', disponible:true, empruntePar:null, createdAt:new Date() });
   return res.json({success:true});
  }catch(e){ return res.status(500).json({error:e.message}); }
 }
 if(req.method==='DELETE'){
  const uid = req.query.uid?.toUpperCase().trim();
  if(!uid) return res.status(400).json({error:'uid requis'});
  await col.deleteOne({ uid });
  return res.json({success:true});
 }
 return res.status(405).json({error:'method not allowed'});
}

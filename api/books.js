import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
let client;
async function getDb(){
  if(!client){ client = new MongoClient(uri); await client.connect(); }
  return client.db('rfid_db');
}
export default async function handler(req,res){
  try{
    const db = await getDb();
    const col = db.collection('books');
    if(req.method==='GET'){ const books = await col.find({}).toArray(); return res.json(books); }
    if(req.method==='POST'){
      const { uid, title, author } = req.body;
      if(!uid||!title) return res.status(400).json({error:'uid et titre requis'});
      const cleanUid = uid.toUpperCase().trim();
      if(await col.findOne({uid:cleanUid})) return res.status(400).json({error:'UID existe deja'});
      await col.insertOne({ uid:cleanUid, title:title.trim(), author:author||'', disponible:true, empruntePar:null, createdAt:new Date() });
      return res.json({success:true});
    }
    if(req.method==='DELETE'){
      const uid = (req.query.uid||'').toUpperCase().trim();
      await col.deleteOne({uid}); return res.json({success:true});
    }
    return res.status(405).json({error:'method not allowed'});
  }catch(e){ console.error(e); return res.status(500).json({error:e.message}); }
}

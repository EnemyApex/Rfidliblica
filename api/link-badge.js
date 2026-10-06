import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
let client;
async function getDb(){ if(!client){ client=new MongoClient(uri); await client.connect(); } return client.db('rfid_db'); }
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});
  try{
    const { email, uid } = req.body;
    if(!email||!uid) return res.status(400).json({error:'email et uid requis'});
    const db=await getDb();
    const r=await db.collection('users').updateOne({email:email.toLowerCase().trim()},{$set:{uid:uid.toUpperCase().trim()}});
    if(r.matchedCount===0) return res.status(404).json({error:'email introuvable'});
    return res.json({success:true});
  }catch(e){ return res.status(500).json({error:e.message}); }
}

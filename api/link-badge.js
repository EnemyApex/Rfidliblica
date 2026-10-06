import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
let client;
async function getDb(){ if(!client){ client=new MongoClient(uri); await client.connect(); } return client.db('rfid_db'); }

export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'POST only'});
 try{
  const { email, uid } = req.body;
  if(!email||!uid) return res.status(400).json({error:'email et uid requis'});
  const cleanUid = uid.toUpperCase().trim();
  const cleanEmail = email.trim().toLowerCase();
  
  const db = await getDb();
  const usersCol = db.collection('users');
  
  // cherche sans respecter maj/minuscule
  const result = await usersCol.updateOne(
    { email: { $regex: `^${cleanEmail}$`, $options: 'i' } },
    { $set: { uid: cleanUid } }
  );
  
  if(result.matchedCount===0){
    // debug : montre les emails qui existent vraiment
    const all = await usersCol.find({},{projection:{email:1}}).toArray();
    const list = all.map(u=>u.email).join(', ');
    return res.status(404).json({error:`email introuvable. Emails existants: ${list}`});
  }
  return res.json({success:true});
 }catch(e){ console.error(e); return res.status(500).json({error:e.message}); }
}

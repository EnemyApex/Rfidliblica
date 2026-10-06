import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
let client;
async function getDb(){ if(!client){ client=new MongoClient(uri); await client.connect(); } return client.db('rfid_db'); }

export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'POST only'});
 try{
  const { email, uid } = req.body;
  const cleanUid = uid.toUpperCase().trim();
  const cleanEmail = email.trim().toLowerCase();
  const db = await getDb();

  // upsert = si l'email n'existe pas, on le crée direct
  await db.collection('users').updateOne(
    { email: cleanEmail },
    { $set: { email: cleanEmail, uid: cleanUid, name: cleanEmail.split('@')[0] } },
    { upsert: true }
  );
  return res.json({success:true});
 }catch(e){ return res.status(500).json({error:e.message}); }
}

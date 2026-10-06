import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
let client;
async function getDb(){ if(!client){ client=new MongoClient(uri); await client.connect(); } return client.db('rfid_db'); }
export default async function handler(req,res){
  try{
    const db=await getDb();
    const users = await db.collection('users').find({}).toArray();
    return res.json(users);
  }catch(e){ return res.status(500).json({error:e.message}); }
}

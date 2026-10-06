import { MongoClient } from 'mongodb';
const uri=process.env.MONGODB_URI; let client;
async function getDb(){if(!client){client=new MongoClient(uri);await client.connect();}return client.db('rfid_db');}
export default async function handler(req,res){
 const {uid}=req.body; const db=await getDb();
 const user=await db.collection('users').findOne({uid:uid.toUpperCase().trim()});
 if(!user) return res.status(404).json({error:'Badge inconnu'});
 res.json({success:true,user,token:user.uid});
}

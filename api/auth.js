import { MongoClient } from 'mongodb';
const uri=process.env.MONGODB_URI; let client;
async function getDb(){if(!client){client=new MongoClient(uri);await client.connect();}return client.db('rfid_db');}
export default async function handler(req,res){
 const ADMIN_PASSWORD="overflowteam";
 if(req.headers['x-admin-key']!==ADMIN_PASSWORD) return res.status(401).json({error:'Non autorisé'});
 const db=await getDb();
 res.json({users:await db.collection('users').find({}).toArray(),books:await db.collection('books').find({}).toArray()});
}

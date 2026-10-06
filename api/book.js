import { MongoClient } from 'mongodb';let c;async function db(){if(!c){c=new MongoClient(process.env.MONGODB_URI);await c.connect()}return c.db('rfid_db')}
export default async function handler(req,res){const d=await db();res.json(await d.collection('books').find({}).toArray())}

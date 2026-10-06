import { MongoClient } from 'mongodb';let c;async function db(){if(!c){c=new MongoClient(process.env.MONGODB_URI);await c.connect()}return c.db('rfid_db')}
export default async function handler(req,res){const d=await db();const u=await d.collection('users').findOne({email:req.body.email});if(!u)return res.status(404).json({error:'User inconnu'});res.json({success:true,user:u})}

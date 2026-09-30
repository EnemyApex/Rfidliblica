import { MongoClient } from 'mongodb'; import bcrypt from 'bcryptjs';
let db=null; async function getDb(){
  if(!process.env.MONGODB_URI) throw new Error("MONGODB_URI manquant dans Vercel");
  if(db) return db; const c=new MongoClient(process.env.MONGODB_URI); await c.connect(); db=c.db('rfidlib'); return db;
}
export default async function handler(req,res){
  try{
    res.setHeader('Access-Control-Allow-Origin','*');
    if(req.method!=='POST') { 
      const d=await getDb(); const all=await d.collection('users').find({},{projection:{password:0}}).toArray(); return res.json(all);
    }
    const body=typeof req.body==='string'? JSON.parse(req.body) : req.body;
    const {action,email,password,name,rfidUid}=body||{};
    console.log("AUTH:",action,email);
    if(action==='updateRfid'){ const d=await getDb(); await d.collection('users').updateOne({email:email.toLowerCase()},{$set:{rfidUid:rfidUid.toUpperCase()}}); return res.json({ok:true}); }
    if(!email || !password || email.trim()==='' || password.trim()==='') return res.status(400).json({error:'Email + mdp requis'});
    
    const d=await getDb(); const users=d.collection('users');
    if(action==='register'){
      if(await users.findOne({email:email.toLowerCase().trim()})) return res.status(400).json({error:'Email déjà utilisé'});
      const hash=await bcrypt.hash(password,10);
      await users.insertOne({email:email.toLowerCase().trim(),password:hash,name:name||email.split('@')[0],rfidUid:'',createdAt:new Date()});
      return res.json({ok:true});
    }
    if(action==='login'){
      const u=await users.findOne({email:email.toLowerCase().trim()});
      if(!u) return res.status(400).json({error:'Utilisateur introuvable'});
      if(!await bcrypt.compare(password,u.password)) return res.status(400).json({error:'Mauvais mot de passe'});
      return res.json({ok:true,token:u.email,name:u.name,email:u.email});
    }
    return res.status(400).json({error:'Action invalide'});
  }catch(e){ console.error(e); return res.status(500).json({error:e.message}); }
}

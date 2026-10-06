import { MongoClient } from 'mongodb';
const uri=process.env.MONGODB_URI; let client;
async function getDb(){if(!client){client=new MongoClient(uri);await client.connect();}return client.db('rfid_db');}
export default async function handler(req,res){
 const db=await getDb(); const books=db.collection('books'); const users=db.collection('users'); const logs=db.collection('logs');
 const userToken=req.headers['x-user-token'];
 if(req.method==='POST'){
  if(!userToken) return res.status(401).json({error:'Badge non connecté'});
  const logged=await users.findOne({uid:userToken.toUpperCase().trim()});
  if(!logged) return res.status(401).json({error:'Session invalide'});
  if(req.body.userUid.toUpperCase().trim()!==userToken.toUpperCase().trim()) return res.status(403).json({error:'Badge différent'});
  const cleanBook=req.body.bookUid.toUpperCase().trim(); const book=await books.findOne({uid:cleanBook});
  if(!book) return res.status(404).json({error:'Livre inconnu'});
  let action,msg;
  if(book.disponible===false){await books.updateOne({uid:cleanBook},{$set:{disponible:true,empruntePar:null}});action='retour';msg=`Retour OK: ${book.title}`;}
  else{await books.updateOne({uid:cleanBook},{$set:{disponible:false,empruntePar:logged.email}});action='emprunt';msg=`Emprunt OK: ${book.title}`;}
  await logs.insertOne({userUid:logged.uid,userEmail:logged.email,bookUid:cleanBook,bookTitle:book.title,action,date:new Date()});
  return res.json({success:true,message:msg});
 }
 return res.json(await logs.find({}).sort({date:-1}).limit(20).toArray());
}

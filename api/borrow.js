import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
let client;
async function getDb(){ if(!client){ client=new MongoClient(uri); await client.connect(); } return client.db('rfid_db'); }

export default async function handler(req,res){
 try{
  const db = await getDb();
  const books = db.collection('books');
  const users = db.collection('users');
  const logs = db.collection('logs');

  if(req.method==='GET'){
   const all = await logs.find({}).sort({date:-1}).limit(20).toArray();
   return res.json(all);
  }

  if(req.method==='POST'){
   const { userUid, bookUid } = req.body;
   const cleanUser = userUid.toUpperCase().trim();
   const cleanBook = bookUid.toUpperCase().trim();

   const user = await users.findOne({ uid: cleanUser });
   if(!user) return res.status(404).json({error:'Badge user inconnu. Lie le dans admin.html'});

   const book = await books.findOne({ uid: cleanBook });
   if(!book) return res.status(404).json({error:'Livre inconnu. Cree le dans admin.html'});

   let action, message;
   if(book.disponible===false){
     // retour si c'est le même user qui rend, ou force retour
     await books.updateOne({uid:cleanBook},{$set:{disponible:true, empruntePar:null}});
     action='retour'; message=`Retour OK : ${book.title} rendu`;
   }else{
     await books.updateOne({uid:cleanBook},{$set:{disponible:false, empruntePar:user.email}});
     action='emprunt'; message=`Emprunt OK : ${book.title} par ${user.email}`;
   }

   await logs.insertOne({ userUid:cleanUser, userEmail:user.email, bookUid:cleanBook, bookTitle:book.title, action, date:new Date() });
   return res.json({success:true, message});
  }
  return res.status(405).json({error:'method not allowed'});
 }catch(e){ console.error(e); return res.status(500).json({error:e.message}); }
}

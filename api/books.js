const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
let client;
async function getClient(){ if(!client){ client=new MongoClient(uri); await client.connect(); } return client; }

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  if(req.method==='OPTIONS') return res.status(200).end();

  const db = (await getClient()).db();
  
  // AJOUT MANUEL
  if(req.method === 'POST'){
    try{
      const { uid, title, author } = req.body;
      if(!uid || !title) return res.status(400).json({error:'UID et Titre obligatoires'});

      const existe = await db.collection('books').findOne({ uid: uid.toUpperCase() });
      if(existe) return res.status(400).json({error:'Ce UID existe déjà'});

      const newBook = {
        uid: uid.toUpperCase().trim(),
        title: title.trim(),
        author: author || 'Inconnu',
        titre: title.trim(),
        disponible: true,
        empruntePar: null,
        createdAt: new Date()
      };
      await db.collection('books').insertOne(newBook);
      return res.status(200).json({success:true, book:newBook});
    }catch(e){ return res.status(500).json({error:e.message}) }
  }
}

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
let client;
async function getClient(){ if(!client){ client = new MongoClient(uri); await client.connect(); } return client; }

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});
  try{
    const { email, uid } = req.body;
    const finalUid = uid.toUpperCase().trim();
    const db = (await getClient()).db();
    const r = await db.collection('students').updateOne({ email: email.trim() }, { $set: { uid: finalUid, badge: finalUid } });
    if(r.matchedCount===0) return res.status(404).json({error:'Email introuvable'});
    return res.json({success:true});
  }catch(e){ return res.status(500).json({error:e.message}); }
}

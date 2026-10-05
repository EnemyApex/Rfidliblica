import { MongoClient } from 'mongodb'

export const dynamic = 'force-dynamic'

let client
let clientPromise

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI manquant dans .env')
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(process.env.MONGODB_URI)
  clientPromise = client.connect()
}

export async function GET() {
  return Response.json({ ok: true, msg: "API borrow alive - MongoDB ready" })
}

export async function POST(req) {
  try {
    const body = await req.json()
    const studentUid = body.studentUid || body.uid

    if (!studentUid) {
      return Response.json({ error: "studentUid manquant" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db() // ou client.db("rfidlib")
    const collection = db.collection("borrows")

    // Enregistre l'emprunt
    const result = await collection.insertOne({
      studentUid,
      createdAt: new Date(),
      source: "esp32"
    })

    console.log("Borrow OK:", studentUid)

    return Response.json({ ok: true, studentUid, id: result.insertedId })

  } catch (e) {
    console.error("ERREUR MONGO:", e)
    return Response.json({ error: e.message }, { status: 500 })
  }
}

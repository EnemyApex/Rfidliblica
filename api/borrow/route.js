// app/api/borrow/route.js
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // IMPORTANT: pas 'edge' si tu utilises Prisma

export async function GET() {
  // Pour tester dans ton navigateur comme sur ton screenshot
  return Response.json({ ok: true, message: "API borrow alive - use POST" });
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("BODY RECU:", body);

    const studentUid = body.studentUid || body.uid || body.tag;

    if (!studentUid) {
      return Response.json({ error: "studentUid manquant" }, { status: 400 });
    }

    // ICI TA LOGIQUE - je mets un exemple safe
    // const result = await prisma.borrow.create({ data: { studentUid } });

    return Response.json({ 
      ok: true, 
      studentUid,
      message: "Emprunt enregistré" 
    });

  } catch (e) {
    console.error("ERREUR BORROW:", e);
    // Au lieu de crasher en 500, on renvoie l'erreur pour que tu voies
    return Response.json({ 
      error: "Server error", 
      details: e.message,
      stack: e.stack 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

const BRIDGE = process.env.XHS_BRIDGE_URL ?? "http://localhost:8001";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { note_id, xsec_token, comment_text, cookies } = body;

  if (!note_id || !cookies) {
    return NextResponse.json({ error: "note_id and cookies required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BRIDGE}/note/engage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note_id, xsec_token: xsec_token ?? "", comment_text: comment_text ?? "", cookies }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      return NextResponse.json({ error: err.detail }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Bridge unavailable" }, { status: 503 });
  }
}

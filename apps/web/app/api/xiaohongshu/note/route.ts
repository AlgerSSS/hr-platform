import { NextRequest, NextResponse } from "next/server";

const BRIDGE = process.env.XHS_BRIDGE_URL ?? "http://localhost:8001";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { note_id, cookies } = body;

  if (!note_id || !cookies) {
    return NextResponse.json({ error: "note_id and cookies required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BRIDGE}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note_id, cookies }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Bridge unavailable" }, { status: 503 });
  }
}

import { NextRequest, NextResponse } from "next/server";

const BRIDGE = process.env.XHS_BRIDGE_URL ?? "http://localhost:8001";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // note_url: full XHS URL e.g. https://www.xiaohongshu.com/explore/<id>?xsec_token=...
  const { note_url, cookies } = body;

  if (!note_url || !cookies) {
    return NextResponse.json({ error: "note_url and cookies required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BRIDGE}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note_url, cookies }),
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

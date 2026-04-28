import { NextRequest, NextResponse } from "next/server";

const BRIDGE = process.env.XHS_BRIDGE_URL ?? "http://localhost:8001";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { query, page = 1, sort = "general", note_type = 0, cookies } = body;

  if (!cookies) {
    return NextResponse.json({ error: "cookies required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BRIDGE}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, page, page_size: 20, sort, note_type, cookies }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Bridge unavailable" }, { status: 503 });
  }
}

import { NextRequest, NextResponse } from "next/server";

const BRIDGE = process.env.XHS_BRIDGE_URL ?? "http://localhost:8001";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, user_url, cookies } = body;

  if ((!user_id && !user_url) || !cookies) {
    return NextResponse.json({ error: "user_id or user_url, and cookies required" }, { status: 400 });
  }

  try {
    const userRes = await fetch(`${BRIDGE}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user_id ?? "", cookies }),
    });

    const user = userRes.ok ? await userRes.json() : {};

    // Only fetch notes if we have a full user_url with xsec_token
    let notes = {};
    if (user_url) {
      const notesRes = await fetch(`${BRIDGE}/user/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_url, cookies }),
      });
      notes = notesRes.ok ? await notesRes.json() : {};
    }

    return NextResponse.json({ user, notes });
  } catch {
    return NextResponse.json({ error: "Bridge unavailable" }, { status: 503 });
  }
}

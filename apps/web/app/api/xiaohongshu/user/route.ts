import { NextRequest, NextResponse } from "next/server";

const BRIDGE = process.env.XHS_BRIDGE_URL ?? "http://localhost:8001";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, cookies } = body;

  if (!user_id || !cookies) {
    return NextResponse.json({ error: "user_id and cookies required" }, { status: 400 });
  }

  try {
    const [userRes, notesRes] = await Promise.all([
      fetch(`${BRIDGE}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, cookies }),
      }),
      fetch(`${BRIDGE}/user/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, cookies }),
      }),
    ]);

    const user = userRes.ok ? await userRes.json() : {};
    const notes = notesRes.ok ? await notesRes.json() : {};

    return NextResponse.json({ user, notes });
  } catch {
    return NextResponse.json({ error: "Bridge unavailable" }, { status: 503 });
  }
}

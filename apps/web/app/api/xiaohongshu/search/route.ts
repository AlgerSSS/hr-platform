import { NextRequest, NextResponse } from "next/server";

const BRIDGE = process.env.XHS_BRIDGE_URL ?? "http://localhost:8001";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { query, page = 1, sort_type = 0, note_type = 0, cookies } = body;

  if (!cookies) {
    return NextResponse.json({ error: "cookies required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BRIDGE}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, page, sort_type, note_type, cookies }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      return NextResponse.json({ error: err.detail ?? "搜索失败" }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Bridge unavailable — 请先启动 xhs-bridge 服务" }, { status: 503 });
  }
}

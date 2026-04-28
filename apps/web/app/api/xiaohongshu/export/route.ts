import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { candidates } = body as { candidates: unknown[] };

  if (!Array.isArray(candidates)) {
    return NextResponse.json({ error: "candidates array required" }, { status: 400 });
  }

  const payload = JSON.stringify(candidates, null, 2);
  return new NextResponse(payload, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="xhs-candidates-${Date.now()}.json"`,
    },
  });
}

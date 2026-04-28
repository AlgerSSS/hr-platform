import { NextResponse } from "next/server";
import { execBridge } from "@/lib/boss-bridge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const geekId = searchParams.get("geekId");
  const jobId = searchParams.get("jobId");
  const securityId = searchParams.get("securityId") ?? "";

  if (!geekId || !jobId) {
    return NextResponse.json({ ok: false, error: "geekId and jobId are required" }, { status: 400 });
  }

  const args = ["resume", geekId, "--job", jobId];
  if (securityId) args.push("--security-id", securityId);

  const result = await execBridge(args);
  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}

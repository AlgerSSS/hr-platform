import { NextResponse } from "next/server";
import { execBridge } from "@/lib/boss-bridge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") ?? "";
  const city = searchParams.get("city") ?? "上海";
  const page = searchParams.get("page") ?? "1";
  const jobId = searchParams.get("jobId") ?? "";

  if (!keyword.trim()) {
    return NextResponse.json({ ok: false, error: "keyword is required" }, { status: 400 });
  }

  const args = ["search", keyword, "--city", city, "--page", page];
  if (jobId) args.push("--job", jobId);

  const result = await execBridge(args);
  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}

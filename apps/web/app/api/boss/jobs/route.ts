import { NextResponse } from "next/server";
import { execBridge } from "@/lib/boss-bridge";

export async function GET() {
  const result = await execBridge(["jobs"]);
  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}

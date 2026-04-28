import { NextResponse } from "next/server";
import { execBridge } from "@/lib/boss-bridge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const job = searchParams.get("job") ?? "";
  const page = searchParams.get("page") ?? "1";

  const args = ["candidates"];
  if (job) args.push("--job", job);
  args.push("--page", page);

  const result = await execBridge(args);
  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}

import { NextResponse } from "next/server";
import { getUsageStats } from "@/lib/usageTracker";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = getUsageStats();
  return NextResponse.json({ success: true, data: stats });
}

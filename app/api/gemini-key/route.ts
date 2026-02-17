import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// This endpoint provides a temporary session for client-side Gemini upload
// The API key is sent to the client for direct upload to avoid server timeout
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "GEMINI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    apiKey: apiKey,
  });
}

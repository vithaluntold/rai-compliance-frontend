import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get API URL from environment variable
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'];
    if (!apiUrl) {
      return NextResponse.json(
        { error: "API URL not configured", status: "unhealthy" },
        { status: 500 },
      );
    }

    // Check backend health
    const response = await fetch(`${apiUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Health check failed", status: "unhealthy" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { documentId } = await params;
    const body = await request.json();
    
    // Get API URL from environment variable
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'];
    if (!apiUrl) {
      return NextResponse.json(
        { error: "API URL not configured" },
        { status: 500 },
      );
    }

    // Validate document with backend
    const response = await fetch(`${apiUrl}/documents/${documentId}/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Validation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to validate document" },
      { status: 500 },
    );
  }
}

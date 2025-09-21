import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ documentId: string }> },
) {
  try {
    // Get API URL from environment variable
    const backendUrl = process.env['NEXT_PUBLIC_API_URL'] || 'https://rai-compliance-backend.onrender.com';
    if (!backendUrl) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 },
      );
    }

    const { documentId } = await context.params;
    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${backendUrl}/api/v1/analysis/documents/${documentId}/results`);

    if (!response.ok) {
      throw new Error(`Error fetching extracted data: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

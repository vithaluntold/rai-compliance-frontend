import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ documentId: string }> },
) {
  try {
    // Get API URL from environment variable
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'];
    if (!apiUrl) {
      return NextResponse.json(
        { error: "API URL not configured" },
        { status: 500 },
      );
    }

    const { documentId } = await context.params;

    // Get and validate document ID
    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 },
      );
    }

    // Fetch checklist from backend
    const response = await fetch(`${apiUrl}/compliance/checklist/${documentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // If checklist doesn't exist yet, return empty array instead of 404
    if (response.status === 404) {
      return NextResponse.json([]);
    }

    if (!response.ok) {
      throw new Error(`Error fetching checklist data: ${response.statusText}`);
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

export async function POST(
  request: Request,
  context: { params: Promise<{ documentId: string }> },
) {
  try {
    // Get API URL from environment variable
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'];
    if (!apiUrl) {
      return NextResponse.json(
        { error: "API URL not configured" },
        { status: 500 },
      );
    }

    const { documentId } = await context.params;

    // Get and validate document ID
    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 },
      );
    }

    // Get request body
    const body = await request.json();

    // Update checklist in backend
    const response = await fetch(`${apiUrl}/compliance/checklist/${documentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error updating checklist: ${response.statusText}`);
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

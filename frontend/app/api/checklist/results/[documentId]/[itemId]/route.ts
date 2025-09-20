import {NextResponse} from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string; itemId: string }> },
) {
  try {
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'];
    if (!apiUrl) {
      throw new Error("API URL not configured");
    }

    const { documentId, itemId } = await params;
    if (!documentId || !itemId) {
      return NextResponse.json(
        { error: "Document ID and Item ID are required" },
        { status: 400 },
      );
    }

    const requestBody = await request.json();
    
    const response = await fetch(`${apiUrl}/checklist/results/${documentId}/${itemId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to update checklist item");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ documentId: string; itemId: string }> },
) {
  try {
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'];
    if (!apiUrl) {
      throw new Error("API URL not configured");
    }

    const { documentId, itemId } = await params;
    if (!documentId || !itemId) {
      return NextResponse.json(
        { error: "Document ID and Item ID are required" },
        { status: 400 },
      );
    }

    const requestBody = await request.json();
    
    const response = await fetch(`${apiUrl}/checklist/results/${documentId}/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to update checklist item");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 },
    );
  }
}

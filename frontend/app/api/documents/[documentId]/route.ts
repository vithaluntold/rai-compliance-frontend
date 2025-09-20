import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const backendUrl = process.env['NEXT_PUBLIC_API_URL'] || 'https://rai-compliance-backend.onrender.com';
  if (!backendUrl) {
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 },
    );
  }

  // Validate document ID
  const { documentId } = await params;
  if (!documentId) {
    return NextResponse.json(
      { error: "Document ID is required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${backendUrl}/api/v1/analysis/results/${documentId}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to fetch" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const backendUrl = process.env['NEXT_PUBLIC_API_URL'] || 'https://rai-compliance-backend.onrender.com';
  if (!backendUrl) {
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 },
    );
  }

  // Validate document ID
  const { documentId } = await params;
  if (!documentId) {
    return NextResponse.json(
      { error: "Document ID is required" },
      { status: 400 },
    );
  }

  try {
    // First check if document exists
    const checkResponse = await fetch(
      `${backendUrl}/api/v1/analysis/documents/${documentId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    if (!checkResponse.ok) {
      const error = await checkResponse.json().catch(() => ({ error: "Document not found" }));
      return NextResponse.json(error, { status: checkResponse.status });
    }

    // If document exists, proceed with deletion
    const response = await fetch(
      `${backendUrl}/api/v1/analysis/documents/${documentId}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to delete" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 },
    );
  }
}

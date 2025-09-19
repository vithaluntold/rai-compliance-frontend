import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rai-compliance-backend.onrender.com';
  if (!backendUrl) {
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(`${backendUrl}/api/v1/documents`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to fetch" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rai-compliance-backend.onrender.com';
  if (!backendUrl) {
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 },
    );
  }

  try {
    // Get the content type from the request
    const contentType = request.headers.get("content-type") || "";

    // Ensure we have a multipart form data request
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content type must be multipart/form-data" },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    
    const response = await fetch(`${backendUrl}/api/v1/analysis/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to upload" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 },
    );
  }
}

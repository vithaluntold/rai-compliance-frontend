import {NextResponse} from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'];
    if (!apiUrl) {
      throw new Error("API URL not configured");
    }

    const { documentId } = await params;
    
    const response = await fetch(`${apiUrl}/documents/${documentId}/company-details`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch company details");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch company details" },
      { status: 500 },
    );
  }
}

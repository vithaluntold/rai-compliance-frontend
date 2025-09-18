import {NextResponse} from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { documentId } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error("API URL not configured");
    }

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 },
      );
    }

    if (!response.ok) {

      throw new Error(error.detail || "Failed to fetch checklist results");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (__error) {
    return NextResponse.json(
      { error: "Failed to fetch checklist results" },
      { status: 500 },
    );
  }
}

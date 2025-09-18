import {NextResponse} from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string; itemId: string }> },
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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

    const body = await request.json();

    if (!response.ok) {

      throw new Error(error.detail || "Failed to update checklist item");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (__error) {
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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

    const body = await request.json();

    if (!response.ok) {

      throw new Error(error.detail || "Failed to update checklist item");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (__error) {
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 },
    );
  }
}

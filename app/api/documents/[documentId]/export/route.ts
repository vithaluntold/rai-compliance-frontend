import {NextResponse} from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { documentId } = await params;
    const data = await response.json();
    return NextResponse.json(data);
  } catch (__error) {
    return NextResponse.json(
      { error: "Failed to export document" },
      { status: 500 },
    );
  }
}

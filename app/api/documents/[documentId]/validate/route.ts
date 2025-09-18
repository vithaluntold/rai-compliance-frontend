import {NextResponse} from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { documentId } = await params;
    const body = await request.json();
    const data = await response.json();
    return NextResponse.json(data);
  } catch (__error) {
    return NextResponse.json(
      { error: "Failed to validate document" },
      { status: 500 },
    );
  }
}

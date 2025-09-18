import {NextResponse} from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ checklistType: string }> },
) {
  try {
    const { checklistType } = await params;
    const data = await response.json();
    return NextResponse.json(data);
  } catch (__error) {
    return NextResponse.json(
      { error: "Failed to fetch checklist items" },
      { status: 500 },
    );
  }
}

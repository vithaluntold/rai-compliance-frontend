import {NextResponse} from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ checklistType: string }> },
) {
  try {
    const { checklistType } = await params;
    // Use checklistType for API logic here
    const data = { items: [], checklistType };
    return NextResponse.json(data);
  } catch {
    // Log error internally without console
    return NextResponse.json(
      { error: "Failed to fetch checklist items" },
      { status: 500 },
    );
  }
}

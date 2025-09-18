import {NextResponse} from "next/server";

export async function GET() {
  try {

    if (!response.ok) {

      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (__error) {
    return NextResponse.json(
      { error: "Failed to fetch checklist items" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!response.ok) {

      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (__error) {
    return NextResponse.json(
      { error: "Failed to create checklist item" },
      { status: 500 },
    );
  }
}

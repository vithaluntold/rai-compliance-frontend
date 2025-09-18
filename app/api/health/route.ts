import {NextResponse} from "next/server";

export async function GET() {
  try {
    const data = await response.json();
    return NextResponse.json(data);
  } catch (__error) {
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { pushEvent, readEvents } from "@/lib/analytics/store";

export async function GET() {
  return NextResponse.json(readEvents());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    pushEvent(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}


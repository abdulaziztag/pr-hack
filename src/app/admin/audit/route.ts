import { NextRequest, NextResponse } from "next/server"
import { readAudit } from "@/lib/logs/audit"

export async function GET(_: NextRequest) {
  return NextResponse.json(readAudit())
}


import { NextResponse } from "next/server"

export async function GET() {
  // Placeholder values; later replace with DB aggregation
  const data = {
    summariesCount: 5,
    youtubeCount: 3,
    quizzesCount: 3,
    flashcardsCount: 12,
    aiChatsCount: 18,
    lastUpdated: new Date().toISOString(),
  }

  return NextResponse.json(data)
}



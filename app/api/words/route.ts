// app/api/words/route.ts
import { NextRequest, NextResponse } from "next/server"
import { addWords } from "@/lib/addWords"

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key")
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const words = Array.isArray(body) ? body : [body]

    const result = await addWords(words) // <-- call the helper
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to add words" }, { status: 500 })
  }
}

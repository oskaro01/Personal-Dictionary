// lib/addWords.ts
import clientPromise from "@/lib/mongodb"

export async function addWords(
  words: { word: string; definition: string }[]
): Promise<{ inserted: number; error?: string }> {
  const client = await clientPromise
  const db = client.db("mydictionary")
  const collection = db.collection("test")

  const formatted = words.map((w) => ({
    word: w.word.toLowerCase().trim(),
    definition: w.definition.trim(),
    created_at: new Date(),
  }))

  try {
    const result = await collection.insertMany(formatted, {
      ordered: false,
    })

    return { inserted: result.insertedCount }
  } catch (err: any) {
    if (err.code === 11000) {
      return { inserted: err.result?.nInserted || 0 }
    }

    return { inserted: 0, error: "Failed to add words" }
  }
}

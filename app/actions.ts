"use server"

import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache"

import { ObjectId } from "mongodb"

// TEMPORARY in-memory placeholder
// This lets the app run while we switch databases



type WordDoc = {
  _id: any
  word: string
  definition: string
  created_at: Date
}

// duplicate problem solve ,, note >> verify that in db >> word_1_definition_1 (UNIQUE)
export async function addWords(words: { word: string; definition: string }[]) {
  const client = await clientPromise
  const db = client.db("mydictionary")
  const collection = db.collection("test")

  const formatted = words.map(w => ({
    word: w.word.toLowerCase().trim(),
    definition: w.definition.trim(),
    created_at: new Date(),
  }))

  try {
    const result = await collection.insertMany(formatted, {
      ordered: false, // keep going even if some are duplicates
    })

    return { inserted: result.insertedCount }
  } catch (err: any) {
    // duplicate (word + definition) is OK
    if (err.code === 11000) {
      return { inserted: err.result?.nInserted || 0 }
    }
    throw err
  }
}


function similarity(a: string, b: string) {
  let matches = 0
  const len = Math.min(a.length, b.length)

  for (let i = 0; i < len; i++) {
    if (a[i] === b[i]) matches++
  }

  return matches
}


export async function searchWords(query: string) {
  const client = await clientPromise
  const db = client.db("mydictionary")

  const q = query.toLowerCase().trim()

  const words = (await db
    .collection("test")
    .find({})
    .toArray()) as WordDoc[]

  const ranked = words
    .map(w => ({
      ...w,
      score: similarity(q, w.word.toLowerCase()),
    }))
    .filter(w => w.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  return {
    data: ranked.map(w => ({
      id: w._id.toString(),
      word: w.word,
      definition: w.definition,
      created_at: w.created_at.toISOString(),
    }))
  }
}




export async function getRecentWords() {
  const client = await clientPromise
  const db = client.db("mydictionary")

  const words = await db
    .collection("test")
    .find({})
    .sort({ created_at: -1 })
    .limit(10)
    .toArray()

  return {
    data: words.map(w => ({
      id: w._id.toString(),
      word: w.word,
      definition: w.definition,
      created_at: w.created_at.toISOString(),
    }))
  }
}





export async function getWordsByIds(ids: string[]) {
  if (!ids || ids.length === 0) return { data: [] }

  // ✅ only keep valid Mongo ObjectIds
  const validIds = ids.filter(id => ObjectId.isValid(id))

  if (validIds.length === 0) return { data: [] }

  const client = await clientPromise
  const db = client.db("mydictionary")

  const objectIds = validIds.map(id => new ObjectId(id))

  const words = await db
    .collection("test")
    .find({ _id: { $in: objectIds } })
    .toArray()

  return {
    data: words.map(w => ({
      id: w._id.toString(),
      word: w.word,
      definition: w.definition,
      created_at: w.created_at.toISOString(),
    }))
  }
}



export async function getAllWords() {
  const client = await clientPromise
  const db = client.db("mydictionary")

  const data = await db
    .collection("test")
    .find({})
    .sort({ word: 1 })
    .toArray()

  return { data }
}




export async function testMongoConnection() {
  const client = await clientPromise;
  const db = client.db("mydictionary");

  const collections = await db.listCollections().toArray();

  return {
    ok: true,
    collections: collections.map(c => c.name),
  };
}
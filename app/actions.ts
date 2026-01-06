"use server"

import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache"

// TEMPORARY in-memory placeholder
// This lets the app run while we switch databases

let wordsStore: { id: string; word: string; definition: string; created_at: string }[] = []

type WordDoc = {
  _id: any
  word: string
  definition: string
  created_at: Date
}


export async function addWords(words: { word: string; definition: string }[]) {
  const client = await clientPromise
  const db = client.db("mydictionary")
  const collection = db.collection("test")

  const formatted = words.map(w => ({
    word: w.word.toLowerCase().trim(),
    definition: w.definition.trim(),
    created_at: new Date(),
  }))

  const result = await collection.insertMany(formatted)

  revalidatePath("/")
  return { count: result.insertedCount }
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
  const data = wordsStore.slice(0, 10)
  return { data }
}

export async function getWordsByIds(ids: string[]) {
  const data = wordsStore.filter((w) => ids.includes(w.id))
  return { data }
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
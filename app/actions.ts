"use server"

import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache"

// TEMPORARY in-memory placeholder
// This lets the app run while we switch databases

let wordsStore: { id: string; word: string; definition: string; created_at: string }[] = []

export async function addWords(words: { word: string; definition: string }[]) {
  const now = new Date().toISOString()

  const formatted = words.map((w) => ({
    id: crypto.randomUUID(),
    word: w.word.toLowerCase().trim(),
    definition: w.definition.trim(),
    created_at: now,
  }))

  wordsStore = [...formatted, ...wordsStore]

  revalidatePath("/")
  return { data: formatted, count: formatted.length }
}

export async function searchWords(query: string) {
  const q = query.toLowerCase().trim()

  const data = wordsStore.filter((w) => w.word.includes(q)).slice(0, 10)
  return { data }
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
  return { data: wordsStore.sort((a, b) => a.word.localeCompare(b.word)) }
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
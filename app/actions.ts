"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addWords(words: { word: string; definition: string }[]) {
  const supabase = await getSupabaseServerClient()

  const formattedWords = words.map((w) => ({
    word: w.word.toLowerCase().trim(),
    definition: w.definition.trim(),
  }))

  const { data, error } = await supabase
    .from("dictionary")
    .upsert(formattedWords, {
      onConflict: "word",
      ignoreDuplicates: false,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { data, count: data.length }
}

export async function searchWords(query: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("dictionary")
    .select("*")
    .ilike("word", `%${query.toLowerCase().trim()}%`)
    .order("word", { ascending: true })
    .limit(10)

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getRecentWords() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("dictionary")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getWordsByIds(ids: string[]) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("dictionary").select("*").in("id", ids)

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getAllWords() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("dictionary").select("*").order("word", { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

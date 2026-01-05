"use server"

import clientPromise from "@/lib/mongodb";

export async function testMongo() {
  const client = await clientPromise;
  const db = client.db("mydictionary");

  const collections = await db.listCollections().toArray();

  return {
    ok: true,
    collections: collections.map(c => c.name),
  };
}

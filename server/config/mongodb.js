import { MongoClient } from "mongodb";

let db = null;

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(process.env.MONGO_DB || "tiktok_gc01");

  // unique constraints (username & email) + follow uniqueness + feed sorting
  await Promise.all([
    db.collection("users").createIndex({ username: 1 }, { unique: true }),
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db
      .collection("follows")
      .createIndex({ followerId: 1, followingId: 1 }, { unique: true }),
    db.collection("follows").createIndex({ followingId: 1 }),
    db.collection("posts").createIndex({ createdAt: -1 }),
  ]);

  return db;
}

export function getDB() {
  if (!db) throw new Error("Database is not connected yet");
  return db;
}

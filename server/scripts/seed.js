// npm run seed  -> wipes users/posts/follows and inserts a small TikTok-style demo set
import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/mongodb.js";
import { cache } from "../config/redis.js";

const db = await connectDB();
await Promise.all(["users", "posts", "follows"].map((c) => db.collection(c).deleteMany({})));

const now = Date.now();
const pw = bcrypt.hashSync("12345", 10);
const mk = (name, username) => ({
  name, username, email: `${username}@mail.com`, password: pw,
  createdAt: new Date(now), updatedAt: new Date(now),
});

const { insertedIds } = await db.collection("users").insertMany([
  mk("Calvin", "calvin"),
  mk("Nadia Putri", "nadiaputri"),
  mk("Dimas Chef", "dimaschef"),
  mk("Rara Dance", "raradance"),
]);
const [calvin, nadia, dimas, rara] = Object.values(insertedIds);

const minutesAgo = (m) => new Date(now - m * 60000);
const post = (authorId, content, tags, seed, m, likes = [], comments = []) => ({
  content, tags, imgUrl: `https://picsum.photos/seed/${seed}/720/1280`, authorId,
  likes: likes.map((u) => ({ username: u, createdAt: minutesAgo(m), updatedAt: minutesAgo(m) })),
  comments: comments.map(([username, content]) => ({ username, content, createdAt: minutesAgo(m), updatedAt: minutesAgo(m) })),
  createdAt: minutesAgo(m), updatedAt: minutesAgo(m),
});

await db.collection("posts").insertMany([
  post(rara, "New choreo dropped, who can do it in one take?", ["dance", "fyp"], "dance", 5, ["calvin", "dimaschef"], [["calvin", "Too clean 🔥"]]),
  post(dimas, "3-ingredient nasi goreng in 60 seconds", ["food", "recipe"], "food", 40, ["nadiaputri"], [["nadiaputri", "Trying this tonight"]]),
  post(nadia, "Golden hour in Jakarta never misses", ["travel", "jakarta"], "city", 120, ["calvin"]),
  post(calvin, "My first post on this app!", ["hello"], "hello", 300),
]);

const follow = (followerId, followingId) => ({ followerId, followingId, createdAt: new Date(now), updatedAt: new Date(now) });
await db.collection("follows").insertMany([
  follow(calvin, rara), follow(calvin, dimas), follow(nadia, calvin), follow(dimas, calvin),
]);

await cache.del("tiktok:posts");
console.log("Seeded. Login with any of: calvin / nadiaputri / dimaschef / raradance  (password: 12345)");
process.exit(0);

import bcrypt from "bcryptjs";
import { getDB } from "../config/mongodb.js";
import { badInput } from "../helpers/errors.js";
import { toObjectId } from "../helpers/objectId.js";

const col = () => getDB().collection("users");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// never expose password
const PUBLIC_USER = { _id: 1, name: 1, username: 1 };

export default class User {
  // MongoDB 1: Add User (register)
  static async register({ name, username, email, password }) {
    username = (username || "").trim().toLowerCase();
    email = (email || "").trim().toLowerCase();
    name = (name || "").trim() || username;

    if (!username) throw badInput("Username is required");
    if (!email) throw badInput("Email is required");
    if (!EMAIL_RE.test(email)) throw badInput("Invalid email format");
    if (!password) throw badInput("Password is required");
    if (password.length < 5)
      throw badInput("Password must be at least 5 characters");

    if (await col().findOne({ username }))
      throw badInput("Username is already taken");
    if (await col().findOne({ email }))
      throw badInput("Email is already registered");

    const now = new Date();
    const doc = {
      name,
      username,
      email,
      password: bcrypt.hashSync(password, 10),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const { insertedId } = await col().insertOne(doc);
      return { _id: insertedId, name, username, email };
    } catch (err) {
      if (err.code === 11000) throw badInput("Username or email already used");
      throw err;
    }
  }

  // MongoDB 1: Login User by username & password
  static async login(username, password) {
    username = (username || "").trim().toLowerCase();
    if (!username || !password)
      throw badInput("Username and password are required");

    const user = await col().findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password))
      throw badInput("Invalid username or password");

    return { _id: user._id, name: user.name, username: user.username, email: user.email };
  }

  static async findById(id) {
    return col().findOne({ _id: toObjectId(id, "user id") }, { projection: PUBLIC_USER });
  }

  // MongoDB 1: Search Users by name/username (partial & case-insensitive)
  static async search(keyword) {
    keyword = (keyword || "").trim();
    if (!keyword) return [];
    const regex = new RegExp(escapeRegex(keyword), "i");
    return col()
      .find({ $or: [{ name: regex }, { username: regex }] }, { projection: PUBLIC_USER })
      .limit(20)
      .toArray();
  }

  // MongoDB 1 + 2: Get User by Id, with followers & followings via $lookup
  static async findByIdWithFollows(id) {
    const _id = toObjectId(id, "user id");

    // joins `follows` and then `users` so we get the people's name/username
    const relation = (matchField, joinField) => [
      {
        $lookup: {
          from: "follows",
          let: { uid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: [`$${matchField}`, "$$uid"] } } },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "users",
                localField: joinField,
                foreignField: "_id",
                as: "person",
              },
            },
            { $unwind: "$person" },
            { $replaceRoot: { newRoot: "$person" } },
            { $project: PUBLIC_USER },
          ],
          as: matchField === "followingId" ? "followers" : "followings",
        },
      },
    ];

    const [user] = await col()
      .aggregate([
        { $match: { _id } },
        ...relation("followingId", "followerId"), // who follows me
        ...relation("followerId", "followingId"), // who I follow
        { $project: { password: 0, createdAt: 0, updatedAt: 0 } },
      ])
      .toArray();

    return user || null;
  }
}

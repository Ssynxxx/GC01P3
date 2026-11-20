import { getDB } from "../config/mongodb.js";
import { badInput, notFound } from "../helpers/errors.js";
import { toObjectId } from "../helpers/objectId.js";

const col = () => getDB().collection("posts");

// MongoDB 2: join the author (users) into every post
const withAuthor = [
  {
    $lookup: {
      from: "users",
      localField: "authorId",
      foreignField: "_id",
      as: "author",
      pipeline: [{ $project: { _id: 1, name: 1, username: 1 } }],
    },
  },
  { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
];

const cleanTags = (tags) =>
  [
    ...new Set(
      (tags || [])
        .map((t) => String(t).trim().replace(/^#+/, "").toLowerCase())
        .filter(Boolean)
    ),
  ].slice(0, 10);

export default class Post {
  // MongoDB 1: Get Posts, newest first (+ author name)
  static async findAll() {
    return col()
      .aggregate([{ $sort: { createdAt: -1 } }, ...withAuthor])
      .toArray();
  }

  // MongoDB 1 + 2: Get Post by Id (+ author name)
  static async findById(id) {
    const [post] = await col()
      .aggregate([{ $match: { _id: toObjectId(id, "post id") } }, ...withAuthor])
      .toArray();
    return post || null;
  }

  // MongoDB 1: Add Post
  static async create({ content, tags, imgUrl, authorId }) {
    content = (content || "").trim();
    if (!content) throw badInput("Content is required");

    const now = new Date();
    const { insertedId } = await col().insertOne({
      content,
      tags: cleanTags(tags),
      imgUrl: (imgUrl || "").trim(),
      authorId,
      comments: [],
      likes: [],
      createdAt: now,
      updatedAt: now,
    });
    return Post.findById(insertedId);
  }

  // MongoDB 1: Comment Post (embedded document)
  static async addComment(postId, { content, username }) {
    content = (content || "").trim();
    if (!content) throw badInput("Comment content is required");

    const now = new Date();
    const { matchedCount } = await col().updateOne(
      { _id: toObjectId(postId, "post id") },
      {
        $push: { comments: { content, username, createdAt: now, updatedAt: now } },
        $set: { updatedAt: now },
      }
    );
    if (!matchedCount) throw notFound("Post not found");
    return Post.findById(postId);
  }

  // MongoDB 1: Like Post (embedded document). Liking again removes the like.
  static async toggleLike(postId, username) {
    const _id = toObjectId(postId, "post id");
    if (!(await col().findOne({ _id }, { projection: { _id: 1 } })))
      throw notFound("Post not found");

    const now = new Date();
    const { modifiedCount } = await col().updateOne(
      { _id, "likes.username": { $ne: username } },
      { $push: { likes: { username, createdAt: now, updatedAt: now } } }
    );
    if (!modifiedCount) {
      await col().updateOne({ _id }, { $pull: { likes: { username } } });
    }
    return Post.findById(postId);
  }
}

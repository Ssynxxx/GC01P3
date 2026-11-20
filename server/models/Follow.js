import { getDB } from "../config/mongodb.js";
import { badInput, notFound } from "../helpers/errors.js";
import { toObjectId } from "../helpers/objectId.js";

const col = () => getDB().collection("follows");

export default class Follow {
  // followerId  = the user who presses "Follow"
  // followingId = the user who is being followed
  static async follow(followerId, followingIdRaw) {
    const followingId = toObjectId(followingIdRaw, "user id");

    if (followerId.equals(followingId))
      throw badInput("You can't follow yourself");

    const target = await getDB().collection("users").findOne({ _id: followingId });
    if (!target) throw notFound("User not found");

    if (await col().findOne({ followerId, followingId }))
      throw badInput("You already follow this user");

    const now = new Date();
    const doc = { followingId, followerId, createdAt: now, updatedAt: now };
    try {
      const { insertedId } = await col().insertOne(doc);
      return { _id: insertedId, ...doc };
    } catch (err) {
      if (err.code === 11000) throw badInput("You already follow this user");
      throw err;
    }
  }
}

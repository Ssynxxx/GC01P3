import { ObjectId } from "mongodb";
import { badInput } from "./errors.js";

export function toObjectId(id, label = "id") {
  if (!ObjectId.isValid(id)) throw badInput(`Invalid ${label}`);
  return new ObjectId(id);
}

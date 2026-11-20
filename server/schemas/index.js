import * as user from "./user.js";
import * as post from "./post.js";
import * as follow from "./follow.js";

const modules = [user, post, follow];

export const typeDefs = modules.map((m) => m.typeDefs);

export const resolvers = {
  Query: Object.assign({}, ...modules.map((m) => m.resolvers.Query)),
  Mutation: Object.assign({}, ...modules.map((m) => m.resolvers.Mutation)),
  User: user.resolvers.User,
  Post: post.resolvers.Post,
  Comment: post.resolvers.Comment,
  Like: post.resolvers.Like,
  Follow: follow.resolvers.Follow,
};

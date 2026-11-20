import Follow from "../models/Follow.js";
import { unauthenticated } from "../helpers/errors.js";

const iso = (d) => (d instanceof Date ? d.toISOString() : d);

export const typeDefs = `#graphql
  type Follow {
    _id: ID!
    followingId: ID!
    followerId: ID!
    createdAt: String
    updatedAt: String
  }

  extend type Mutation {
    followUser(followingId: ID!): Follow
  }
`;

export const resolvers = {
  Mutation: {
    followUser: async (_, { followingId }, { user }) => {
      if (!user) throw unauthenticated();
      return Follow.follow(user._id, followingId);
    },
  },
  Follow: {
    createdAt: (f) => iso(f.createdAt),
    updatedAt: (f) => iso(f.updatedAt),
  },
};

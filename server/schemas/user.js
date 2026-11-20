import User from "../models/User.js";
import { signToken } from "../helpers/jwt.js";
import { notFound, unauthenticated } from "../helpers/errors.js";

export const typeDefs = `#graphql
  type User {
    _id: ID
    name: String
    username: String
    email: String
    followers: [User]
    followings: [User]
    followersCount: Int
    followingsCount: Int
  }

  type LoginResponse {
    accessToken: String!
    user: User!
  }

  input RegisterInput {
    name: String
    username: String!
    email: String!
    password: String!
  }

  type Query {
    searchUsers(keyword: String!): [User]
    getUserById(id: ID!): User
  }

  type Mutation {
    register(input: RegisterInput!): User
    login(username: String!, password: String!): LoginResponse
  }
`;

export const resolvers = {
  Query: {
    searchUsers: async (_, { keyword }, { user }) => {
      if (!user) throw unauthenticated();
      return User.search(keyword);
    },
    getUserById: async (_, { id }, { user }) => {
      if (!user) throw unauthenticated();
      const found = await User.findByIdWithFollows(id);
      if (!found) throw notFound("User not found");
      return found;
    },
  },
  Mutation: {
    register: (_, { input }) => User.register(input),
    login: async (_, { username, password }) => {
      const user = await User.login(username, password);
      const accessToken = signToken({ id: user._id.toString(), username: user.username });
      return { accessToken, user };
    },
  },
  User: {
    followers: (u) => u.followers ?? [],
    followings: (u) => u.followings ?? [],
    followersCount: (u) => u.followers?.length ?? 0,
    followingsCount: (u) => u.followings?.length ?? 0,
  },
};

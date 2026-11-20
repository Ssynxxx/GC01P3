import Post from "../models/Post.js";
import { cache } from "../config/redis.js";
import { notFound, unauthenticated } from "../helpers/errors.js";

const POSTS_CACHE_KEY = "tiktok:posts";
const iso = (d) => (d instanceof Date ? d.toISOString() : d);

export const typeDefs = `#graphql
  type Comment {
    content: String!
    username: String!
    createdAt: String
    updatedAt: String
  }

  type Like {
    username: String!
    createdAt: String
    updatedAt: String
  }

  type Post {
    _id: ID!
    content: String!
    tags: [String]
    imgUrl: String
    authorId: ID!
    author: User
    comments: [Comment]
    likes: [Like]
    commentsCount: Int
    likesCount: Int
    createdAt: String
    updatedAt: String
  }

  input AddPostInput {
    content: String!
    tags: [String]
    imgUrl: String
  }

  extend type Query {
    getPosts: [Post]
    getPostById(id: ID!): Post
  }

  extend type Mutation {
    addPost(input: AddPostInput!): Post
    commentPost(postId: ID!, content: String!): Post
    likePost(postId: ID!): Post
  }
`;

const auth = (ctx) => {
  if (!ctx.user) throw unauthenticated();
  return ctx.user;
};

export const resolvers = {
  Query: {
    // Redis: cache Get Posts
    getPosts: async (_, __, ctx) => {
      auth(ctx);
      const cached = await cache.get(POSTS_CACHE_KEY);
      if (cached) return cached;

      const posts = await Post.findAll();
      await cache.set(POSTS_CACHE_KEY, posts, 300);
      return posts;
    },
    getPostById: async (_, { id }, ctx) => {
      auth(ctx);
      const post = await Post.findById(id);
      if (!post) throw notFound("Post not found");
      return post;
    },
  },
  Mutation: {
    // Redis: invalidate the cached list whenever a post is added…
    addPost: async (_, { input }, ctx) => {
      const user = auth(ctx);
      const post = await Post.create({ ...input, authorId: user._id });
      await cache.del(POSTS_CACHE_KEY);
      return post;
    },
    // …or changed (comments / likes are shown in the feed too)
    commentPost: async (_, { postId, content }, ctx) => {
      const user = auth(ctx);
      const post = await Post.addComment(postId, { content, username: user.username });
      await cache.del(POSTS_CACHE_KEY);
      return post;
    },
    likePost: async (_, { postId }, ctx) => {
      const user = auth(ctx);
      const post = await Post.toggleLike(postId, user.username);
      await cache.del(POSTS_CACHE_KEY);
      return post;
    },
  },
  Post: {
    likesCount: (p) => p.likes?.length ?? 0,
    commentsCount: (p) => p.comments?.length ?? 0,
    comments: (p) => p.comments ?? [],
    likes: (p) => p.likes ?? [],
    createdAt: (p) => iso(p.createdAt),
    updatedAt: (p) => iso(p.updatedAt),
  },
  Comment: {
    createdAt: (c) => iso(c.createdAt),
    updatedAt: (c) => iso(c.updatedAt),
  },
  Like: {
    createdAt: (l) => iso(l.createdAt),
    updatedAt: (l) => iso(l.updatedAt),
  },
};

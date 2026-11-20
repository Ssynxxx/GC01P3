import { gql } from "@apollo/client";

const POST_CARD = `
  _id
  content
  tags
  imgUrl
  authorId
  author { _id name username }
  likesCount
  commentsCount
  likes { username }
  createdAt
`;

// ---------- Queries ----------
export const GET_POSTS = gql`
  query GetPosts {
    getPosts { ${POST_CARD} }
  }
`;

export const GET_POST_BY_ID = gql`
  query GetPostById($id: ID!) {
    getPostById(id: $id) {
      ${POST_CARD}
      comments { content username createdAt }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($keyword: String!) {
    searchUsers(keyword: $keyword) { _id name username }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      _id
      name
      username
      followersCount
      followingsCount
      followers { _id name username }
      followings { _id name username }
    }
  }
`;

// ---------- Mutations ----------
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) { _id name username email }
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
      user { _id name username }
    }
  }
`;

export const ADD_POST = gql`
  mutation AddPost($input: AddPostInput!) {
    addPost(input: $input) { _id }
  }
`;

export const COMMENT_POST = gql`
  mutation CommentPost($postId: ID!, $content: String!) {
    commentPost(postId: $postId, content: $content) {
      _id
      commentsCount
      comments { content username createdAt }
    }
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      _id
      likesCount
      likes { username }
    }
  }
`;

export const FOLLOW_USER = gql`
  mutation FollowUser($followingId: ID!) {
    followUser(followingId: $followingId) { _id }
  }
`;

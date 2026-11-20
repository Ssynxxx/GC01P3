import { GraphQLError } from "graphql";

const make = (message, code) =>
  new GraphQLError(message, { extensions: { code } });

export const badInput = (message) => make(message, "BAD_USER_INPUT");
export const unauthenticated = (message = "Please login first") =>
  make(message, "UNAUTHENTICATED");
export const notFound = (message) => make(message, "NOT_FOUND");

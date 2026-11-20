import { storage } from "./storage";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

export const TOKEN_KEY = "accessToken";
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const httpLink = createHttpLink({ uri: API_URL });

// attach `Authorization: Bearer <token>` to every request
const authLink = setContext(async (_, { headers }) => {
  const token = await storage.getItem(TOKEN_KEY);
  return { headers: { ...headers, authorization: token ? `Bearer ${token}` : "" } };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  // objects with `_id` are normalised automatically, so a like on one screen
  // updates the same post everywhere
  cache: new InMemoryCache(),
});

export default client;

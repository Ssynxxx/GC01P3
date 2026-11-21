import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { connectDB } from "./config/mongodb.js";
import { connectRedis } from "./config/redis.js";
import { typeDefs, resolvers } from "./schemas/index.js";
import { verifyToken } from "./helpers/jwt.js";
import User from "./models/User.js";

const PORT = Number(process.env.PORT) || 3000;

const server = new ApolloServer({ typeDefs, resolvers, introspection: true });

await connectDB();
connectRedis();

const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
  // Authorization: Bearer <accessToken>  ->  ctx.user
    context: async ({ req }) => {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) return { user: null };

    try {
      const payload = verifyToken(token);
      const user = await User.findById(payload.id);
      return { user };
    } catch (err) {
      console.error("[auth]", err.message);
      return { user: null };
    }
  },
});

console.log(`🚀 TikTok GraphQL server ready at ${url}`);

import jwt from "jsonwebtoken";

const secret = () => process.env.JWT_SECRET || "dev-secret-change-me";

export const signToken = (payload) =>
  jwt.sign(payload, secret(), { expiresIn: "7d" });

export const verifyToken = (token) => jwt.verify(token, secret());

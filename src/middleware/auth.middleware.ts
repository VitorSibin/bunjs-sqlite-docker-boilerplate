import { createMiddleware } from "hono/factory";
import { verifyToken } from "../lib/jwt";

type Variables = {
  userId: string;
};

export const authMiddleware = createMiddleware <{ Variables: Variables }> (async (c, next) => {
  const authorization = c.req.header("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return c.json({ message: "unauthorized" }, 401);
  }

  const token = authorization.split(" ")[1];

  if (!token) return c.json({ message: "unauthorized" }, 401);

  try {
    const payload = await verifyToken(token);
    c.set("userId", payload.userId);
    await next();
  } catch {
    return c.json({ message: "invalid token" }, 401);
  }
});
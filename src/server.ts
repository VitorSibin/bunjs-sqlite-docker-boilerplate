import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import "./db/migrate";
import { auth } from "./modules/auth/auth.routes"
import { authMiddleware } from "./middleware/auth.middleware";

type Variables = {
  userId: string;
};

const app = new Hono <{Variables: Variables}> ();

// serve os arquivos estáticos(nao estou usando um framework)
app.use("/*", serveStatic({ root: "./src/public" }));

app.route("/auth", auth);

app.get("/protected", authMiddleware, (c) => {
  const userId = c.get("userId");
  return c.json({ message: "ok", userId });
});

export default {
  port: 3002,
  fetch: app.fetch,
};
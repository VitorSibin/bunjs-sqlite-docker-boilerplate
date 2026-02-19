import { Hono } from "hono";
import { db } from "../../db/client";
import { signToken } from "../../lib/jwt";

const auth = new Hono();

auth.post("/register", async (c) => {
  const { email, password } = await c.req.json();

  const passwordHash = await Bun.password.hash(password);
  const id = Bun.randomUUIDv7();

  try {
    db.run(
      "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
      [id, email, passwordHash]
    );
    return c.json({ message: "user created" }, 201);
  } catch {
    return c.json({ message: "email already exists" }, 400);
  }
});

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const user = db.query("SELECT * FROM users WHERE email = ?").get(email) as any;

  if (!user) return c.json({ message: "invalid credentials" }, 401);

  const valid = await Bun.password.verify(password, user.password_hash);
  if (!valid) return c.json({ message: "invalid credentials" }, 401);

  const token = await signToken(user.id);
  return c.json({ token });
    
  //return c.json({ message: "login ok", userId: user.id });
});

export { auth };
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(Bun.env.JWT_SECRET ?? "dev_secret");

export async function signToken(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { userId: string };
}
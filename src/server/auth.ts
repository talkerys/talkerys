import jwt from "jsonwebtoken";

export type JwtPayload = {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
};

const JWT_SECRET = process.env.JWT_SECRET || "change_me";

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "14d" });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

import { cookies } from "next/headers";
import { verifyJwt } from "@/server/auth";

export function getSession() {
  const token = cookies().get("talkerys_token")?.value;
  if (!token) return null;
  return verifyJwt(token);
}

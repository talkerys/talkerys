import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("talkerys_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

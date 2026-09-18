import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

async function handler(req: NextRequest, ctx: any) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host && !host.includes("localhost") && !process.env.NEXTAUTH_URL?.includes(host)) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  }
  return NextAuth(req, ctx, authOptions);
}

export { handler as GET, handler as POST };

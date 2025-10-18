import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession as _getServerSession, type NextAuthOptions } from "next-auth";

// Wrapper to get the server session in Next.js server components
export async function getServerSession() {
  try {
    const session = await _getServerSession(authOptions);
    return session;
  } catch {
    // swallow errors and return null so callers can redirect
    return null;
  }
}

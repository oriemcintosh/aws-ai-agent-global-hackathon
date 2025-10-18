import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession as _getServerSession } from "next-auth";

// Wrapper to get the server session in Next.js server components
export async function getServerSession() {
  try {
    const session = await _getServerSession(authOptions as any);
    return session;
  } catch (err) {
    // swallow errors and return null so callers can redirect
    return null;
  }
}

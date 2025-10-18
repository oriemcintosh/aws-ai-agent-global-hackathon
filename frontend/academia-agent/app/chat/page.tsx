import { ChatShell } from "@/components/chat/chat-shell";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function ChatPage() {
  const session = await getServerSession();
  if (!session) {
    // Redirect unauthenticated users to the NextAuth sign-in page
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent("/chat")}`);
  }

  return <ChatShell />;
}

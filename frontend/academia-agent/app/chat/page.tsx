"use client";

import { ChatShell } from "@/components/chat/chat-shell";

import AuthenticatorWrapper from "@/components/amplifyAuth/AuthenticatorWrapper";

// Amplify is configured once on the client by `lib/amplifyInit.tsx` mounted in the root layout.

export default function ChatPage() {
  return (
    <AuthenticatorWrapper>
      <ChatShell />
    </AuthenticatorWrapper>
  );
}

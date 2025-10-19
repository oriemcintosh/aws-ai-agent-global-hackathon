"use client";

import { ChatShell } from "@/components/chat/chat-shell";

import AuthenticatorWrapper from "@/components/amplifyAuth/AuthenticatorWrapper";

import { Amplify } from 'aws-amplify';
import outputs from "../../amplify_outputs.json";

// Ensure Amplify is configured only in the browser and that the imported
// JSON is available. The named-import used previously produced `undefined`.
if (typeof window !== 'undefined' && outputs) {
  Amplify.configure(outputs);
}

export default function ChatPage() {
  return (
    <AuthenticatorWrapper>
      <ChatShell />
    </AuthenticatorWrapper>
  );
}

import { ChatShell } from "@/components/chat/chat-shell";

import AuthenticatorWrapper from "@/components/amplifyAuth/AuthenticatorWrapper";
import "@aws-amplify/ui-react/styles.css";

export default function ChatPage() {
  return (
    <AuthenticatorWrapper>
      <ChatShell />
    </AuthenticatorWrapper>
  );
}

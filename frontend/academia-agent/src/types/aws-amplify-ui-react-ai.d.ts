declare module "@aws-amplify/ui-react-ai" {
  import * as React from "react";

  export type AIConversationMessage = {
    id: string;
    role: "user" | "agent";
    content: string;
    createdAt: string;
  };

  export function createAIHooks(client: unknown): {
    useAIConversation: (...args: unknown[]) => unknown;
    useAIGeneration: (...args: unknown[]) => unknown;
  };

  export const AIConversation: React.ComponentType<{
    messages: AIConversationMessage[];
    isLoading?: boolean;
    handleSendMessage: (text: string) => Promise<void> | void;
  }>;

  export default AIConversation;
}

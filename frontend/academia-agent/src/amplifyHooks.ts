import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useCallback, useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

// Canonical implementation for Amplify Data client + stable hooks.
export const client = generateClient<Schema>({ authMode: "userPool" });

let remoteLoaded = false;
let remoteUseAIConversation: unknown = undefined;
let remoteUseAIGeneration: unknown = undefined;

(async () => {
  try {
    const mod = await import("@aws-amplify/ui-react-ai");
    if (mod && typeof mod.createAIHooks === "function") {
      const hooks = mod.createAIHooks(client);
      remoteUseAIConversation = hooks.useAIConversation;
      remoteUseAIGeneration = hooks.useAIGeneration;
      remoteLoaded = true;
    }
  } catch {
    remoteLoaded = false;
  }
})();

export function useAIConversationLocal(conversationId?: string) {
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "agent"; content: string; createdAt: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages([{ id: `${Date.now()}-welcome`, role: "agent", content: "Welcome! Ask me anything about academia.", createdAt: new Date().toISOString() }]);
  }, [conversationId]);

  const send = useCallback(async (text: string) => {
    const user = { id: `${Date.now()}-${Math.random()}`, role: "user" as const, content: text, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, user]);
    setIsLoading(true);
    try {
      // Get auth token from current session
      console.log("Fetching auth session...");
      const authSession = await fetchAuthSession({ forceRefresh: false });
      console.log("Auth session:", { 
        hasTokens: !!authSession.tokens,
        hasIdToken: !!authSession.tokens?.idToken,
        hasAccessToken: !!authSession.tokens?.accessToken,
        identityId: authSession.identityId
      });
      
      const authToken = authSession.tokens?.idToken?.toString();
      
      if (!authToken) {
        console.error("No auth token available. Session:", authSession);
        throw new Error("No authentication token available. Please sign in.");
      }

      console.log("Sending message to /api/chat with auth token");
      const res = await fetch("/api/chat", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ message: text, conversationId, authToken }) 
      });
      
      console.log("API response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error || "API request failed");
      }
      
      const data = await res.json();
      const assistantContent = (data && (data.message ?? data.result)) ?? "Assistant unavailable";
      const assistant = { id: `${Date.now()}-${Math.random()}`, role: "agent" as const, content: assistantContent, createdAt: new Date().toISOString() };
      setMessages((m) => [...m, assistant]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((m) => [...m, { 
        id: `${Date.now()}-${Math.random()}`, 
        role: "agent", 
        content: "Error: " + (error instanceof Error ? error.message : "Unknown error"), 
        createdAt: new Date().toISOString() 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  return [{ data: { messages }, isLoading }, send] as const;
}

// Export a simple wrapper that just uses the local implementation.
// The component can check remoteLoaded and use the remote hook directly if needed.
export function useAIConversation(conversationId?: string) {
  return useAIConversationLocal(conversationId);
}

// Export a getter to check if remote hooks are available
export function isRemoteHooksAvailable() {
  return remoteLoaded && typeof remoteUseAIConversation === "function";
}

// Export the raw remote hook if available (for direct use in components)
export function getRemoteAIConversationHook() {
  if (remoteLoaded && typeof remoteUseAIConversation === "function") {
    return remoteUseAIConversation as (id?: string) => unknown;
  }
  return null;
}

export function useAIGeneration(...args: unknown[]) {
  if (remoteLoaded && typeof remoteUseAIGeneration === "function") {
    return (remoteUseAIGeneration as unknown as (...a: unknown[]) => unknown)(...args);
  }
  throw new Error("@aws-amplify/ui-react-ai not available for generation.");
}

export default client;

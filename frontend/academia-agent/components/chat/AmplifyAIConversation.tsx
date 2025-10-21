"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";

type Message = { id: string; role: "user" | "agent"; content: string; createdAt: string };

function createId() {
  if (typeof globalThis !== "undefined" && (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID) {
    return (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto!.randomUUID!();
  }
  return `${Date.now()}-${Math.random()}`;
}

// Local hook that mimics the shape of `useAIConversation` enough for the UI:
export function useAIConversationLocal(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // seed a welcome message when conversationId mounts
    setMessages([
      {
        id: createId(),
        role: "agent",
        content: `Welcome! Start the conversation and I'll reply. (conversation: ${conversationId ?? "local"})`,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, [conversationId]);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { id: createId(), role: "user", content: text, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
      });
      const data = res.ok ? await res.json() : {};
      const assistantContent = data.message ?? "I was unable to reach the assistant service.";
      const agentMsg: Message = { id: createId(), role: "agent", content: assistantContent, createdAt: new Date().toISOString() };
      setMessages((m) => [...m, agentMsg]);
    } catch {
      const fallback: Message = { id: createId(), role: "agent", content: "Something went wrong. Try again.", createdAt: new Date().toISOString() };
      setMessages((m) => [...m, fallback]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  return [
    { data: { messages }, isLoading },
    handleSendMessage,
  ] as const;
}

export default function AmplifyAIConversation({ conversationId }: { conversationId?: string }) {
  // Always use the local hook to avoid conditional hook calls.
  // The local hook uses the server API which connects to Amplify Data.
  const [state] = useAIConversationLocal(conversationId);

  return (
    <Authenticator>
      <div className="mx-auto w-full max-w-3xl">
        <div className="space-y-4">
          {state.data.messages.map((msg) => (
            <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={msg.role === "user" 
                ? "max-w-[80%] rounded-2xl bg-blue-600 px-4 py-2 text-white" 
                : "max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2 text-gray-900"
              }>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                <div className="mt-1 text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {state.isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2 text-gray-900">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Authenticator>
  );
}

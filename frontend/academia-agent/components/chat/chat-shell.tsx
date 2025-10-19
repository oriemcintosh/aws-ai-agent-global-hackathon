"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Menu, Plus, Send, Sparkles, Trash2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthenticator } from '@aws-amplify/ui-react';

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  createdAt: string;
}

interface MessagesState {
  [conversationId: string]: ChatMessage[];
}

const initialIntro = `Welcome! I can help you explore post-secondary programs tailored to your field of study / interests, career goals, preferred locations, and budget.\n\nShare any details you know and I'll surface schools, programs, and cost insights that fit.`;

const now = () => new Date().toISOString();

const createId = () => {
  const globalCrypto = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (globalCrypto && "randomUUID" in globalCrypto) {
    return globalCrypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
};

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const relativeTimeFallback = "just now";

const formatRelativeTime = (isoString: string) => {
  const value = new Date(isoString).getTime();
  const nowValue = Date.now();
  const diff = value - nowValue;

  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(diff / (1000 * 60));
  const hours = Math.round(diff / (1000 * 60 * 60));
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (Math.abs(seconds) < 60) {
    return rtf.format(seconds, "second");
  }
  if (Math.abs(minutes) < 60) {
    return rtf.format(minutes, "minute");
  }
  if (Math.abs(hours) < 24) {
    return rtf.format(hours, "hour");
  }
  return rtf.format(days, "day");
};

const initialConversationId = "welcome";

const initialConversations: Record<string, Conversation> = {
  [initialConversationId]: {
    id: initialConversationId,
    title: "Welcome",
    updatedAt: now(),
  },
};

const initialMessages: MessagesState = {
  [initialConversationId]: [
    {
      id: createId(),
      role: "agent",
      content: initialIntro,
      createdAt: now(),
    },
  ],
};

export function ChatShell() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [conversations, setConversations] = useState<Record<string, Conversation>>(initialConversations);
  const [conversationOrder, setConversationOrder] = useState<string[]>([initialConversationId]);
  const [messagesByConversation, setMessagesByConversation] = useState<MessagesState>(initialMessages);
  const [activeConversationId, setActiveConversationId] = useState<string>(initialConversationId);
  const [pendingInput, setPendingInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const PRIVACY_URL = process.env.NEXT_PUBLIC_PRIVACY_URL ?? "/terms";
  const MARKETPLACE_URL = process.env.NEXT_PUBLIC_AWS_MARKETPLACE_URL ??
    "https://aws.amazon.com/marketplace/pp/prodview-rdvz6pmeimdby";

  const { signOut, user } = useAuthenticator((context) => [context.signOut, context.user]);

  const clearAmplifyLocalStorage = () => {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (/amplify|CognitoIdentityServiceProvider|aws-amplify|AWSCognito/i.test(key)) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Failed to clear Amplify localStorage:', e);
    }
  };

  const handleSignOut = async () => {
    try {
      // Try the UI hook signOut first
      await signOut();

      // Wait briefly to give Authenticator a chance to update user state
      await new Promise((r) => setTimeout(r, 500));

      // If user is still present, fall back to calling Amplify Auth.signOut with global flag
      const stillSignedIn = !!(user);
      if (stillSignedIn) {
        try {
          const AmplifyModule: any = await import('aws-amplify');
          const Auth = AmplifyModule.Auth ?? AmplifyModule.default?.Auth;
          if (Auth && typeof Auth.signOut === 'function') {
            // Ask Cognito to sign out globally when possible
            await Auth.signOut({ global: true });
          }
        } catch (e) {
          console.warn('Fallback amplify signOut failed', e);
        }

        // Clear amplify-related localStorage keys and reload
        clearAmplifyLocalStorage();
      }

      window.location.reload();
    } catch (err) {
      console.error("Sign out failed", err);
      alert("Sign out failed. Please try again.");
    }
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const messages = useMemo(() => {
    return messagesByConversation[activeConversationId] ?? [];
  }, [messagesByConversation, activeConversationId]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setMobileSidebarOpen(false);
  };

  const handleCreateConversation = () => {
    const newId = createId();
    const createdAt = now();
    const starterMessage: ChatMessage = {
      id: createId(),
      role: "agent",
      content: "What would you like to work on today?",
      createdAt,
    };

    setConversations((prev) => ({
      ...prev,
      [newId]: {
        id: newId,
        title: "New chat",
        updatedAt: createdAt,
      },
    }));

    setConversationOrder((prev) => [newId, ...prev.filter((id) => id !== newId)]);

    setMessagesByConversation((prev) => ({
      ...prev,
      [newId]: [starterMessage],
    }));

    setActiveConversationId(newId);
  };

  const handleDeleteConversation = (conversationId: string) => {
    // simple confirmation for now
    const ok = confirm("Delete this conversation? This cannot be undone.");
    if (!ok) return;

    setConversations((prev) => {
      const rest = { ...prev };
      delete rest[conversationId];
      return rest;
    });

    setMessagesByConversation((prev) => {
      const rest = { ...prev };
      delete rest[conversationId];
      return rest;
    });

    const remainingOrder = conversationOrder.filter((id) => id !== conversationId);
    setConversationOrder(() => remainingOrder);

    setActiveConversationId((current) => {
      if (current !== conversationId) return current;
      // choose first available conversationOrder after deletion, or fallback to initial
      if (remainingOrder.length > 0) return remainingOrder[0];
      return initialConversationId;
    });
    // close the mobile sidebar after deleting a conversation so the UI is consistent
    setMobileSidebarOpen(false);
  };

  const updateConversationMeta = (conversationId: string, fallbackTitle: string) => {
    setConversations((prev) => {
      const existing = prev[conversationId];
      if (!existing) return prev;
      const hasTitle = existing.title && existing.title !== "New chat";
      const updatedTitle = hasTitle ? existing.title : fallbackTitle;
      return {
        ...prev,
        [conversationId]: {
          ...existing,
          title: updatedTitle,
          updatedAt: now(),
        },
      };
    });

    setConversationOrder((prev) => [conversationId, ...prev.filter((id) => id !== conversationId)]);
  };

  const handleSendMessage = async () => {
    const trimmed = pendingInput.trim();
    if (!trimmed || isSending) return;

    const conversationId = activeConversationId;
    const createdAt = now();
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
      createdAt,
    };

    setPendingInput("");
    setIsSending(true);
    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), userMessage],
    }));
    updateConversationMeta(conversationId, trimmed.slice(0, 60));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          conversationId,
        }),
      });

      const data: { message?: string } = response.ok ? await response.json() : {};
      const assistantContent = data.message ??
        "I was unable to reach the assistant service. Please try again in a moment.";

      const agentMessage: ChatMessage = {
        id: createId(),
        role: "agent",
        content: assistantContent,
        createdAt: now(),
      };

      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), agentMessage],
      }));
      updateConversationMeta(conversationId, trimmed.slice(0, 60));
  } catch {
      const fallbackMessage: ChatMessage = {
        id: createId(),
        role: "agent",
        content: "Something went wrong while sending your message. Check your connection and try again.",
        createdAt: now(),
      };

      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), fallbackMessage],
      }));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getRelativeTime = (isoString: string) =>
    isHydrated ? formatRelativeTime(isoString) : relativeTimeFallback;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)] md:grid md:grid-cols-[260px_1fr]">
      <aside className="hidden flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] md:flex">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-base font-semibold text-[var(--sidebar-foreground)]">Conversations</h1>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] transition hover:opacity-90"
            aria-label="Start a new chat"
            onClick={handleCreateConversation}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1 px-2 pb-4">
            {conversationOrder.map((conversationId) => {
              const conversation = conversations[conversationId];
              if (!conversation) return null;
              const convMessages = messagesByConversation[conversationId] ?? [];
              const lastMessage = convMessages[convMessages.length - 1];
              const isActive = conversationId === activeConversationId;
              return (
                <li key={conversationId}>
                  <div
                    className={cn(
                      "w-full rounded-md px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-ring)]",
                      isActive
                        ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]"
                        : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <button
                        type="button"
                        onClick={() => handleSelectConversation(conversationId)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{conversation.title}</span>
                          <span className="text-xs text-[color-mix(in_srgb,var(--sidebar-foreground)_50%,transparent)]">
                            {getRelativeTime(conversation.updatedAt)}
                          </span>
                        </div>
                        {lastMessage ? (
                          <p className="mt-1 max-h-10 overflow-hidden text-ellipsis text-xs leading-snug opacity-80">
                            {lastMessage.content}
                          </p>
                        ) : null}
                      </button>
                      <div className="ml-2 flex-shrink-0">
                        <button
                          type="button"
                          aria-label={`Delete conversation ${conversation.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversationId);
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_90%,var(--primary)_10%)] px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] md:hidden"
              aria-label="Open conversation list"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div>
              <Link href="/" className="text-sm font-semibold uppercase tracking-wide text-[color-mix(in_srgb,var(--foreground)_80%,transparent)] hover:underline">
                Academia Agent
              </Link>
              <h2 className="text-lg font-semibold">Research Studio</h2>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] sm:flex">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <a
              href={MARKETPLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Powered by AWS Bedrock AgentCore
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="ml-4 inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm text-[color-mix(in_srgb,var(--foreground)_80%,transparent)] hover:bg-[var(--card)]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <section
            ref={scrollRef}
            className="flex h-full flex-col gap-4 overflow-y-auto px-4 py-6 sm:px-6"
            role="log"
            aria-live="polite"
            aria-label="Conversation messages"
          >
            {messages.length === 0 ? (
              <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                <p>Start the conversation by sending a message.</p>
              </div>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className={cn(
                    "flex w-full flex-col gap-2",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[min(100%,_700px)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                      message.role === "user"
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-[color-mix(in_srgb,var(--card)_85%,var(--primary)_15%)] text-[var(--foreground)]"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <time className="text-xs text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
                    {getRelativeTime(message.createdAt)}
                  </time>
                </article>
              ))
            )}
          </section>
        </main>

        <footer className="border-t border-[var(--border)] bg-[var(--card)] px-4 py-4 sm:px-6">
          <form
            className="mx-auto flex w-full max-w-3xl flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              handleSendMessage();
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Message the agent
            </label>
            <textarea
              id="chat-input"
              value={pendingInput}
              onChange={(event) => setPendingInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message the agent..."
              rows={2}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_90%,transparent)] px-4 py-3 text-sm shadow-sm transition focus-visible:border-[var(--ring)] focus-visible:outline-none"
              aria-describedby="chat-helper-text"
            />
            <div className="flex items-center justify-between text-xs text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
              <div className="flex items-center gap-3">
                <a
                  href={PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-xs"
                  aria-label="Open privacy policy (opens in new tab)"
                >
                  Privacy &amp; Terms
                </a>
                <p id="chat-helper-text">Press Enter to send, Shift + Enter for a new line.</p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSending || !pendingInput.trim()}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                Send
              </button>
            </div>
          </form>
        </footer>
      </div>

      {isMobileSidebarOpen ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Conversation list"
        >
          <div
            className="absolute inset-0 bg-black/40" 
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close conversation list"
          />
          <div
            className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col border-l border-[var(--sidebar-border)] bg-[var(--sidebar)] shadow-lg"
            role="region"
            aria-label="Mobile conversations sidebar"
          >
            <div className="flex items-center justify-between px-4 py-4">
              <h2 className="text-base font-semibold text-[var(--sidebar-foreground)]">Conversations</h2>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] transition hover:opacity-90"
                aria-label="Start a new chat"
                onClick={() => {
                  handleCreateConversation();
                  setMobileSidebarOpen(false);
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 pb-4">
              <ul className="space-y-1">
                {conversationOrder.map((conversationId) => {
                  const conversation = conversations[conversationId];
                  if (!conversation) return null;
                  const convMessages = messagesByConversation[conversationId] ?? [];
                  const lastMessage = convMessages[convMessages.length - 1];
                  const isActive = conversationId === activeConversationId;
                  return (
                    <li key={conversationId}>
                      <div
                        className={cn(
                          "w-full rounded-md px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-ring)]",
                          isActive
                            ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]"
                            : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectConversation(conversationId);
                            }}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">{conversation.title}</span>
                              <span className="text-xs text-[color-mix(in_srgb,var(--sidebar-foreground)_50%,transparent)]">
                                {getRelativeTime(conversation.updatedAt)}
                              </span>
                            </div>
                            {lastMessage ? (
                              <p className="mt-1 max-h-10 overflow-hidden text-ellipsis text-xs leading-snug opacity-80">
                                {lastMessage.content}
                              </p>
                            ) : null}
                          </button>
                          <div className="ml-2 flex-shrink-0">
                            <button
                              type="button"
                              aria-label={`Delete conversation ${conversation.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conversationId);
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="px-4 py-3 border-t border-[var(--sidebar-border)]">
              <div className="flex items-center justify-between text-xs">
                <a
                  href={PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  aria-label="Open privacy policy (opens in new tab)"
                >
                  Privacy &amp; Terms
                </a>
                <a
                  href={MARKETPLACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  aria-label="Open AWS Marketplace listing (opens in new tab)"
                >
                  Powered by AWS
                </a>
              </div>
              <div className="mt-3 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    handleSignOut();
                  }}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ChatShell;

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Menu, Plus, Send, Sparkles, Trash2, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Lazy client initialization to ensure Amplify is configured first
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let clientInstance: any = null;
const getClient = () => {
  if (!clientInstance) {
    clientInstance = generateClient();
  }
  return clientInstance;
};

// GraphQL mutation aligned with updated schema (sendMessage(prompt: String!))
const sendMessageMutation = /* GraphQL */ `
  mutation SendMessage($prompt: String!) {
    sendMessage(prompt: $prompt) {
      id
      conversationId
      role
      content
      createdAt
    }
  }
`;

// GraphQL subscription without arguments (onMessageReceived)
const onMessageReceivedSubscription = /* GraphQL */ `
  subscription OnMessageReceived {
    onMessageReceived {
      id
      conversationId
      role
      content
      createdAt
    }
  }
`;

interface MessageFromAppSync {
  id: string;
  conversationId?: string;
  role: string;
  content: string;
  createdAt: string;
}

// Simplified Conversation Summary for the sidebar
interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

// Unified message type for local and hook-based messages
interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  createdAt: string;
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
  try {
    const value = new Date(isoString).getTime();
    const nowValue = Date.now();
    const diff = value - nowValue;

    const seconds = Math.round(diff / 1000);
    if (Math.abs(seconds) < 60) return rtf.format(seconds, "second");
    
    const minutes = Math.round(diff / (1000 * 60));
    if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");

    const hours = Math.round(diff / (1000 * 60 * 60));
    if (Math.abs(hours) < 24) return rtf.format(hours, "hour");

    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return rtf.format(days, "day");
  } catch {
    return relativeTimeFallback;
  }
};

const initialConversationId = "welcome-chat";

export function ChatShell() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [conversations, setConversations] = useState<Record<string, ConversationSummary>>({
    [initialConversationId]: { id: initialConversationId, title: "Welcome", updatedAt: now() },
  });
  const [conversationOrder, setConversationOrder] = useState<string[]>([initialConversationId]);
  const [activeConversationId, setActiveConversationId] = useState<string>(initialConversationId);
  const [pendingInput, setPendingInput] = useState<string>("");
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Local messages for the initial welcome chat, which is not backed by the hook.
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMessage[]>>({
    [initialConversationId]: [{ id: createId(), role: 'agent', content: initialIntro, createdAt: now() }]
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const PRIVACY_URL = process.env.NEXT_PUBLIC_PRIVACY_URL ?? "/terms";
  const MARKETPLACE_URL = process.env.NEXT_PUBLIC_AWS_MARKETPLACE_URL ?? "https://aws.amazon.com/marketplace/pp/prodview-rdvz6pmeimdby";

  const { signOut, user } = useAuthenticator((context) => [context.signOut, context.user]);
  
  // For this simplified version, all conversations use local state and the /api/chat fallback
  // (No Amplify AI conversation hooks since they're not configured in the data schema)
  const activeMessages: ChatMessage[] = useMemo(() => {
    return localMessages[activeConversationId] ?? [];
  }, [localMessages, activeConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  // Subscribe to real-time message updates from AppSync
  useEffect(() => {
    if (!activeConversationId || activeConversationId === initialConversationId) {
      return; // Don't subscribe for the welcome chat
    }

    const sub = getClient().graphql({
      query: onMessageReceivedSubscription,
    });

    // Type assertion for subscription
    if ('subscribe' in sub) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = (sub as any).subscribe({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next: (event: any) => {
          const message = event.data?.onMessageReceived as MessageFromAppSync;
          if (!message) return;
          
          // Only add assistant messages from subscription (user messages added immediately)
          if (message.role === 'assistant' || message.role === 'agent') {
            const newMsg: ChatMessage = {
              id: message.id,
              role: 'agent',
              content: message.content,
              createdAt: message.createdAt,
            };

            setLocalMessages(prev => {
              const conv = prev[activeConversationId] ?? [];
              // Check if message already exists to avoid duplicates
              if (conv.some(m => m.id === newMsg.id)) {
                return prev;
              }
              return { ...prev, [activeConversationId]: [...conv, newMsg] };
            });
            
            setIsLoading(false);
          }
        },
        error: (error: Error) => {
          console.error('AppSync subscription error:', error);
          setIsLoading(false);
        },
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeConversationId]);

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setMobileSidebarOpen(false);
  };

  const handleCreateConversation = async () => {
    const newId = createId();
    const createdAt = now();
    
    setConversations(prev => ({
      ...prev,
      [newId]: { id: newId, title: "New Chat", updatedAt: createdAt },
    }));
    setConversationOrder(prev => [newId, ...prev]);
    setActiveConversationId(newId);
    setMobileSidebarOpen(false);
    // The hook will automatically start a new conversation on the backend
    // when `send` is called with a new `conversationId`.
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (conversationId === initialConversationId) return;
    const ok = confirm("Delete this conversation? This cannot be undone.");
    if (!ok) return;

    setConversations(prev => {
      const newState = { ...prev };
      delete newState[conversationId];
      return newState;
    });
    setConversationOrder(prev => prev.filter(id => id !== conversationId));
    
    if (activeConversationId === conversationId) {
      setActiveConversationId(conversationOrder.find(id => id !== conversationId) ?? initialConversationId);
    }
    setMobileSidebarOpen(false);
  };

  const updateConversationMeta = (conversationId: string, fallbackTitle: string) => {
    setConversations(prev => {
      const existing = prev[conversationId];
      if (!existing) return prev;
      const hasRealTitle = existing.title && existing.title !== "New Chat";
      return {
        ...prev,
        [conversationId]: {
          ...existing,
          title: hasRealTitle ? existing.title : fallbackTitle,
          updatedAt: now(),
        },
      };
    });
    setConversationOrder(prev => [conversationId, ...prev.filter(id => id !== conversationId)]);
  };

  const handleSendMessage = async () => {
    const trimmed = pendingInput.trim();
    if (!trimmed || isLoading) return;

    setPendingInput("");
    setIsLoading(true);

    // Add user message locally
    const userMsg: ChatMessage = { id: createId(), role: 'user', content: trimmed, createdAt: now() };
    setLocalMessages(prev => {
      const conv = prev[activeConversationId] ?? [];
      return { ...prev, [activeConversationId]: [...conv, userMsg] };
    });

    try {
      const result = await getClient().graphql({
        query: sendMessageMutation,
        variables: { prompt: trimmed },
      });

      console.log('AppSync mutation result:', result);
      const errors = (result as { errors?: Array<{ message?: string }> }).errors;
      if (errors && errors.length > 0) {
        console.error('GraphQL errors:', errors);
        throw new Error(errors[0].message || 'GraphQL mutation failed');
      }

      // Attempt to extract the assistant message directly from mutation result (not waiting for subscription)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawMessage: any = (result as any).data?.sendMessage;
      if (rawMessage && rawMessage.content) {
        let parsedContent = rawMessage.content;
        // If content is a JSON string with nested structure { result: { content: [{text: ...}] } }
        try {
          const maybeJson = JSON.parse(rawMessage.content);
          if (maybeJson && typeof maybeJson === 'object') {
            // Common shapes
            if (maybeJson.result && maybeJson.result.content && Array.isArray(maybeJson.result.content)) {
              parsedContent = maybeJson.result.content.map((c: { text?: string }) => c.text || '').join('\n');
            } else if (maybeJson.content && Array.isArray(maybeJson.content)) {
              parsedContent = maybeJson.content.map((c: { text?: string }) => c.text || '').join('\n');
            }
          }
        } catch {
          // not JSON, keep original string
        }

        const assistantMsg: ChatMessage = {
          id: rawMessage.id,
          role: 'agent',
          content: parsedContent,
          createdAt: rawMessage.createdAt || now(),
        };
        setLocalMessages(prev => {
          const conv = prev[activeConversationId] ?? [];
          // Avoid duplicates if subscription also delivers it later
          if (conv.some(m => m.id === assistantMsg.id)) return prev;
          return { ...prev, [activeConversationId]: [...conv, assistantMsg] };
        });
      }

      updateConversationMeta(activeConversationId, trimmed.slice(0, 60));
      setIsLoading(false); // stop loading after mutation response
    } catch (err) {
      console.error('AppSync mutation failed:', err);
      
      // Log detailed error information
      if (err && typeof err === 'object' && 'errors' in err) {
        console.error('GraphQL errors detail:', (err as { errors: unknown }).errors);
      }
      
      setIsLoading(false);
      
      // Add error message locally
      const errorMsg: ChatMessage = {
        id: createId(),
        role: 'agent',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to send message'}`,
        createdAt: now()
      };
      setLocalMessages(prev => {
        const conv = prev[activeConversationId] ?? [];
        return { ...prev, [activeConversationId]: [...conv, errorMsg] };
      });
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getRelativeTime = (isoString: string) => isHydrated ? formatRelativeTime(isoString) : relativeTimeFallback;

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
      await signOut();
      const waitForSignOut = async () => {
        const interval = 100;
        const maxWait = 5000;
        let waited = 0;
        while (user != null && waited < maxWait) {
          await new Promise((r) => setTimeout(r, interval));
          waited += interval;
        }
      };
      await waitForSignOut();
      if (user != null) {
        try {
          type AmplifyAuthShape = { signOut: (options?: { global?: boolean }) => Promise<void>; };
          type AmplifyModuleShape = { Auth?: AmplifyAuthShape; default?: { Auth?: AmplifyAuthShape }; };
          const AmplifyModule: AmplifyModuleShape = (await import('aws-amplify')) as AmplifyModuleShape;
          const Auth = AmplifyModule.Auth ?? AmplifyModule.default?.Auth;
          if (Auth && typeof Auth.signOut === 'function') {
            await Auth.signOut({ global: true });
          }
        } catch (e) {
          console.warn('Fallback amplify signOut failed', e);
        }
        clearAmplifyLocalStorage();
      }
      window.location.reload();
    } catch (err) {
      console.error("Sign out failed", err);
      alert("Sign out failed. Please try again.");
    }
  };

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
              const lastMessage = [...(localMessages[conversationId] ?? [])].pop();
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
          <section ref={scrollRef} className="flex h-full flex-col gap-4 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto w-full max-w-3xl space-y-4">
              {activeMessages.map((msg, idx) => {
                const key = msg.id || `msg-${idx}`;
                if (!msg.id && typeof window !== 'undefined') {
                  interface WarnWindow extends Window { __missingMsgIdWarned?: boolean }
                  const w = window as WarnWindow;
                  if (!w.__missingMsgIdWarned) {
                    console.warn('[ChatShell] Message without id encountered; using index fallback key.');
                    w.__missingMsgIdWarned = true;
                  }
                }
                return (
                  <div key={key} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    )}>
                      {msg.role === 'agent' ? (
                        <ReactMarkdown
                          className="prose prose-sm max-w-none prose-p:my-2 prose-pre:my-3 prose-code:before:content-[''] prose-code:after:content-['']"
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({className, children, ...props}) {
                              const langMatch = /language-(\w+)/.exec(className || '');
                              const isBlock = className && className.includes('language-');
                              const rawText = Array.isArray(children) ? children.join('') : String(children);
                              if (!isBlock) {
                                return (
                                  <code
                                    className={cn(
                                      "rounded bg-black/10 px-1 py-0.5 text-[0.75rem]",
                                      langMatch ? `language-${langMatch[1]}` : ''
                                    )}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <div className="group relative my-3">
                                  <pre className={cn(
                                    "overflow-x-auto rounded-lg bg-[#0f1115] p-3 text-xs text-gray-100",
                                    langMatch ? `language-${langMatch[1]}` : ''
                                  )}>
                                    <code {...props}>{children}</code>
                                  </pre>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      try {
                                        navigator.clipboard.writeText(rawText);
                                      } catch (e) {
                                        console.warn('Clipboard copy failed', e);
                                      }
                                    }}
                                    aria-label="Copy code to clipboard"
                                    className="absolute right-2 top-2 rounded-md bg-black/40 px-2 py-1 text-[0.65rem] font-medium text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/60"
                                  >
                                    Copy
                                  </button>
                                </div>
                              );
                            },
                            a({href, children}) {
                              return <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-500">{children}</a>;
                            },
                            table({children}) {
                              return <div className="overflow-x-auto my-2"><table className="text-xs border-collapse">{children}</table></div>;
                            },
                            th({children}) { return <th className="border px-2 py-1 bg-gray-200">{children}</th>; },
                            td({children}) { return <td className="border px-2 py-1">{children}</td>; },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      )}
                      <div className="mt-1 text-xs opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2 text-gray-900">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
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
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoading || !pendingInput.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                  Send
                </button>
              </div>
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
                onClick={handleCreateConversation}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 pb-4">
              <ul className="space-y-1">
                {conversationOrder.map((conversationId) => {
                  const conversation = conversations[conversationId];
                  if (!conversation) return null;
                  const lastMessage = [...(localMessages[conversationId] ?? [])].pop();
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

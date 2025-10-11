"use client";

import React, { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

function uid() {
  try {
    // Use the secure randomUUID when available (browser or Node)
    if (
      typeof globalThis.crypto !== "undefined" &&
      typeof globalThis.crypto.randomUUID === "function"
    ) {
      return globalThis.crypto.randomUUID();
    }
  } catch (e) {
    // ignore and fall back
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).slice(2, 9);
}

function getGreeting() {
  try {
    const h = new Date().getHours();
    // 5-11: morning, 12-17: afternoon, 18-4: evening
    if (h >= 5 && h < 12) return "Good Morning";
    if (h >= 12 && h < 18) return "Good Afternoon";
    return "Good Evening";
  } catch (e) {
    return "Hello";
  }
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: uid(),
      role: "assistant",
      text: `${getGreeting()}! \nHow can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // ensure input focus scrolls to bottom on mobile
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onFocusIn = () => setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }), 150);
    window.addEventListener("focusin", onFocusIn);
    return () => window.removeEventListener("focusin", onFocusIn);
  }, []);

  function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: uid(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // fake assistant response (replace with real API call)
    setLoading(true);
    setTimeout(() => {
      const reply: Message = {
        id: uid(),
        role: "assistant",
        text: `You said: ${text}`,
      };
      setMessages((m) => [...m, reply]);
      setLoading(false);
    }, 700);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <div className="w-full max-w-3xl h-[80vh] sm:h-[80vh] flex flex-col bg-card text-card-foreground rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-semibold">AI</div>
            <div>
              <h1 className="text-lg font-semibold">Academia Agent</h1>
              <p className="text-xs text-muted">AI Agent to Help you Chart Your Academic Journey</p>
            </div>
          </div>
          <div className="text-xs text-muted">Model: AWS Nova Micro</div>
        </div>

        {/* Messages */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`w-full flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] sm:max-w-[80%]`}>
                <div
                  className={`inline-block px-4 py-2 rounded-lg break-words whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-popover text-popover-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input - sticky on mobile */}
        <div className="border-t border-border bg-card" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {/* Mobile-only instruction bar for better visibility */}
          <div className="w-full text-center text-sm font-medium px-3 py-2 rounded-md bg-muted text-muted-foreground mb-2 sm:hidden">
            Press Enter to send — Shift+Enter for a new line
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-3 p-3 sm:p-4 items-end"
          >
            <textarea
              ref={textareaRef}
              aria-label="Message"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // autosize
                const ta = textareaRef.current;
                if (ta) {
                  ta.style.height = "auto";
                  ta.style.height = `${Math.min(200, ta.scrollHeight)}px`;
                }
              }}
              rows={1}
              onKeyDown={(e) => {
                // Enter to send, Shift+Enter for newline
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              className="flex-1 resize-none min-h-[44px] max-h-40 rounded-md px-3 py-2 bg-input text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Message… (Enter to send)"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

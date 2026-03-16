"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

export default function ChatPage() {
  const { messages, sendMessage, status, error, clearError } = useChat();

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isLoading = status === "submitted" || status === "streaming";

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status, error]);

  useEffect(() => {
    focusInput();
  }, [messages, status, error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (status === "error") {
      clearError();
    }

    // Send user message → triggers AI stream
    sendMessage({ text: input });

    setInput(""); // clear field
    focusInput();
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 bg-gray-950 text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Talk to Karen, the Manager, or Todd, the Owner! Ask about the menu,
        hours, or just say hi. (Hint: Karen&apos;s got jokes 😏)
      </h1>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-100"
              }`}
            >
              {/* In latest SDK, content is in message.parts (array) */}
              {message.parts
                .filter((part) => part.type === "text")
                .map((part, idx) => (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <span key={idx}>{(part as any).text}</span>
                ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3 animate-pulse">
              Thinking...
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-red-900/40 border border-red-700 text-red-100">
              {error.message ||
                "Chat request failed. Check server logs for details."}
            </div>
          </div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={() => setTimeout(focusInput, 0)}
          placeholder="Type your message..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

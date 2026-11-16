
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type StudyDocument = {
  id: string;
  file_name: string;
};

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  // Stores the current Dify conversation ID
  const [conversationId, setConversationId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcomeMessage =
    "Hi! I'm your LearnAI study assistant. Ask me anything about your selected study material.";

  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);

    async function loadDocuments() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error("Please log in first.");

        const { data, error } = await supabase
          .from("documents")
          .select("id, file_name")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const userDocuments = data ?? [];
        setDocuments(userDocuments);

        if (userDocuments.length > 0) {
          setSelectedDocumentId(userDocuments[0].id);
        }
      } catch (error) {
        console.error("Could not load study documents:", error);
      } finally {
        setLoadingDocuments(false);
      }
    }

    void loadDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  }

  function handleDocumentChange(documentId: string) {
    if (isTyping) return;

    setSelectedDocumentId(documentId);
    setConversationId("");
    setInput("");

    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);
  }

  async function sendMessage() {
    const question = input.trim();

    if (!question || isTyping || !selectedDocumentId) return;

    const userMessage: Message = {
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
          documentId: selectedDocumentId,
          conversationId: conversationId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to get a response from the AI service."
        );
      }

      // Save the conversation ID for the next message
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "The AI service returned an empty response.",
        timestamp: new Date(),
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        timestamp: new Date(),
      };

      setMessages((previous) => [...previous, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  function clearChat() {
    if (isTyping) return;

    setConversationId("");

    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);

    setInput("");
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white p-5">
        <div>
          <a href="/" className="text-sm text-blue-700 hover:underline">
            ← Back to Dashboard
          </a>

          <h1 className="mt-2 text-2xl font-bold">
            AI Study Assistant
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Your personal learning companion
          </p>
        </div>

        <button
          type="button"
          onClick={clearChat}
          disabled={isTyping}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          Clear chat
        </button>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col p-5">

        {/* PDF Selection */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label
            htmlFor="study-document"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Select your study material
          </label>

          <select
            id="study-document"
            value={selectedDocumentId}
            onChange={(event) =>
              handleDocumentChange(event.target.value)
            }
            disabled={loadingDocuments || isTyping || documents.length === 0}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
          >
            <option value="">
              {loadingDocuments
                ? "Loading your documents..."
                : documents.length === 0
                  ? "No PDFs uploaded yet"
                  : "Select a PDF"}
            </option>

            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.file_name}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-slate-500">
            The assistant will answer questions using your selected PDF.
          </p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 space-y-5 overflow-y-auto py-5">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-900"
                }`}
              >
                <p className="mb-2 text-xs font-bold">
                  {message.role === "user" ? "You" : "LearnAI Assistant"}
                </p>

                <p className="whitespace-pre-wrap text-sm leading-6">
                  {message.content}
                </p>

                <p className="mt-3 text-right text-xs opacity-70">
                  {mounted ? formatTime(message.timestamp) : ""}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                <p className="mb-2 text-xs font-bold text-slate-700">
                  LearnAI Assistant
                </p>
                <p className="animate-pulse text-sm text-slate-600">
                  AI is typing...
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="sticky bottom-0 rounded-2xl border border-slate-300 bg-white p-3 shadow-md">
          <form
            className="flex gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                selectedDocumentId
                  ? "Ask a question about your selected PDF..."
                  : "Select a PDF before asking a question..."
              }
              disabled={!selectedDocumentId || loadingDocuments}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping || !selectedDocumentId}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>

          <p className="mt-2 text-center text-xs text-slate-500">
            Press Enter to send your message
          </p>
        </div>
      </section>
    </main>
  );
}

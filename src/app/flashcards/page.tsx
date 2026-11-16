
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Document = {
  id: string;
  file_name: string;
};

type Flashcard = {
  front: string;
  back: string;
};

export default function FlashcardsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentId, setDocumentId] = useState("");
  const [topic, setTopic] = useState("");
  const [numCards, setNumCards] = useState(5);

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [originalCards, setOriginalCards] = useState<Flashcard[]>([]);
  const [title, setTitle] = useState("");

  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Load the student's uploaded PDFs.
  useEffect(() => {
    async function loadDocuments() {
      try {
        

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("Please log in to access your documents.");
          return;
        }

        const { data, error: documentError } = await supabase
          .from("documents")
          .select("id, file_name")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (documentError) {
          throw documentError;
        }

        const availableDocuments = (data || []) as Document[];

        setDocuments(availableDocuments);

        if (availableDocuments.length > 0) {
          setDocumentId(availableDocuments[0].id);
        }
      } catch (err) {
        console.error("Document loading error:", err);
        setError("Unable to load your uploaded PDFs.");
      } finally {
        setLoadingDocuments(false);
      }
    }

    loadDocuments();
  }, []);

  // Generate flashcards through our backend API.
  async function generateFlashcards() {
    if (!documentId) {
      setError("Please upload and select a PDF first.");
      return;
    }

    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          topic: topic.trim(),
          numCards,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Flashcard generation failed.");
      }

      if (!Array.isArray(data.flashcards?.cards) ||
          data.flashcards.cards.length === 0) {
        throw new Error("No flashcards were generated.");
      }

      const generatedCards: Flashcard[] = data.flashcards.cards;

      setCards(generatedCards);
      setOriginalCards(generatedCards);
      setTitle(data.flashcards.title || `Study Deck: ${topic}`);
      setCurrent(0);
      setFlipped(false);
    } catch (err) {
      console.error("Flashcard generation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating flashcards."
      );
    } finally {
      setGenerating(false);
    }
  }

  function nextCard() {
    setCurrent((previous) => Math.min(previous + 1, cards.length - 1));
    setFlipped(false);
  }

  function previousCard() {
    setCurrent((previous) => Math.max(previous - 1, 0));
    setFlipped(false);
  }

  function shuffleCards() {
    const shuffled = [...cards];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setCards(shuffled);
    setCurrent(0);
    setFlipped(false);
  }

  function restartDeck() {
    setCards([...originalCards]);
    setCurrent(0);
    setFlipped(false);
  }

  const card = cards[current];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </a>

        <header className="mb-8 mt-5">
          <p className="text-sm font-semibold text-blue-600">
            LEARNAI STUDY TOOLS
          </p>
          <h1 className="mt-2 text-3xl font-bold">Flashcards</h1>
          <p className="mt-2 text-slate-500">
            Generate personalized flashcards from your study material.
          </p>
        </header>

        {/* Flashcard generation form */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-bold">Generate Flashcards</h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a PDF and choose what you want to study.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Select your PDF
              </label>

              <select
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                disabled={loadingDocuments || documents.length === 0 || generating}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 outline-none focus:border-blue-500"
              >
                {loadingDocuments ? (
                  <option value="">Loading documents...</option>
                ) : documents.length === 0 ? (
                  <option value="">No uploaded PDFs found</option>
                ) : (
                  documents.map((document) => (
                    <option key={document.id} value={document.id}>
                      {document.file_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Topic
              </label>

              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Python Basics, DBMS, Operating Systems"
                maxLength={200}
                disabled={generating}
                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Number of flashcards
              </label>

              <select
                value={numCards}
                onChange={(e) => setNumCards(Number(e.target.value))}
                disabled={generating}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 outline-none focus:border-blue-500"
              >
                {[3, 5, 10, 15, 20].map((number) => (
                  <option key={number} value={number}>
                    {number} flashcards
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={generateFlashcards}
              disabled={generating || loadingDocuments || documents.length === 0}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? "Generating Flashcards..." : "Generate Flashcards"}
            </button>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </section>

        {/* Generated flashcard deck */}
        {cards.length > 0 && card && (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold">{title}</h2>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-600">
                    Card {current + 1} of {cards.length}
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    {flipped ? "Answer" : "Question"}
                  </span>
                </div>
              </div>

              <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${((current + 1) / cards.length) * 100}%`,
                  }}
                />
              </div>

              <button
                onClick={() => setFlipped((previous) => !previous)}
                className="flex min-h-72 w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-700 p-8 text-center text-white shadow-lg transition hover:scale-[1.01]"
              >
                <span className="mb-5 text-xs font-semibold uppercase tracking-widest text-blue-200">
                  {flipped ? "Answer" : "Question"}
                </span>

                <span className="text-xl font-semibold leading-relaxed md:text-2xl">
                  {flipped ? card.back : card.front}
                </span>

                <span className="mt-8 text-sm text-blue-200">
                  Click to {flipped ? "see question" : "reveal answer"}
                </span>
              </button>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={previousCard}
                  disabled={current === 0}
                  className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <button
                  onClick={() => setFlipped((previous) => !previous)}
                  className="rounded-lg bg-slate-100 px-5 py-3 font-medium text-slate-700 hover:bg-slate-200"
                >
                  Flip Card
                </button>

                <button
                  onClick={nextCard}
                  disabled={current === cards.length - 1}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3 border-t border-slate-100 pt-6">
                <button
                  onClick={shuffleCards}
                  className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  🔀 Shuffle Cards
                </button>

                <button
                  onClick={restartDeck}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  ↻ Restart Deck
                </button>
              </div>
            </section>

            <p className="mt-5 text-center text-sm text-slate-500">
              Tip: Try answering the question before revealing the answer.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

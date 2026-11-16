
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type StudyDocument = {
  id: string;
  file_name: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type Quiz = {
  title: string;
  questions: QuizQuestion[];
};

export default function QuizPage() {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

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
      } catch (err) {
        console.error("Document loading error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not load your documents."
        );
      } finally {
        setLoadingDocuments(false);
      }
    }

    void loadDocuments();
  }, []);

  // Generate a quiz using the Dify backend.
  async function generateQuiz() {
    if (!selectedDocumentId || !topic.trim()) {
      setError("Please select a PDF and enter a topic.");
      return;
    }

    setGenerating(true);
    setError("");
    setQuiz(null);
    setFinished(false);
    setCurrent(0);
    setAnswers([]);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          topic: topic.trim(),
          numQuestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Quiz generation failed.");
      }

      if (!data.quiz || !Array.isArray(data.quiz.questions)) {
        throw new Error("The server returned an invalid quiz.");
      }

      if (data.quiz.questions.length === 0) {
        throw new Error("No questions were generated. Try another topic.");
      }

      setQuiz(data.quiz);
      setAnswers(Array(data.quiz.questions.length).fill(-1));
      setCurrent(0);
      setFinished(false);
    } catch (err) {
      console.error("Quiz generation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating your quiz."
      );
    } finally {
      setGenerating(false);
    }
  }

  const questions = quiz?.questions ?? [];
  const question = questions[current];

  const score = questions.reduce(
    (total, item, index) =>
      total + (answers[index] === item.correctAnswer ? 1 : 0),
    0
  );

  const answeredCount = answers.filter((answer) => answer !== -1).length;

  function selectAnswer(optionIndex: number) {
    if (finished) return;

    setAnswers((previous) =>
      previous.map((answer, index) =>
        index === current ? optionIndex : answer
      )
    );
  }

  function submitQuiz() {
    if (answeredCount !== questions.length) return;
    setFinished(true);
  }

  function resetQuiz() {
    setQuiz(null);
    setAnswers([]);
    setCurrent(0);
    setFinished(false);
    setError("");
  }

  function getPerformance() {
    const percentage = (score / questions.length) * 100;

    if (percentage === 100) return "Excellent! Perfect score!";
    if (percentage >= 70) return "Great work! You understand the topic.";
    if (percentage >= 40) return "Good effort! Keep practising.";
    return "Keep learning. You will improve with practice!";
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </a>

        <header className="mb-8 mt-5">
          <p className="text-sm font-medium text-blue-600">
            LEARNAI PRACTICE
          </p>
          <h1 className="mt-2 text-3xl font-bold">AI Knowledge Quiz</h1>
          <p className="mt-2 text-slate-500">
            Generate personalized MCQs from your uploaded study material.
          </p>
        </header>

        {/* Quiz Generation Form */}
        {!quiz && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-bold">
              Generate your quiz
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Choose your study material and tell AI what you want to practise.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="quiz-document"
                  className="mb-2 block text-sm font-semibold"
                >
                  Select study material
                </label>

                <select
                  id="quiz-document"
                  value={selectedDocumentId}
                  onChange={(event) =>
                    setSelectedDocumentId(event.target.value)
                  }
                  disabled={loadingDocuments || generating || documents.length === 0}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 disabled:opacity-60"
                >
                  <option value="">
                    {loadingDocuments
                      ? "Loading documents..."
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
              </div>

              <div>
                <label
                  htmlFor="quiz-topic"
                  className="mb-2 block text-sm font-semibold"
                >
                  Quiz topic
                </label>

                <input
                  id="quiz-topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="e.g. Python Basics, DBMS, Operating Systems"
                  maxLength={200}
                  disabled={generating}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="question-count"
                  className="mb-2 block text-sm font-semibold"
                >
                  Number of questions
                </label>

                <select
                  id="question-count"
                  value={numQuestions}
                  onChange={(event) =>
                    setNumQuestions(Number(event.target.value))
                  }
                  disabled={generating}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 disabled:opacity-60"
                >
                  {[3, 5, 10, 15, 20].map((count) => (
                    <option key={count} value={count}>
                      {count} Questions
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={() => void generateQuiz()}
                disabled={
                  generating ||
                  loadingDocuments ||
                  documents.length === 0 ||
                  !selectedDocumentId ||
                  !topic.trim()
                }
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating ? "Generating your quiz..." : "Generate AI Quiz"}
              </button>

              {generating && (
                <p className="text-center text-sm text-slate-500">
                  AI is analysing your study material and preparing questions.
                  This may take a little time.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Quiz Results */}
        {quiz && finished && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="text-5xl">🎉</div>

            <h2 className="mt-4 text-2xl font-bold">
              Quiz completed!
            </h2>

            <p className="mt-2 text-slate-500">{quiz.title}</p>

            <p className="mt-5 text-4xl font-bold text-blue-600">
              {Math.round((score / questions.length) * 100)}%
            </p>

            <p className="mt-2 text-lg text-slate-600">
              Your score: <strong>{score} / {questions.length}</strong>
            </p>

            <p className="mt-3 text-slate-600">
              {getPerformance()}
            </p>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <p>Total questions: {questions.length}</p>
              <p className="mt-1">Correct answers: {score}</p>
              <p className="mt-1">
                Incorrect answers: {questions.length - score}
              </p>
            </div>

            <button
              onClick={resetQuiz}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Generate Another Quiz
            </button>
          </section>
        )}

        {/* Active Quiz */}
        {quiz && !finished && question && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">{quiz.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Question {current + 1} of {questions.length}
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                {answeredCount} / {questions.length} answered
              </span>
            </div>

            <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${((current + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <h3 className="mb-6 text-xl font-bold leading-relaxed">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = answers[current] === index;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectAnswer(index)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-slate-200 text-slate-800 hover:border-blue-400"
                    }`}
                  >
                    <span className="mr-3 font-semibold">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setCurrent((previous) => previous - 1)}
                disabled={current === 0}
                className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {current < questions.length - 1 ? (
                <button
                  onClick={() => setCurrent((previous) => previous + 1)}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={submitQuiz}
                  disabled={answeredCount !== questions.length}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Submit Quiz
                </button>
              )}
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Answer every question before submitting your quiz.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

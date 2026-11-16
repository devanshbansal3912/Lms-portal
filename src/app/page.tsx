"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UploadedDocument = {
  id: string;
  name: string;
  size: number;
  status: string;
  createdAt: string;
};

const navigationLinks = [
  { label: "Dashboard", href: "/", icon: "⌂" },
  { label: "My Documents", href: "/documents", icon: "▤" },
  { label: "AI Assistant", href: "/chat", icon: "✧" },
  { label: "Quizzes", href: "/quiz", icon: "▣" },
  { label: "Flashcards", href: "/flashcards", icon: "▧" },
];

const quickActions = [
  {
    title: "Upload Study Material",
    description: "Add PDFs to your personal library.",
    icon: "↑",
    href: "/documents",
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "AI Study Assistant",
    description: "Ask questions and explore concepts.",
    icon: "✧",
    href: "/chat",
    color: "bg-violet-50 text-violet-700",
  },
  {
    title: "Practice Quiz",
    description: "Test your knowledge with MCQs.",
    icon: "✓",
    href: "/quiz",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Revise Flashcards",
    description: "Review concepts and key points.",
    icon: "▤",
    href: "/flashcards",
    color: "bg-amber-50 text-amber-700",
  },
];

export default function Home() {
  const router = useRouter();

  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Student");

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      window.alert("Unable to log out. Please try again.");
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  // Load logged-in student's name
  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!error && data.user) {
        setUserName(
          data.user.user_metadata?.full_name ||
            data.user.email ||
            "Student"
        );
      }
    }

    loadUser();
  }, []);

  // Load documents directly from Supabase
  useEffect(() => {
    let isActive = true;

    async function loadDocuments() {
      setDocumentsLoading(true);
      setDocumentsError("");

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        if (isActive) {
          setDocuments([]);
          setDocumentsError(
            "Please sign in again to view your documents."
          );
          setDocumentsLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("documents")
        .select(
          "id, user_id, file_name, file_size, status, created_at"
        )
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (!isActive) return;

      if (error) {
        console.error(
          "Unable to load dashboard documents:",
          error
        );

        setDocuments([]);
        setDocumentsError(
          "We couldn't load your documents. Please refresh and try again."
        );
      } else {
        const mappedDocuments: UploadedDocument[] = (
          data ?? []
        ).map((doc) => ({
          id: doc.id,
          name: doc.file_name,
          size: doc.file_size ?? 0,
          status: doc.status ?? "uploaded",
          createdAt: doc.created_at,
        }));

        setDocuments(mappedDocuments);
      }

      setDocumentsLoading(false);
    }

    loadDocuments();

    window.addEventListener("documentsUpdated", loadDocuments);

    return () => {
      isActive = false;
      window.removeEventListener(
        "documentsUpdated",
        loadDocuments
      );
    };
  }, []);

  const recentDocuments = documents.slice(0, 4);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 md:flex">

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4 text-white md:hidden">
        <a href="/" className="text-2xl font-bold tracking-tight">
          LearnAI<span className="text-blue-400">.</span>
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="rounded-lg border border-slate-700 px-3 py-2 text-xl hover:bg-slate-800"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="fixed left-0 right-0 top-[65px] z-40 border-b border-slate-800 bg-slate-950 p-5 text-white shadow-xl md:hidden"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <div className="space-y-2">
            {navigationLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  index === 0
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </a>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="font-semibold">Your AI Study Space</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Learn smarter with your personal AI assistant.
            </p>
          </div>
        </nav>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 bg-slate-950 p-6 text-white md:block md:min-h-screen">
        <a
          href="/"
          className="mb-12 block text-2xl font-bold tracking-tight"
        >
          LearnAI<span className="text-blue-400">.</span>
        </a>

        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>

        <nav className="space-y-2">
          {navigationLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
                index === 0
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="mt-14 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-xl text-blue-400">
            ✧
          </div>

          <p className="font-semibold">Your AI Study Space</p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Learn smarter with your personal AI assistant.
          </p>

          <a
            href="/chat"
            className="mt-4 inline-block text-sm font-semibold text-blue-400 hover:text-blue-300"
          >
            Start learning →
          </a>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-5">
          <p className="text-xs text-slate-500">
            LearnAI · Student Workspace
          </p>
        </div>
      </aside>

      {/* Main Dashboard */}
      <section className="min-w-0 flex-1 p-5 sm:p-7 md:p-10">

        {/* Page Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">
              YOUR PERSONAL LEARNING SPACE
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Everything you need to make learning smarter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {userName.charAt(0).toUpperCase()}
              </span>

              <div>
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-slate-500">
                  My Workspace
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Welcome Banner */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 p-7 text-white shadow-xl shadow-indigo-200/50 sm:p-10">

          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border-[35px] border-white/10" />

          <div className="pointer-events-none absolute -bottom-36 right-36 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-blue-100">
              <span>✧</span>
              YOUR AI-POWERED LEARNING COMPANION
            </div>

            <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Learn smarter,
              <br className="hidden sm:block" /> not harder.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
              Bring your study materials, AI assistance, quizzes and
              flashcards together in one learning workspace.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/documents"
                className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                + Upload Material
              </a>

              <a
                href="/chat"
                className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
              >
                Ask AI Assistant →
              </a>
            </div>
          </div>

          <div className="relative z-10 mt-8 flex flex-wrap gap-5 border-t border-white/20 pt-5 text-sm text-blue-100">
            <span>✓ Personal study space</span>
            <span>✓ Smart revision tools</span>
            <span>✓ PDF learning</span>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Your Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                A snapshot of your learning workspace.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {/* Total Documents */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                  ▤
                </div>

                <span className="text-xs font-medium text-slate-400">
                  LIBRARY
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Total Documents
              </p>

              <h3 className="mt-1 text-3xl font-bold text-slate-950">
                {documentsLoading ? "..." : documents.length}
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                Uploaded study materials
              </p>
            </div>

            {/* Quizzes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                  ✓
                </div>

                <span className="text-xs font-medium text-slate-400">
                  PRACTICE
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Quizzes
              </p>

              <h3 className="mt-1 text-3xl font-bold text-slate-950">
                0
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                Quiz history integration pending
              </p>
            </div>

            {/* Flashcards */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl text-violet-600">
                  ▧
                </div>

                <span className="text-xs font-medium text-slate-400">
                  REVISION
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Flashcards
              </p>

              <h3 className="mt-1 text-3xl font-bold text-slate-950">
                0
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                Flashcard history integration pending
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Jump straight into what you want to do.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <a
                key={action.title}
                href={action.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${action.color}`}
                >
                  {action.icon}
                </div>

                <h3 className="mt-4 font-bold text-slate-900 transition group-hover:text-blue-700">
                  {action.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {action.description}
                </p>

                <p className="mt-4 text-sm font-semibold text-blue-600">
                  Open tool →
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Recent Documents */}
        <section
          id="documents"
          className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
  <h2 className="text-xl font-bold text-slate-900">
    Recent Documents
  </h2>

  <button
    onClick={() => window.dispatchEvent(new Event("documentsUpdated"))}
    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
  >
    Refresh
  </button>
</div>

              <p className="mt-1 text-sm text-slate-500">
                Continue learning from your uploaded material.
              </p>
            </div>

            <a
              href="/documents"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              View all →
            </a>
          </div>

          {documentsLoading ? (
            <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              Loading your documents...
            </div>
          ) : documentsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
              <p className="text-sm font-medium text-red-700">
                {documentsError}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("documentsUpdated"))
                }
                className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-700">
                ▤
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                Your library is waiting!
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Upload your first study PDF and start building your
                personal learning library.
              </p>

              <a
                href="/documents"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Upload your first PDF
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <a
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl">
                      📕
                    </div>

                    <div className="min-w-0">
                      <p className="break-all font-semibold text-slate-900 group-hover:text-blue-700">
                        {doc.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {(doc.size / (1024 * 1024)).toFixed(2)} MB · PDF
                        {doc.createdAt
                          ? ` · ${new Date(doc.createdAt).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        doc.status.toLowerCase() === "failed"
  ? "bg-red-50 text-red-700"
  : ["processed", "ready"].includes(doc.status.toLowerCase())
  ? "bg-emerald-50 text-emerald-700"
  : doc.status.toLowerCase() === "processing"
  ? "bg-amber-50 text-amber-700"
  : doc.status.toLowerCase() === "uploaded"
  ? "bg-blue-50 text-blue-700"
  : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {doc.status}
                    </span>

                    <span className="text-sm font-semibold text-blue-600">
                      Open →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-6 text-xs text-slate-400">
          <p>© 2026 LearnAI. Your personal AI learning space.</p>
          <p>Learn smarter. Grow faster.</p>
        </footer>
      </section>
    </main>
  );
}
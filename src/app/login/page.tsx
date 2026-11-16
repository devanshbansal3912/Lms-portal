
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!email.trim() || !password) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("Login successful! Redirecting...");
      setMessageType("success");

      router.push("/");
      router.refresh();
    } catch {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">

        {/* Left branding section */}
        <section className="flex flex-col justify-center bg-gradient-to-br from-blue-700 to-indigo-700 p-10 text-white">
          <Link href="/" className="text-3xl font-bold">
            LearnAI.
          </Link>

          <h1 className="mt-12 text-4xl font-bold leading-tight">
            Welcome back to smarter learning.
          </h1>

          <p className="mt-5 leading-7 text-blue-100">
            Your personal AI-powered learning space.
            Upload notes, ask questions and prepare
            for exams more efficiently.
          </p>

          <div className="mt-10 rounded-xl bg-white/10 p-5">
            <p className="font-semibold">Learn. Practice. Improve.</p>
            <p className="mt-2 text-sm text-blue-100">
              Everything you need for smarter studying
              in one place.
            </p>
          </div>
        </section>

        {/* Login form */}
        <section className="flex flex-col justify-center p-8 sm:p-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Sign in
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Enter your details to access your account.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-400 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                minLength={8}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="accent-blue-600" />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => {
                  setMessage("Password recovery will be configured separately.");
                  setMessageType("error");
                }}
                className="font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {message && (
              <p
                role="status"
                className={`rounded-lg p-3 text-sm ${
                  messageType === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:underline">
              Create account
            </Link>
          </p>

          <Link
            href="/"
            className="mt-6 text-center text-sm text-slate-500 hover:text-blue-600"
          >
            ← Back to dashboard
          </Link>
        </section>
      </div>
    </main>
  );
}

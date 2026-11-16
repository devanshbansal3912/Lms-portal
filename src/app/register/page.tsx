
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setMessage("Please fill in all fields.");
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

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }

      setMessage(
        "Account created successfully! Please check your email to confirm your account before signing in."
      );
      setMessageType("success");
    } catch {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle =
    "w-full rounded-lg border border-slate-400 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

  return (
    <main className="min-h-screen grid md:grid-cols-2 bg-white">

      {/* Left section */}
      <section className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-700 to-indigo-900 text-white">
        <h1 className="text-4xl font-bold mb-4">Join LearnAI</h1>

        <p className="text-lg text-blue-100">
          Start your personalized learning journey with AI-powered study tools.
        </p>

        <div className="mt-10 space-y-4 text-blue-100">
          <p>✓ Organize your study materials</p>
          <p>✓ Learn with your AI assistant</p>
          <p>✓ Create quizzes and flashcards</p>
        </div>
      </section>

      {/* Right section */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <Link href="/" className="text-sm text-blue-700 hover:underline">
            ← Back to dashboard
          </Link>

          <h2 className="text-3xl font-bold text-slate-900 mt-8">
            Create your account
          </h2>

          <p className="text-slate-600 mt-2 mb-8">
            Sign up to get started with LearnAI.
          </p>

          <form onSubmit={handleRegister} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Full name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className={inputStyle}
                spellCheck={false}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Email address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputStyle}
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Confirm password
              </label>

              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputStyle}
                required
              />
            </div>

            {message && (
              <p
                role="status"
                className={`rounded-lg p-3 text-sm ${
                  messageType === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <p className="text-center text-sm text-slate-700 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-700 hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </section>
    </main>
  );
}

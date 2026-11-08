"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("If an account exists for this email, a password reset link has been sent. Please check your inbox.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-[#d6b46a]/20 bg-[#111111] p-8 shadow-2xl shadow-black">
        <Link href="/" className="mb-10 block text-center text-3xl font-bold tracking-[0.25em] text-[#d6b46a]">
          TAPLINK
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Forgot Password?</h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your account email and we will send you a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#d6b46a]"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#d6b46a] px-4 py-3 font-semibold text-black transition hover:bg-[#e5c782] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link href="/login" className="mt-7 block text-center text-sm text-[#d6b46a] hover:underline">
          Back to Sign In
        </Link>
      </section>
    </main>
  );
}

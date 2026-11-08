"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setSuccess("Registration successful. Please check your email to confirm your account before signing in.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-[#d6b46a]/20 bg-[#111111] p-8 shadow-2xl shadow-black">
        <Link href="/" className="mb-10 block text-center text-3xl font-bold tracking-[0.25em] text-[#d6b46a]">
          TAPLINK
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Create Account</h1>
          <p className="mt-2 text-sm text-gray-400">
            Start building your digital identity.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
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

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#d6b46a]"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm text-gray-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#d6b46a]"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#d6b46a] px-4 py-3 font-semibold text-black transition hover:bg-[#e5c782] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#d6b46a] hover:underline">
            Sign In
          </Link>
        </p>

        <Link href="/" className="mt-6 block text-center text-xs text-gray-500 hover:text-[#d6b46a]">
          Back to Home
        </Link>
      </section>
    </main>
  );
}

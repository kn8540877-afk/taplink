"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-[#d6b46a]/20 bg-[#111111] p-8 shadow-2xl shadow-black">
        <Link href="/" className="mb-10 block text-center text-3xl font-bold tracking-[0.25em] text-[#d6b46a]">
          TAPLINK
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to manage your digital identity.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm text-gray-300">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-[#d6b46a] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#d6b46a]"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#d6b46a] px-4 py-3 font-semibold text-black transition hover:bg-[#e5c782] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-[#d6b46a] hover:underline">
            Create Account
          </Link>
        </p>

        <Link href="/" className="mt-6 block text-center text-xs text-gray-500 hover:text-[#d6b46a]">
          Back to Home
        </Link>
      </section>
    </main>
  );
}




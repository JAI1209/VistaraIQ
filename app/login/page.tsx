"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "oauth_not_configured") {
      setError("OAuth is not configured yet.");
    }
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string; token?: string }
        | null;
      if (!res.ok) {
        setError(data?.error ?? "Login failed");
        return;
      }

      if (data?.token) {
        localStorage.setItem("vistara_token", data.token);
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090D18] px-4">
      <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-[-8rem] right-[-6rem] h-80 w-80 rounded-full bg-indigo-500/20 blur-[130px]" />

      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <Logo size="lg" className="text-center" />
        <p className="mt-2 text-center text-sm text-slate-300">Secure access to your intelligence workspace</p>

        <div className="mt-6 grid grid-cols-2 rounded-xl border border-slate-700 bg-[#0F1629] p-1 text-sm">
          <Link href="/login" className="rounded-lg bg-blue-500 px-3 py-2 text-center font-medium text-white">
            Login
          </Link>
          <Link href="/register" className="rounded-lg px-3 py-2 text-center text-slate-300 transition hover:text-white">
            Register
          </Link>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-700 bg-[#0F1629] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-700 bg-[#0F1629] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              required
            />
          </div>

          {error ? <p className="text-sm text-rose-400/90">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(59,130,246,0.45)] transition hover:from-blue-400 hover:to-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.65)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.18em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href="/api/auth/oauth/google"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-[#0E1527] px-4 py-2.5 text-sm text-slate-200 transition hover:border-slate-400 hover:text-white"
          >
            <GoogleIcon />
            Sign in with Google
          </a>
          <a
            href="/api/auth/oauth/github"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-[#0E1527] px-4 py-2.5 text-sm text-slate-200 transition hover:border-slate-400 hover:text-white"
          >
            <GithubIcon />
            Sign in with GitHub
          </a>
        </div>

        <Link
          href="/dashboard?explore=1"
          className="mt-4 block rounded-xl border border-blue-400/40 bg-blue-500/10 px-4 py-2.5 text-center text-sm font-medium text-blue-200 transition hover:border-blue-300 hover:text-white"
        >
          Explore Dashboard
        </Link>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M21.6 12.2c0-.7-.1-1.3-.2-2H12v3.8h5.4c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 3-4.2 3-7.1Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-1 6.6-2.7l-3.1-2.4c-.9.6-2 .9-3.5.9-2.7 0-4.9-1.8-5.7-4.2H3.1V16c1.7 3.6 5.2 6 8.9 6Z" fill="#34A853" />
      <path d="M6.3 13.6c-.2-.6-.3-1.1-.3-1.6s.1-1.1.3-1.6V8H3.1C2.4 9.3 2 10.6 2 12s.4 2.7 1.1 4l3.2-2.4Z" fill="#FBBC05" />
      <path d="M12 6.2c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 3.3 14.7 2.2 12 2.2c-3.7 0-7.2 2.4-8.9 5.8l3.2 2.4C7.1 8 9.3 6.2 12 6.2Z" fill="#EA4335" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.8 8.3 6.7 9.7.5.1.7-.2.7-.5v-1.8c-2.7.6-3.2-1.2-3.2-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.1-.2-4.3-1.1-4.3-4.8 0-1 .3-1.8.8-2.5-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.6 1a8.8 8.8 0 0 1 4.8 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.5.5.7.8 1.5.8 2.5 0 3.7-2.2 4.6-4.3 4.8.4.3.7 1 .7 2v2.9c0 .3.2.6.7.5 3.9-1.4 6.7-5.2 6.7-9.7C22 6.6 17.5 2 12 2Z" />
    </svg>
  );
}

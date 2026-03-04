"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function HomePage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsExiting(true), 7200);
    const routeTimer = setTimeout(() => {
      router.replace("/login");
    }, 8000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(routeTimer);
    };
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070B14] px-6">
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-[140px]" />

      <section
        className={`animate-fade-in text-center transition-opacity duration-700 ${isExiting ? "opacity-0" : "opacity-100"}`}
      >
        <Logo size="xl" />
        <p className="mt-5 text-sm font-medium tracking-[0.18em] text-slate-300 sm:text-base">
          Expand Intelligence. Build Smarter.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard?explore=1"
            className="rounded-xl border border-blue-400/40 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:border-blue-300 hover:text-white"
          >
            Explore Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-white/35 hover:text-white"
          >
            Login / Register
          </Link>
        </div>
      </section>
    </main>
  );
}

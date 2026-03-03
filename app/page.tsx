"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      </section>
    </main>
  );
}

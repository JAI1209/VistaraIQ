import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const navItems = [
  { label: "Overview", href: "/dashboard?tab=overview" },
  { label: "Blueprints", href: "/dashboard?tab=blueprints" },
  { label: "Analytics", href: "/dashboard?tab=analytics" },
  { label: "Settings", href: "/dashboard?tab=settings" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-white/10 bg-[#0B1020] px-6 py-8">
          <Logo size="md" />

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col">
          <header className="flex items-center justify-between border-b border-white/10 bg-[#0B0F1A]/70 px-6 py-4 backdrop-blur-md">
            <p className="text-sm text-slate-300">Workspace / Dashboard</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-400/50 bg-blue-500/20 text-sm font-semibold">
              U
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

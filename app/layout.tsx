"use client";

import "./globals.css";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/content", label: "Content Studio", icon: "✍️" },
  { href: "/scheduler", label: "Scheduler", icon: "📅" },
  { href: "/boosts", label: "Boosts", icon: "🚀" },
  { href: "/blog", label: "Blog", icon: "📝" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/referrals", label: "Referrals", icon: "🔗" },
  { href: "/video", label: "Video Studio", icon: "🎬" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/leads", label: "Leads & CRM", icon: "👥" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            pathname === item.href
              ? "bg-blue-600 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-950 text-white min-h-screen">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
          <div>
            <span className="font-bold text-white">🎯 MarketPilot</span>
            <span className="text-xs text-gray-500 ml-2">ReportAfrica</span>
          </div>
          <button onClick={() => setOpen(!open)} className="p-2 rounded-lg bg-gray-800 text-white">
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile drawer overlay */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 p-5 flex flex-col z-50" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6">
                <h1 className="text-lg font-bold">🎯 MarketPilot</h1>
                <p className="text-xs text-gray-500 mt-1">Autonomous Marketing Engine</p>
              </div>
              <nav className="flex flex-col gap-1 flex-1">
                <NavLinks />
              </nav>
              <div className="pt-4 border-t border-gray-800 text-xs text-gray-500">
                <p>App: ReportAfrica</p>
                <p className="text-green-400 mt-1">● System Active</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex w-64 bg-gray-900 border-r border-gray-800 p-6 flex-col min-h-screen sticky top-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-white">🎯 MarketPilot</h1>
              <p className="text-xs text-gray-500 mt-1">Autonomous Marketing Engine</p>
            </div>
            <nav className="flex flex-col gap-1 flex-1">
              <NavLinks />
            </nav>
            <div className="pt-6 border-t border-gray-800 text-xs text-gray-500">
              <p>App: ReportAfrica</p>
              <p className="text-green-400 mt-1">● System Active</p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-4 lg:p-8 overflow-auto min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

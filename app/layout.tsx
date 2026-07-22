"use client";

import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [client, setClient] = useState<{ name: string; plan: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("mp_client");
    if (stored) {
      const parsed = JSON.parse(stored);
      setClient(parsed);
      setIsAdmin(parsed.plan === "agency");
    }
  }, []);

  const handleLogout = () => {
    document.cookie = "mp_token=; path=/; max-age=0";
    localStorage.removeItem("mp_client");
    router.push("/login");
  };

  const isAuthPage = pathname === "/login" || pathname === "/forgot-password" || pathname?.startsWith("/reset-password");
  if (isAuthPage) return (
    <html lang="en"><body className="bg-gray-950 text-white min-h-screen">{children}</body></html>
  );

  const navItems = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/content", label: "Content Studio", icon: "✍️" },
    { href: "/scheduler", label: "Scheduler", icon: "📅" },
    { href: "/boosts", label: "Boosts", icon: "🚀" },
    { href: "/blog", label: "Blog", icon: "📝" },
    { href: "/analytics", label: "Analytics", icon: "📈" },
    { href: "/referrals", label: "Referrals", icon: "🔗" },
    { href: "/video", label: "Video Studio", icon: "🎬" },
    { href: "/whatsapp", label: "WhatsApp", icon: "💬" },
    { href: "/calendar", label: "Calendar", icon: "📅" },
    { href: "/leads", label: "Leads & CRM", icon: "👥" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin Panel", icon: "⚙️" }] : []),
  ];

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
                <button onClick={handleLogout} className="mt-3 text-red-400 hover:text-red-300 transition-colors">Sign out</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex w-64 bg-gray-900 border-r border-gray-800 p-6 flex-col h-screen sticky top-0 overflow-y-auto">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-white">🎯 MarketPilot</h1>
              <p className="text-xs text-gray-500 mt-1">Autonomous Marketing Engine</p>
            </div>
            <nav className="flex flex-col gap-1 flex-1">
              <NavLinks />
            </nav>
            <div className="pt-6 border-t border-gray-800 text-xs text-gray-500">
              {client && <p className="text-white font-medium truncate">{client.name}</p>}
              {client && <p className="text-blue-400 capitalize">{client.plan} plan</p>}
              <p className="text-green-400 mt-1">● System Active</p>
              <button onClick={handleLogout} className="mt-3 text-red-400 hover:text-red-300 transition-colors">Sign out</button>
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

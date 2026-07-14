import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MarketPilot",
  description: "Autonomous marketing engine for ReportAfrica",
};

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/content", label: "Content Studio", icon: "✍️" },
  { href: "/scheduler", label: "Scheduler", icon: "📅" },
  { href: "/boosts", label: "Boosts", icon: "🚀" },
  { href: "/blog", label: "Blog", icon: "📝" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white">🎯 MarketPilot</h1>
            <p className="text-xs text-gray-500 mt-1">Autonomous Marketing Engine</p>
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-6 border-t border-gray-800">
            <div className="text-xs text-gray-500">
              <p>App: ReportAfrica</p>
              <p className="text-green-400 mt-1">● System Active</p>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </body>
    </html>
  );
}

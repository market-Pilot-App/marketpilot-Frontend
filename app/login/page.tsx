"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      document.cookie = `mp_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      localStorage.setItem("mp_client", JSON.stringify(data.client));
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">🎯 MarketPilot</h1>
          <p className="text-gray-400 text-sm mt-2">Autonomous Marketing Engine</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Sign in to your dashboard</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all">
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/forgot-password" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">Forgot your password?</a>
          </div>
        </div>
        <p className="text-center text-gray-600 text-xs mt-6">© 2026 MarketPilot · Tradilink Africa Solution Limited</p>
      </div>
    </div>
  );
}

"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed");
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="text-center">
      <p className="text-red-400">Invalid reset link.</p>
      <a href="/forgot-password" className="text-blue-400 text-sm mt-4 inline-block">Request a new one</a>
    </div>
  );

  return done ? (
    <div className="text-center">
      <div className="text-4xl mb-4">✅</div>
      <h2 className="text-xl font-bold text-white mb-2">Password reset!</h2>
      <p className="text-gray-400 text-sm">Redirecting to login...</p>
    </div>
  ) : (
    <>
      <h2 className="text-xl font-bold text-white mb-6">Set a new password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">New password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 8 characters"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Confirm password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Repeat password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        {error && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all">
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">🎯 MarketPilot</h1>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

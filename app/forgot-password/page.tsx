"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`${API}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">🎯 MarketPilot</h1>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm">If that email exists, a reset link has been sent. Check your inbox.</p>
              <a href="/login" className="inline-block mt-6 text-sm text-blue-400 hover:underline">← Back to login</a>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Forgot your password?</h2>
              <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500" />
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <div className="mt-4 text-center">
                <a href="/login" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">← Back to login</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

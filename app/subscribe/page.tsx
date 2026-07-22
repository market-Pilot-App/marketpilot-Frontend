"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://marketpilot-backend.onrender.com";

export default function SubscribePage() {
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [campaignName, setCampaignName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("c") || "";
    setCampaignName(decodeURIComponent(name));
  }, []);

  const displayName = campaignName || "MarketPilot";
  const tagline = campaignName
    ? `Get the latest updates from ${campaignName}.`
    : "Get the latest news, tips & updates.";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email && !form.whatsapp) return alert("Provide email or WhatsApp");
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "subscribe_page" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("done");
    } catch (e) {
      console.error("Subscribe error:", e);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📰 {displayName}</h1>
          <p className="text-gray-400">{tagline}</p>
        </div>

        {status === "done" ? (
          <div className="bg-green-900/30 border border-green-700 rounded-xl p-8 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <h2 className="text-xl font-bold text-white mb-2">You're in!</h2>
            <p className="text-gray-400 text-sm">We'll keep you updated with the latest from {displayName}.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Your Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">WhatsApp Number <span className="text-gray-600">(optional)</span></label>
              <input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+234 800 000 0000"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-semibold text-white"
            >
              {status === "loading" ? "Joining..." : "🚀 Join Free"}
            </button>
            {status === "error" && <p className="text-red-400 text-xs text-center">Something went wrong. Try again.</p>}
            <p className="text-xs text-gray-600 text-center">No spam. Unsubscribe anytime.</p>
          </form>
        )}
      </div>
    </div>
  );
}
